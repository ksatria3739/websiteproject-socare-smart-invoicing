import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  DatabaseState,
  InvoiceData,
  CatalogItemData,
  CompanySettingData,
  PaymentMethodType,
  TransactionLogData,
} from './types';
import { getInitialDatabaseState } from './seed';
import { generateInvoiceTokens } from './crypto';

const TMP_DB_PATH = path.join(os.tmpdir(), 'socare-smart-invoicing-db-v1.json');

declare global {
  // eslint-disable-next-line no-var
  var __SOCARE_DB_STATE__: DatabaseState | undefined;
}

export function getServerStore(): DatabaseState {
  if (globalThis.__SOCARE_DB_STATE__) {
    return globalThis.__SOCARE_DB_STATE__;
  }

  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseState;
      if (parsed && Array.isArray(parsed.invoices) && Array.isArray(parsed.catalog)) {
        globalThis.__SOCARE_DB_STATE__ = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore read errors in restricted serverless environments and use initial seed
  }

  const initial = getInitialDatabaseState();
  globalThis.__SOCARE_DB_STATE__ = initial;
  persistServerStore(initial);
  return initial;
}

export function persistServerStore(state: DatabaseState): void {
  globalThis.__SOCARE_DB_STATE__ = state;
  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // Ignore write errors if filesystem is read-only outside /tmp
  }
}

export function findInvoiceByTokenOrId(tokenOrId: string): InvoiceData | undefined {
  const store = getServerStore();
  return store.invoices.find(
    (inv) =>
      inv.viewToken === tokenOrId ||
      inv.checkoutToken === tokenOrId ||
      inv.id === tokenOrId ||
      inv.invoiceNumber.toLowerCase() === tokenOrId.toLowerCase()
  );
}

