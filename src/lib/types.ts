export type ItemType = 'SERVICE' | 'PRODUCT';

export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethodType = 'CREDIT_CARD' | 'BANK_TRANSFER';

export type PaymentGatewayProvider =
  | 'SIMULATOR'
  | 'MIDTRANS_SANDBOX'
  | 'MIDTRANS_PRODUCTION'
  | 'XENDIT';

export interface CompanySettingData {
  id: string;
  companyName: string;
  companySub: string;
  invoicePrefix: string;
  email: string;
  phone: string;
  address: string;
  websiteUrl?: string;
  pgProvider: PaymentGatewayProvider;
  midtransServerKey?: string;
  midtransClientKey?: string;
  xenditSecretKey?: string;
  updatedAt: string;
}

export interface CatalogItemData {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  type: ItemType;
  price: number;
  stock: number | null; // null for SERVICE, integer for PRODUCT
  description: string;
  features?: string[];
  badge?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InvoiceItemData {
  id: string;
  invoiceId: string;
  catalogId?: string | null;
  skuCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TransactionLogData {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  clientName?: string;
  paymentMethod: PaymentMethodType;
  channel: string; // e.g., VISA, MASTERCARD, JCB, BCA_VA, MANDIRI_VA, BNI_VA, BRI_VA
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  pgReferenceId: string;
  rawResponse?: Record<string, unknown>;
  createdAt: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  viewToken: string;     // 64-char hex SHA-256 hash
  checkoutToken: string; // 64-char hex SHA-256 hash

  clientFullName: string;
  clientNickname: string;
  clientEmail: string;
  clientPhone: string;

  issueDate: string; // YYYY-MM-DD or ISO
  dueDate: string;   // YYYY-MM-DD or ISO

  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;

  allowCreditCard: boolean;
  allowBankTransfer: boolean;

  status: InvoiceStatus;
  paidAt?: string | null;
  paymentMethodUsed?: string | null;
  pgReferenceId?: string | null;
  notes?: string;

  items: InvoiceItemData[];
  transactions: TransactionLogData[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseState {
  company: CompanySettingData;
  catalog: CatalogItemData[];
  invoices: InvoiceData[];
  transactions: TransactionLogData[];
}
