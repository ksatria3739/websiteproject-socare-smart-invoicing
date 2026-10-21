'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DatabaseState,
  InvoiceData,
  CatalogItemData,
  CompanySettingData,
  TransactionLogData,
  MemberUserData,
} from '@/lib/types';
import { getInitialDatabaseState, INITIAL_MEMBERS } from '@/lib/seed';
import { CreateInvoicePayload, ProcessPaymentPayload } from '@/lib/store';
import { SendVerificationEmailResult } from '@/lib/mailer';

const STORAGE_KEY = 'socare_smart_invoicing_state_v2';
const AUTH_STORAGE_KEY = 'socare_auth_user_v2';

export interface RegisterMemberPayload {
  fullName: string;
  nickname?: string;
  email: string;
  phone: string;
  password: string;
  companyName?: string;
  jobTitle?: string;
  address?: string;
  city?: string;
  identityNumber?: string;
}

interface AppStateContextType {
  state: DatabaseState;
  isLoading: boolean;
  currentUser: MemberUserData | null;
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
  loginUser: (
    email: string,
    password: string
  ) => Promise<{ member: MemberUserData; requiresVerification: boolean }>;
  registerUser: (
    payload: RegisterMemberPayload
  ) => Promise<{ member: MemberUserData; emailResult: SendVerificationEmailResult }>;
  verifyUserEmail: (email: string, code: string) => Promise<MemberUserData>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ member: MemberUserData; emailResult: SendVerificationEmailResult }>;
  logoutUser: () => void;
  saveMember: (
    payload: Partial<MemberUserData> & {
      email: string;
      fullName: string;
      sendVerificationEmail?: boolean;
    }
  ) => Promise<{ member: MemberUserData; emailResult?: SendVerificationEmailResult | null }>;
  removeMember: (id: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshState: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DatabaseState>(() => getInitialDatabaseState());
  const [currentUser, setCurrentUser] = useState<MemberUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeWhatsAppInvoice, setActiveWhatsAppInvoice] = useState<InvoiceData | null>(null);

  const saveCurrentUser = useCallback((user: MemberUserData | null) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  const saveToLocal = useCallback(
    (nextState: DatabaseState) => {
      if (!Array.isArray(nextState.members)) {
        nextState.members = structuredClone(INITIAL_MEMBERS);
      }
      setState(nextState);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {
          // Ignore storage quota errors
        }
      }
    },
    []
  );

  const refreshState = useCallback(async () => {
    try {
      let localCached: DatabaseState | null = null;
      let savedUser: MemberUserData | null = null;

      if (typeof window !== 'undefined') {
        const rawUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (rawUser) {
          try {
            savedUser = JSON.parse(rawUser) as MemberUserData;
            setCurrentUser(savedUser);
          } catch {
            savedUser = null;
          }
        }

        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            localCached = JSON.parse(raw) as DatabaseState;
            if (localCached && Array.isArray(localCached.invoices)) {
              if (!Array.isArray(localCached.members)) {
                localCached.members = structuredClone(INITIAL_MEMBERS);
              }
              setState(localCached);
            }
          } catch {
            localCached = null;
          }
        }
      }

      if (localCached) {
        const res = await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SYNC_CLIENT', state: localCached }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.state) {
            saveToLocal(data.state);
            if (savedUser && Array.isArray(data.state.members)) {
              const refreshedUser = data.state.members.find(
                (m: MemberUserData) =>
                  m.id === savedUser?.id ||
                  m.email.toLowerCase() === savedUser?.email.toLowerCase()
              );
              if (refreshedUser) {
                saveCurrentUser(refreshedUser);
              }
            }
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
  }, [saveToLocal, saveCurrentUser]);

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
        body: JSON.stringify({
          ...payload,
          memberId: payload.memberId ?? currentUser?.id ?? null,
        }),
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
    [state, saveToLocal, currentUser]
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

  const loginUser = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ member: MemberUserData; requiresVerification: boolean }> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.member) {
        throw new Error(data.error || 'Gagal login');
      }
      saveCurrentUser(data.member);
      return {
        member: data.member,
        requiresVerification: Boolean(data.requiresVerification),
      };
    },
    [saveCurrentUser]
  );

  const registerUser = useCallback(
    async (
      payload: RegisterMemberPayload
    ): Promise<{ member: MemberUserData; emailResult: SendVerificationEmailResult }> => {
      const baseUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://socare-smart-invoicing.vercel.app';

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.member) {
        throw new Error(data.error || 'Gagal mendaftar');
      }

      const nextMembers = Array.isArray(data.members)
        ? data.members
        : [data.member, ...state.members];
      saveToLocal({ ...state, members: nextMembers });
      saveCurrentUser(data.member);

      return {
        member: data.member,
        emailResult: data.emailResult,
      };
    },
    [state, saveToLocal, saveCurrentUser]
  );

  const verifyUserEmail = useCallback(
    async (email: string, code: string): Promise<MemberUserData> => {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_OTP', email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.member) {
        throw new Error(data.error || 'Kode verifikasi tidak valid');
      }

      const nextMembers = Array.isArray(data.members)
        ? data.members
        : state.members.map((m) => (m.id === data.member.id ? data.member : m));

      saveToLocal({ ...state, members: nextMembers });
      if (
        currentUser &&
        (currentUser.id === data.member.id ||
          currentUser.email.toLowerCase() === data.member.email.toLowerCase())
      ) {
        saveCurrentUser(data.member);
      } else {
        saveCurrentUser(data.member);
      }

      return data.member;
    },
    [state, currentUser, saveToLocal, saveCurrentUser]
  );

  const resendVerificationEmail = useCallback(
    async (
      email: string
    ): Promise<{ member: MemberUserData; emailResult: SendVerificationEmailResult }> => {
      const baseUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://socare-smart-invoicing.vercel.app';

      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESEND_OTP', email, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.member) {
        throw new Error(data.error || 'Gagal mengirim ulang kode OTP');
      }

      if (Array.isArray(data.members)) {
        saveToLocal({ ...state, members: data.members });
      }
      if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
        saveCurrentUser(data.member);
      }
      return {
        member: data.member,
        emailResult: data.emailResult,
      };
    },
    [state, currentUser, saveToLocal, saveCurrentUser]
  );

  const logoutUser = useCallback(() => {
    saveCurrentUser(null);
  }, [saveCurrentUser]);

  const saveMember = useCallback(
    async (
      payload: Partial<MemberUserData> & {
        email: string;
        fullName: string;
        sendVerificationEmail?: boolean;
      }
    ): Promise<{ member: MemberUserData; emailResult?: SendVerificationEmailResult | null }> => {
      const baseUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://socare-smart-invoicing.vercel.app';

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, baseUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.member) {
        throw new Error(data.error || 'Gagal menyimpan data member');
      }

      const nextMembers = Array.isArray(data.members)
        ? data.members
        : [data.member, ...state.members.filter((m) => m.id !== data.member.id)];
      saveToLocal({ ...state, members: nextMembers });

      if (currentUser && currentUser.id === data.member.id) {
        saveCurrentUser(data.member);
      }

      return {
        member: data.member,
        emailResult: data.emailResult,
      };
    },
    [state, currentUser, saveToLocal, saveCurrentUser]
  );

  const removeMember = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/members?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.members)) {
        saveToLocal({ ...state, members: data.members });
      }
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
        currentUser,
        activeWhatsAppInvoice,
        setActiveWhatsAppInvoice,
        findInvoice,
        createInvoice,
        processPayment,
        changeInvoiceStatus,
        saveCatalogItem,
        removeCatalogItem,
        saveCompanySettings,
        loginUser,
        registerUser,
        verifyUserEmail,
        resendVerificationEmail,
        logoutUser,
        saveMember,
        removeMember,
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
