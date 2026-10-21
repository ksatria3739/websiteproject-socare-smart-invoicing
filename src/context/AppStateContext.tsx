'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DatabaseState,
  InvoiceData,
  CatalogItemData,
  CompanySettingData,
  PaymentMethodType,
  TransactionLogData,
} from '@/lib/types';
import { getInitialDatabaseState } from '@/lib/seed';
import { CreateInvoicePayload, ProcessPaymentPayload } from '@/lib/store';

const STORAGE_KEY = 'socare_smart_invoicing_state_v1';

interface AppStateContextType {
  state: DatabaseState;
  isLoading: boolean;
  activeWhatsAppInvoice: InvoiceData | null;
  setActiveWhatsAppInvoice: (inv: InvoiceData | null) => void;
  findInvoice: (tokenOrId: string) => InvoiceData | undefined;
  createInvoice: (payload: CreateInvoicePayload) => Promise<InvoiceData>;
  processPayment: (payload: ProcessPaymentPayload) => Promise<{
    invoice: InvoiceData;
    transaction: TransactionLogData;
  }>;
  changeInvoiceStatus: (idOrToken: string, status: InvoiceData['status']) => Promise<void>;
  saveCatalogItem: (
    item: Partial<CatalogItemData> & { name: string; skuCode: string }
  ) => Promise<CatalogItemData>;
  removeCatalogItem: (id: string) => Promise<void>;
  saveCompanySettings: (patch: Partial<CompanySettingData>) => Promise<CompanySettingData>;
  resetDemoData: () => Promise<void>;
  refreshState: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DatabaseState>(() => getInitialDatabaseState());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeWhatsAppInvoice, setActiveWhatsAppInvoice] = useState<InvoiceData | null>(null);

  const saveToLocal = useCallback((nextState: DatabaseState) => {
    setState(nextState);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, []);

  const refreshState = useCallback(async () => {
    try {
      let localCached: DatabaseState | null = null;
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            localCached = JSON.parse(raw) as DatabaseState;
            if (localCached && Array.isArray(localCached.invoices)) {
              setState(localCached);
            }
          } catch {
            localCached = null;
          }
        }
      }

      if (localCached) {
        // Sync client state with server so serverless instance has any client-created invoices
        const res = await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SYNC_CLIENT', state: localCached }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.state) {
            saveToLocal(data.state);
          }
        }
      } else {
        const res = await fetch('/api/state');
        if (res.ok) {
          const serverState = (await res.json()) as DatabaseState;
          saveToLocal(serverState);
        }
      }
    } catch {
      // Fallback to local / seed state silently
    } finally {
      setIsLoading(false);
    }
  }, [saveToLocal]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const findInvoice = useCallback(
    (tokenOrId: string): InvoiceData | undefined => {
      if (!tokenOrId) return undefined;
      const clean = decodeURIComponent(tokenOrId).trim();
      return state.invoices.find(
        (inv) =>
          inv.viewToken === clean ||
          inv.checkoutToken === clean ||
          inv.id === clean ||
          inv.invoiceNumber.toLowerCase() === clean.toLowerCase()
      );
    },
    [state.invoices]
  );

  const createInvoice = useCallback(
    async (payload: CreateInvoicePayload): Promise<InvoiceData> => {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.invoice) {
        throw new Error(data.error || 'Gagal membuat invoice');
      }

      const created: InvoiceData = data.invoice;
      const nextState: DatabaseState = {
        ...state,
        invoices: [created, ...state.invoices.filter((i) => i.id !== created.id)],
      };
      saveToLocal(nextState);
      return created;
    },
    [state, saveToLocal]
  );

  const processPayment = useCallback(
    async (
      payload: ProcessPaymentPayload
    ): Promise<{ invoice: InvoiceData; transaction: TransactionLogData }> => {
      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.invoice) {
        throw new Error(data.error || 'Gagal memproses pembayaran');
      }

      const updatedInv: InvoiceData = data.invoice;
      const newTrx: TransactionLogData = data.transaction;

      // Also update product stock in client state
      const updatedCatalog = state.catalog.map((cat) => {
        const matchedItem = updatedInv.items.find((it) => it.catalogId === cat.id);
        if (matchedItem && cat.type === 'PRODUCT' && typeof cat.stock === 'number') {
          return {
            ...cat,
            stock: Math.max(0, cat.stock - matchedItem.quantity),
          };
        }
        return cat;
      });

      const nextState: DatabaseState = {
        ...state,
        catalog: updatedCatalog,
        invoices: state.invoices.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv)),
        transactions: [newTrx, ...state.transactions],
      };
      saveToLocal(nextState);
      return { invoice: updatedInv, transaction: newTrx };
    },
    [state, saveToLocal]
  );

  const changeInvoiceStatus = useCallback(
    async (idOrToken: string, status: InvoiceData['status']) => {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idOrToken, status }),
      });
      const data = await res.json();
      if (res.ok && data.invoice) {
        const updated: InvoiceData = data.invoice;
        const nextState: DatabaseState = {
          ...state,
          invoices: state.invoices.map((inv) => (inv.id === updated.id ? updated : inv)),
        };
        saveToLocal(nextState);
      }
    },
    [state, saveToLocal]
  );

  const saveCatalogItem = useCallback(
    async (
      item: Partial<CatalogItemData> & { name: string; skuCode: string }
    ): Promise<CatalogItemData> => {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (!res.ok || !data.item) {
        throw new Error(data.error || 'Gagal menyimpan item katalog');
      }
      const nextState: DatabaseState = {
        ...state,
        catalog: data.catalog || state.catalog,
      };
      saveToLocal(nextState);
      return data.item;
    },
    [state, saveToLocal]
  );

  const removeCatalogItem = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/catalog?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.catalog) {
        saveToLocal({
          ...state,
          catalog: data.catalog,
        });
      }
    },
    [state, saveToLocal]
  );

  const saveCompanySettings = useCallback(
    async (patch: Partial<CompanySettingData>): Promise<CompanySettingData> => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || !data.company) {
        throw new Error(data.error || 'Gagal memperbarui pengaturan');
      }
      const nextState: DatabaseState = {
        ...state,
        company: data.company,
      };
      saveToLocal(nextState);
      return data.company;
    },
    [state, saveToLocal]
  );

  const resetDemoData = useCallback(async () => {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET_DEMO' }),
    });
    const data = await res.json();
    if (res.ok && data.state) {
      saveToLocal(data.state);
    } else {
      saveToLocal(getInitialDatabaseState());
    }
  }, [saveToLocal]);

  return (
    <AppStateContext.Provider
      value={{
        state,
        isLoading,
        activeWhatsAppInvoice,
        setActiveWhatsAppInvoice,
        findInvoice,
        createInvoice,
        processPayment,
        changeInvoiceStatus,
        saveCatalogItem,
        removeCatalogItem,
        saveCompanySettings,
        resetDemoData,
        refreshState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