export interface CreateInvoicePayload {
  invoiceNumber?: string;
  clientFullName: string;
  clientNickname: string;
  clientEmail?: string;
  clientPhone?: string;
  issueDate: string;
  dueDate: string;
  taxAmount?: number;
  discountAmount?: number;
  allowCreditCard?: boolean;
  allowBankTransfer?: boolean;
  notes?: string;
  items: Array<{
    catalogId?: string | null;
    skuCode?: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export function createNewInvoice(payload: CreateInvoicePayload): InvoiceData {
  const store = getServerStore();
  const now = new Date().toISOString();

  const seq = 1295 + store.invoices.length;
  const nowDate = new Date();
  const mm = String(nowDate.getMonth() + 1).padStart(2, '0');
  const yyyy = nowDate.getFullYear();
  const prefix = store.company.invoicePrefix || 'INV/SGI';

  const invoiceNumber =
    payload.invoiceNumber?.trim() || `${prefix}/${mm}/${yyyy}/${seq}`;

  const { viewToken, checkoutToken } = generateInvoiceTokens(
    invoiceNumber,
    payload.clientFullName,
    now
  );

  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const items = payload.items.map((item, idx) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    return {
      id: `item_${Date.now()}_${idx}`,
      invoiceId,
      catalogId: item.catalogId || null,
      skuCode: item.skuCode || undefined,
      description: item.description,
      quantity: qty,
      unitPrice,
      totalPrice: qty * unitPrice,
    };
  });

  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const taxAmount = Math.max(0, Number(payload.taxAmount) || 0);
  const discountAmount = Math.max(0, Number(payload.discountAmount) || 0);
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  const newInvoice: InvoiceData = {
    id: invoiceId,
    invoiceNumber,
    viewToken,
    checkoutToken,
    clientFullName: payload.clientFullName.trim(),
    clientNickname:
      payload.clientNickname?.trim() ||
      payload.clientFullName.trim().split(' ')[0] ||
      'Klien',
    clientEmail: payload.clientEmail?.trim() || '',
    clientPhone: payload.clientPhone?.trim() || '',
    issueDate: payload.issueDate || now.split('T')[0],
    dueDate: payload.dueDate || now.split('T')[0],
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    allowCreditCard: payload.allowCreditCard ?? true,
    allowBankTransfer: payload.allowBankTransfer ?? true,
    status: 'UNPAID',
    paidAt: null,
    paymentMethodUsed: null,
    pgReferenceId: null,
    notes: payload.notes || '',
    items,
    transactions: [],
    createdAt: now,
    updatedAt: now,
  };

  store.invoices.unshift(newInvoice);
  persistServerStore(store);
  return newInvoice;
}

export interface ProcessPaymentPayload {
  tokenOrId: string;
  paymentMethod: PaymentMethodType;
  channel: string;
  cardLast4?: string;
  cardHolder?: string;
  installmentPlan?: string;
}

export function settleInvoicePayment(payload: ProcessPaymentPayload): {
  invoice: InvoiceData;
  transaction: TransactionLogData;
} {
  const store = getServerStore();
  const inv = store.invoices.find(
    (i) =>
      i.checkoutToken === payload.tokenOrId ||
      i.viewToken === payload.tokenOrId ||
      i.id === payload.tokenOrId
  );

  if (!inv) {
    throw new Error('Invoice tidak ditemukan.');
  }

  const now = new Date().toISOString();
  const datePart = now.slice(0, 10).replace(/-/g, '');
  const randPart = Math.floor(10000 + Math.random() * 90000);
  const prefix =
    store.company.pgProvider === 'XENDIT'
      ? 'XND'
      : store.company.pgProvider.startsWith('MIDTRANS')
      ? 'MDT'
      : 'SIM';
  const methodCode = payload.paymentMethod === 'CREDIT_CARD' ? 'CC' : 'VA';
  const pgReferenceId = `${prefix}-${methodCode}-${datePart}-${randPart}`;

  let methodLabel = '';
  if (payload.paymentMethod === 'CREDIT_CARD') {
    const last4 = payload.cardLast4 || '4242';
    const plan =
      payload.installmentPlan && payload.installmentPlan !== 'FULL'
        ? ` - Cicilan ${payload.installmentPlan}`
        : '';
    methodLabel = `CREDIT_CARD (${payload.channel} *${last4}${plan})`;
  } else {
    methodLabel = `BANK_TRANSFER (${payload.channel.replace('_VA', '')} Virtual Account)`;
  }

  const trx: TransactionLogData = {
    id: `trx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    invoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.clientFullName,
    paymentMethod: payload.paymentMethod,
    channel: payload.channel,
    amount: inv.totalAmount,
    status: 'SUCCESS',
    pgReferenceId,
    rawResponse: {
      provider: store.company.pgProvider,
      settledAt: now,
      cardHolder: payload.cardHolder || inv.clientFullName,
      threeDSecure: payload.paymentMethod === 'CREDIT_CARD' ? 'AUTHENTICATED_3DS_V2' : undefined,
    },
    createdAt: now,
  };

  // Deduct stock for physical products if not already PAID
  if (inv.status !== 'PAID') {
    for (const item of inv.items) {
      if (item.catalogId) {
        const catItem = store.catalog.find((c) => c.id === item.catalogId);
        if (catItem && catItem.type === 'PRODUCT' && typeof catItem.stock === 'number') {
          catItem.stock = Math.max(0, catItem.stock - item.quantity);
        }
      }
    }
  }

  inv.status = 'PAID';
  inv.paidAt = now;
  inv.paymentMethodUsed = methodLabel;
  inv.pgReferenceId = pgReferenceId;
  inv.updatedAt = now;
  inv.transactions.unshift(trx);
  store.transactions.unshift(trx);

  persistServerStore(store);
  return { invoice: inv, transaction: trx };
}

export function updateInvoiceStatus(
  idOrToken: string,
  status: InvoiceData['status']
): InvoiceData | undefined {
  const store = getServerStore();
  const inv = store.invoices.find(
    (i) => i.id === idOrToken || i.viewToken === idOrToken || i.checkoutToken === idOrToken
  );
  if (!inv) return undefined;

  inv.status = status;
  if (status === 'UNPAID' || status === 'OVERDUE' || status === 'DRAFT') {
    inv.paidAt = null;
    inv.paymentMethodUsed = null;
    inv.pgReferenceId = null;
  } else if (status === 'PAID' && !inv.paidAt) {
    inv.paidAt = new Date().toISOString();
    inv.paymentMethodUsed = inv.paymentMethodUsed || 'MANUAL_VERIFICATION (Admin)';
    inv.pgReferenceId = inv.pgReferenceId || `MNL-${Date.now().toString().slice(-6)}`;
  }
  inv.updatedAt = new Date().toISOString();
  persistServerStore(store);
  return inv;
}

export function upsertCatalogItem(item: Partial<CatalogItemData> & { name: string; skuCode: string }): CatalogItemData {
  const store = getServerStore();
  const existingIdx = store.catalog.findIndex(
    (c) => (item.id && c.id === item.id) || c.skuCode.toLowerCase() === item.skuCode.toLowerCase()
  );

  if (existingIdx >= 0) {
    const current = store.catalog[existingIdx];
    const updated: CatalogItemData = {
      ...current,
      ...item,
      price: Number(item.price ?? current.price),
      stock:
        (item.type ?? current.type) === 'SERVICE'
          ? null
          : item.stock !== undefined && item.stock !== null
          ? Number(item.stock)
          : current.stock ?? 25,
    };
    store.catalog[existingIdx] = updated;
    persistServerStore(store);
    return updated;
  }

  const created: CatalogItemData = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    skuCode: item.skuCode.trim().toUpperCase(),
    name: item.name.trim(),
    category: item.category?.trim() || 'Consulting',
    type: item.type || 'SERVICE',
    price: Number(item.price) || 0,
    stock: item.type === 'PRODUCT' ? Number(item.stock ?? 25) : null,
    description: item.description || '',
    features: item.features || [
      'Layanan / Produk Resmi Terstandarisasi',
      'Dukungan Konsultasi & Support Prioritas',
      'Invoice Resmi & Pembayaran Terenkripsi',
    ],
    badge: item.badge || (item.type === 'PRODUCT' ? 'Ready Stock' : 'Official Service'),
    isActive: item.isActive ?? true,
    createdAt: new Date().toISOString(),
  };

  store.catalog.unshift(created);
  persistServerStore(store);
  return created;
}

export function deleteCatalogItem(id: string): boolean {
  const store = getServerStore();
  const lenBefore = store.catalog.length;
  store.catalog = store.catalog.filter((c) => c.id !== id);
  persistServerStore(store);
  return store.catalog.length < lenBefore;
}

export function updateCompanySettings(patch: Partial<CompanySettingData>): CompanySettingData {
  const store = getServerStore();
  store.company = {
    ...store.company,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  persistServerStore(store);
  return store.company;
}
