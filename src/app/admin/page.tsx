'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  PlusCircle,
  Send,
  FileText,
  CreditCard,
  Search,
  RotateCcw,
  Check,
  Users,
  UserCheck,
  MailWarning,
  ArrowRight,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import {
  formatIDR,
  formatDateDDMMYYYY,
  getInvoiceItemSummary,
} from '@/lib/crypto';

export default function AdminDashboardPage() {
  const { state, setActiveWhatsAppInvoice, changeInvoiceStatus } = useAppState();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'OVERDUE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const paidRevenue = state.invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const unpaidTotal = state.invoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const overdueTotal = state.invoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const filteredInvoices = state.invoices.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientFullName.toLowerCase().includes(q) ||
        inv.clientNickname.toLowerCase().includes(q) ||
        getInvoiceItemSummary(inv).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const members = state.members || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* KPI Summary Cards with Smooth Hover Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue (Paid)
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#192730] mt-3">
            {formatIDR(paidRevenue)}
          </p>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            {state.invoices.filter((i) => i.status === 'PAID').length} Invoice Lunas Terverifikasi
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Invoices (Unpaid)
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#192730] mt-3">
            {formatIDR(unpaidTotal)}
          </p>
          <p className="text-xs text-amber-700 font-semibold mt-1">
            {state.invoices.filter((i) => i.status === 'UNPAID').length} Menunggu Pembayaran Klien
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overdue Invoices
            </span>
            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#192730] mt-3">
            {formatIDR(overdueTotal)}
          </p>
          <p className="text-xs text-red-600 font-semibold mt-1">
            {state.invoices.filter((i) => i.status === 'OVERDUE').length} Melewati Jatuh Tempo
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Akun Member & Katalog
            </span>
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-[#0089e4] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#192730] mt-3">
            {members.length} Member
          </p>
          <p className="text-xs text-[#0089e4] font-semibold mt-1">
            {members.filter((m) => m.isVerified).length} Verified • {state.catalog.length} Katalog
          </p>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#192730] via-[#1c3242] to-[#0089e4] p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-200">
            One-Click WhatsApp Billing & Member ERP
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold">
            Buat Tagihan Jasa Konsultan / Produk & Kelola Verifikasi Akun Member
          </h3>
          <p className="text-xs text-sky-100/90 max-w-2xl">
            Sistem otomatis men-generate Token SHA-256 unik untuk halaman View Invoice & Checkout Kartu Kredit (3DS) / Virtual Account beserta teks WhatsApp siap kirim.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/admin/members"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-3.5 text-xs font-extrabold text-white transition"
          >
            <Users className="h-4 w-4 text-sky-300" />
            Kelola Akun Member
          </Link>
          <Link
            href="/admin/invoices/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#192730] hover:bg-sky-50 px-5 py-3.5 text-xs sm:text-sm font-extrabold shadow-md transition"
          >
            <PlusCircle className="h-4 w-4 text-[#0089e4]" />
            + Buat Invoice & Link Bayar Cepat
          </Link>
        </div>
      </div>

      {/* Invoices Management Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-[#192730]">
              Daftar Tagihan (Invoices) & Link Pembayaran
            </h3>
            <p className="text-xs text-slate-500">
              Klik <strong>&ldquo;Format WA&rdquo;</strong> untuk menyalin teks pesan WhatsApp lengkap dengan link token SHA-256
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari invoice / nama klien..."
                className="rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'UNPAID', 'PAID', 'OVERDUE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    statusFilter === st
                      ? 'bg-white text-[#192730] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Nomor Invoice & Tanggal</th>
                <th className="py-3.5 px-4">Klien</th>
                <th className="py-3.5 px-4">Rincian Item</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi & Link Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4">
                    <p className="font-mono font-bold text-[#192730]">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tgl: {formatDateDDMMYYYY(inv.issueDate)} • Tempo:{' '}
                      <span className="text-rose-600 font-semibold">
                        {formatDateDDMMYYYY(inv.dueDate)}
                      </span>
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">
                      {inv.clientFullName}{' '}
                      <span className="text-[#0089e4]">({inv.clientNickname})</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {inv.clientPhone || inv.clientEmail || '-'}
                    </p>
                  </td>

                  <td className="py-4 px-4 max-w-xs">
                    <p className="font-medium text-slate-800 line-clamp-2">
                      {getInvoiceItemSummary(inv)}
                    </p>
                  </td>

                  <td className="py-4 px-4 text-right font-extrabold text-[#192730] whitespace-nowrap">
                    {formatIDR(inv.totalAmount)}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {inv.status === 'PAID' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          PAID
                        </span>
                        {inv.paymentMethodUsed && (
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[140px] mx-auto truncate">
                            {inv.paymentMethodUsed}
                          </p>
                        )}
                      </div>
                    ) : inv.status === 'OVERDUE' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700">
                        OVERDUE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                        UNPAID
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveWhatsAppInvoice(inv)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition"
                        title="Generate & Copy Format Pesan WhatsApp"
                      >
                        <Send className="h-3 w-3" />
                        Format WA
                      </button>

                      <Link
                        href={`/invoices/view/${inv.viewToken}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition"
                      >
                        <FileText className="h-3 w-3 text-[#0089e4]" />
                        View
                      </Link>

                      <Link
                        href={`/payment/checkout/${inv.checkoutToken}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0089e4] hover:bg-[#0073c2] px-2.5 py-1.5 text-[11px] font-bold text-white transition"
                      >
                        <CreditCard className="h-3 w-3" />
                        Checkout
                      </Link>

                      {inv.status === 'PAID' ? (
                        <button
                          type="button"
                          onClick={() => changeInvoiceStatus(inv.id, 'UNPAID')}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2 py-1.5 text-[10px] font-bold text-amber-800 transition"
                          title="Reset ke UNPAID untuk demo ulang"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => changeInvoiceStatus(inv.id, 'PAID')}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-2 py-1.5 text-[10px] font-bold text-emerald-800 transition"
                          title="Tandai Lunas Manual"
                        >
                          <Check className="h-3 w-3" />
                          Lunas
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Member Accounts Overview Widget */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#192730]">
              Ringkasan Akun Member Terdaftar & Status Verifikasi Email
            </h3>
            <p className="text-xs text-slate-500">
              Kelola tambah, hapus, dan edit rinci profil serta verifikasi OTP member
            </p>
          </div>
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2 text-xs font-bold text-white transition"
          >
            Buka Manajemen Member Lengkap
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {members.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#0089e4]">
                    {m.memberCode}
                  </span>
                  {m.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <UserCheck className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <MailWarning className="h-3 w-3" />
                      Pending OTP
                    </span>
                  )}
                </div>
                <p className="text-xs font-extrabold text-slate-900 mt-1.5">
                  {m.fullName} ({m.nickname})
                </p>
                <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                <p className="text-[11px] font-semibold text-slate-700 mt-1">
                  {m.companyName}
                </p>
              </div>
              <Link
                href="/admin/members"
                className="text-[11px] font-bold text-[#0089e4] hover:underline pt-2 border-t border-slate-200/80 inline-block"
              >
                Edit Detail Member &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
