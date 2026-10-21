'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Building2,
  CreditCard,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { COMPANY_PRESETS } from '@/lib/seed';
import { PaymentGatewayProvider } from '@/lib/types';

export default function AdminSettingsPage() {
  const { state, saveCompanySettings } = useAppState();

  const [companyName, setCompanyName] = useState(state.company.companyName);
  const [companySub, setCompanySub] = useState(state.company.companySub);
  const [invoicePrefix, setInvoicePrefix] = useState(state.company.invoicePrefix);
  const [email, setEmail] = useState(state.company.email);
  const [phone, setPhone] = useState(state.company.phone);
  const [address, setAddress] = useState(state.company.address);
  const [pgProvider, setPgProvider] = useState<PaymentGatewayProvider>(
    state.company.pgProvider
  );
  const [midtransServerKey, setMidtransServerKey] = useState(
    state.company.midtransServerKey || ''
  );
  const [midtransClientKey, setMidtransClientKey] = useState(
    state.company.midtransClientKey || ''
  );
  const [xenditSecretKey, setXenditSecretKey] = useState(
    state.company.xenditSecretKey || ''
  );
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setCompanyName(state.company.companyName);
    setCompanySub(state.company.companySub);
    setInvoicePrefix(state.company.invoicePrefix);
    setEmail(state.company.email);
    setPhone(state.company.phone);
    setAddress(state.company.address);
    setPgProvider(state.company.pgProvider);
  }, [state.company]);

  const applyPreset = async (key: keyof typeof COMPANY_PRESETS) => {
    const p = COMPANY_PRESETS[key];
    setCompanyName(p.companyName);
    setCompanySub(p.companySub);
    setInvoicePrefix(p.invoicePrefix);
    setEmail(p.email);
    setPhone(p.phone);
    setAddress(p.address);
    setPgProvider(p.pgProvider);
    await saveCompanySettings(p);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCompanySettings({
      companyName,
      companySub,
      invoicePrefix,
      email,
      phone,
      address,
      pgProvider,
      midtransServerKey,
      midtransClientKey,
      xenditSecretKey,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-extrabold text-[#192730]">
          Pengaturan Profil Perusahaan & Integrasi Payment Gateway
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi identitas pengirim pada template WhatsApp, kop dokumen Invoice, dan kredensial Midtrans / Xendit
        </p>
      </div>

      {/* 1-Click Corporate Identity Presets */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0089e4]">
          <Sparkles className="h-4 w-4" />
          Preset Identitas Perusahaan (1-Klik Ganti Profil Demo)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => applyPreset('SOCARE')}
            className="rounded-xl border border-slate-200 hover:border-[#0089e4] bg-slate-50 hover:bg-sky-50/60 p-4 text-left transition"
          >
            <p className="text-xs font-extrabold text-[#192730]">
              PT Socare Group International
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prefix: INV/SGI • admin@socare.id
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('KODING_AKADEMI')}
            className="rounded-xl border border-slate-200 hover:border-[#0089e4] bg-slate-50 hover:bg-sky-50/60 p-4 text-left transition"
          >
            <p className="text-xs font-extrabold text-[#192730]">
              Koding Akademi (Sample WA)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prefix: INV/DPS • finance@kodingakademi.id
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('NUSANTARA')}
            className="rounded-xl border border-slate-200 hover:border-[#0089e4] bg-slate-50 hover:bg-sky-50/60 p-4 text-left transition"
          >
            <p className="text-xs font-extrabold text-[#192730]">
              Konsultan & Niaga Nusantara
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prefix: INV/JKT • finance@niaganusantara.co.id
            </p>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Pengaturan berhasil disimpan dan langsung diterapkan ke seluruh halaman Invoice & Format WhatsApp!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-4 w-4 text-[#0089e4]" />
            <h2 className="text-sm font-extrabold text-[#192730]">
              Identitas Perusahaan (Muncul di Pesan WA & Kop Invoice)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Perusahaan (Company_Name di WA)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prefix Nomor Invoice Otomatis
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sub-judul / Tagline Perusahaan
              </label>
              <input
                type="text"
                value={companySub}
                onChange={(e) => setCompanySub(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Resmi (Company_Email di WA)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telepon / WhatsApp Support (Company_Phone di WA)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap Kantor
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway Config */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="h-4 w-4 text-[#0089e4]" />
            <h2 className="text-sm font-extrabold text-[#192730]">
              Mode Adapter Payment Gateway (Kartu Kredit & Virtual Account)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                {
                  id: 'SIMULATOR',
                  label: 'SIMULATOR SANDBOX (Aktif untuk Live Demo)',
                  desc: 'Simulasi penuh Kartu Kredit 3DS OTP & Virtual Account instan',
                },
                {
                  id: 'XENDIT',
                  label: 'XENDIT PAYMENT GATEWAY',
                  desc: 'Integrasi Xendit Invoice & Credit Card Tokenization API',
                },
                {
                  id: 'MIDTRANS_SANDBOX',
                  label: 'MIDTRANS SNAP (SANDBOX)',
                  desc: 'Lingkungan pengujian Midtrans Snap & Core API',
                },
                {
                  id: 'MIDTRANS_PRODUCTION',
                  label: 'MIDTRANS SNAP (PRODUCTION)',
                  desc: 'Transaksi Kartu Kredit & VA Live Settlement ke Rekening Perusahaan',
                },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPgProvider(mode.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  pgProvider === mode.id
                    ? 'border-[#0089e4] bg-sky-50/70 ring-2 ring-[#0089e4]/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-extrabold text-[#192730]">{mode.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{mode.desc}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Midtrans Server Key
              </label>
              <input
                type="password"
                value={midtransServerKey}
                onChange={(e) => setMidtransServerKey(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Midtrans Client Key
              </label>
              <input
                type="text"
                value={midtransClientKey}
                onChange={(e) => setMidtransClientKey(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Xendit Secret API Key
              </label>
              <input
                type="password"
                value={xenditSecretKey}
                onChange={(e) => setXenditSecretKey(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Endpoint Webhook Pembayaran Otomatis: <strong className="font-mono text-slate-800">/api/payment/webhook</strong>
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition"
        >
          <Save className="h-4 w-4" />
          Simpan Seluruh Pengaturan
        </button>
      </form>
    </div>
  );
}
