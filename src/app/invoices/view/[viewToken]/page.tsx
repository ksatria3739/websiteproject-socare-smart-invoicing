'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Printer,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  ShieldCheck,
  Send,
  ArrowLeft,
  Copy,
  Check,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import {
  formatIDR,
  formatDateDDMMYYYY,
  formatDateLongID,
} from '@/lib/crypto';
import { InvoiceData } from '@/lib/types';

export default function PublicInvoiceViewPage() {
  const params = useParams();
  const viewToken = typeof params?.viewToken === 'string' ? params.viewToken : '';

  const { state, findInvoice, setActiveWhatsAppInvoice, changeInvoiceStatus } = useAppState();
  const [invoice, setInvoice] = useState<InvoiceData | undefined>(() => findInvoice(viewToken));
  const [loadingToken, setLoadingToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const localFound = findInvoice(viewToken);
    if (localFound) {
      setInvoice(localFound);
      return;
    }

    if (viewToken) {
      setLoadingToken(true);
      fetch(`/api/invoices?token=${encodeURIComponent(viewToken)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.invoice) {
            setInvoice(data.invoice);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingToken(false));
    }
  }, [viewToken, findInvoice, state.invoices]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  if (loadingToken && !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] p-6">
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-full border-4 border-[#0089e4] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Memverifikasi Token SHA-256 & Memuat Dokumen Invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] p-6">
        <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h1 className="text-xl font-extrabold text-[#192730]">
            Dokumen Invoice Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Token enkripsi invoice tidak valid atau telah kedaluwarsa. Pastikan Anda membuka tautan resmi yang dikirimkan melalui WhatsApp.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-xl bg-[#0089e4] px-4 py-2.5 text-xs font-bold text-white"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700"
            >
              Buka Dashboard Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'PAID';
  const isOverdue = invoice.status === 'OVERDUE';

  return (
    <div className="min-h-screen bg-[#eef2f6] py-6 sm:py-10 px-4 sm:px-6">
      {/* Top Action Toolbar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 no-print space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#192730] text-white px-5 py-3.5 shadow-lg">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Beranda
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-sky-300">
              <Lock className="h-3.5 w-3.5" />
              <span className="font-mono">
                Token SHA-256: {invoice.viewToken.slice(0, 16)}...
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold text-white transition"
            >
              {copiedUrl ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  URL Disalin
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Salin Link
                </>
              )}
            </button>

            <button
              onClick={() => setActiveWhatsAppInvoice(invoice)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition"
            >
              <Send className="h-3.5 w-3.5" />
              Format WA
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#192730] hover:bg-slate-100 px-3.5 py-2 text-xs font-bold shadow-sm transition"
            >
              <Printer className="h-3.5 w-3.5 text-[#0089e4]" />
              Download / Cetak PDF
            </button>

            {!isPaid ? (
              <Link
                href={`/payment/checkout/${invoice.checkoutToken}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2 text-xs font-extrabold text-white shadow-md transition"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Bayar Sekarang (CC / VA)
              </Link>
            ) : (
              <button
                onClick={() => changeInvoiceStatus(invoice.id, 'UNPAID')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 px-3 py-2 text-xs font-bold text-amber-200 transition"
                title="Reset kembali ke UNPAID untuk mengulang simulasi pembayaran"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Demo ke UNPAID
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official Digital Invoice Document */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden relative print-container">
        {/* Top Accent Strip */}
        <div
          className={`h-2.5 w-full ${
            isPaid
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
              : isOverdue
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : 'bg-gradient-to-r from-[#192730] via-[#0089e4] to-sky-400'
          }`}
        />

        {/* Authentic LUNAS / PAID Stamp Watermark when Paid */}
        {isPaid && (
          <div className="pointer-events-none select-none absolute top-36 right-8 sm:right-16 z-10 -rotate-12 border-4 border-emerald-600/35 rounded-2xl px-6 py-2 text-center bg-emerald-50/40 backdrop-blur-[1px]">
            <p className="text-3xl sm:text-4xl font-black tracking-widest text-emerald-600/40 uppercase">
              LUNAS • PAID
            </p>
            <p className="text-[10px] font-mono font-bold text-emerald-700/50 tracking-wider">
              {invoice.pgReferenceId || 'VERIFIED TRANSACTION'}
            </p>
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          {/* Header: Company Identity & Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-7">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0089e4] to-[#192730] flex items-center justify-center text-white shadow-md shrink-0">
                <Globe className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#192730] tracking-tight">
                  {state.company.companyName}
                </h1>
                <p className="text-xs font-semibold text-[#0089e4]">
                  {state.company.companySub}
                </p>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                  {state.company.address}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span>Email: {state.company.email}</span>
                  <span>Telp/WA: {state.company.phone}</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right space-y-2 shrink-0">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">
                INVOICE RESMI
              </span>
              <p className="text-lg sm:text-xl font-black text-[#192730] font-mono">
                {invoice.invoiceNumber}
              </p>

              <div className="inline-flex items-center gap-1.5">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-extrabold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    PAID (LUNAS)
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-300 px-3.5 py-1 text-xs font-extrabold text-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    EXPIRED / JATUH TEMPO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-extrabold text-amber-900">
                    <Clock className="h-4 w-4 text-amber-600" />
                    UNPAID (BELUM DIBAYAR)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Client Info & Dates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ditagihkan Kepada (Billed To):
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#192730]">
                {invoice.clientFullName}{' '}
                <span className="text-sm font-semibold text-[#0089e4]">
                  ({invoice.clientNickname})
                </span>
              </h2>
              {invoice.clientEmail && (
                <p className="text-xs text-slate-600">Email: {invoice.clientEmail}</p>
              )}
              {invoice.clientPhone && (
                <p className="text-xs text-slate-600">WhatsApp/Telp: {invoice.clientPhone}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:text-right">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Tanggal Invoice
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatDateDDMMYYYY(invoice.issueDate)}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatDateLongID(invoice.issueDate)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Jatuh Tempo
                </span>
                <p className="text-sm font-bold text-rose-600 mt-0.5">
                  {formatDateDDMMYYYY(invoice.dueDate)}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatDateLongID(invoice.dueDate)}
                </p>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Metode Pembayaran Tersedia
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {[
                    invoice.allowCreditCard && 'Kartu Kredit / Debit Online (Visa, Mastercard, JCB)',
                    invoice.allowBankTransfer && 'Transfer Bank / Virtual Account (BCA, Mandiri, BNI, BRI)',
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#192730] text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold w-12">No</th>
                  <th className="py-3.5 px-4 font-bold">Deskripsi Layanan / Item Tagihan</th>
                  <th className="py-3.5 px-4 font-bold text-center w-20">Qty</th>
                  <th className="py-3.5 px-4 font-bold text-right w-40">Harga Satuan</th>
                  <th className="py-3.5 px-4 font-bold text-right w-44">Total Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{item.description}</p>
                      {item.skuCode && (
                        <span className="inline-block mt-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600">
                          Kode Katalog: {item.skuCode}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700">
                      {item.quantity}x
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-700">
                      {formatIDR(item.unitPrice)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {formatIDR(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 space-y-3">
              {isPaid ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Bukti Pembayaran Terverifikasi (Lunas)
                  </div>
                  <p className="text-xs text-emerald-700">
                    Metode Pembayaran: <strong>{invoice.paymentMethodUsed}</strong>
                  </p>
                  <p className="text-xs text-emerald-700">
                    ID Referensi Gateway: <strong className="font-mono">{invoice.pgReferenceId}</strong>
                  </p>
                  {invoice.paidAt && (
                    <p className="text-xs text-emerald-700">
                      Waktu Pelunasan: <strong>{new Date(invoice.paidAt).toLocaleString('id-ID')}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#192730] font-bold text-xs">
                    <ShieldCheck className="h-4 w-4 text-[#0089e4]" />
                    Informasi Pembayaran Resmi & Terenkripsi
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Untuk menyelesaikan tagihan ini menggunakan{' '}
                    <strong>Kartu Kredit (Visa / Mastercard / JCB)</strong> atau{' '}
                    <strong>Transfer Virtual Account Bank</strong>, silakan klik tombol{' '}
                    <strong>&ldquo;Bayar Sekarang&rdquo;</strong> di bawah ini.
                  </p>
                </div>
              )}

              {invoice.notes && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600">
                  <strong className="text-slate-800">Catatan:</strong> {invoice.notes}
                </div>
              )}
            </div>

            <div className="md:col-span-5 rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatIDR(invoice.subtotal)}
                </span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Pajak / PPN</span>
                  <span className="font-semibold text-slate-900">
                    {formatIDR(invoice.taxAmount)}
                  </span>
                </div>
              )}
              {invoice.discountAmount && invoice.discountAmount > 0 ? (
                <div className="flex items-center justify-between text-xs text-emerald-700">
                  <span>Diskon / Potongan</span>
                  <span className="font-semibold">
                    - {formatIDR(invoice.discountAmount)}
                  </span>
                </div>
              ) : null}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#192730]">
                  Total Tagihan
                </span>
                <span className="text-xl font-black text-[#0089e4]">
                  {formatIDR(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Prominent CTA to Checkout Page (Hidden when printing) */}
          {!isPaid && (
            <div className="pt-4 border-t border-slate-200 no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#192730] rounded-2xl p-6 text-white">
              <div>
                <h3 className="text-base font-extrabold">
                  Siap Melakukan Pembayaran Tagihan Ini?
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Mendukung Kartu Kredit Online (3DS OTP) & Transfer Virtual Account Otomatis
                </p>
              </div>
              <Link
                href={`/payment/checkout/${invoice.checkoutToken}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition shrink-0"
              >
                <CreditCard className="h-4 w-4" />
                Bayar Sekarang (Menuju Link Pembayaran)
              </Link>
            </div>
          )}

          {/* Document Footer */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>
              Dokumen ini diterbitkan secara elektronik oleh sistem Smart Invoicing {state.company.companyName} dan sah tanpa tanda tangan basah.
            </p>
            <p className="font-mono">
              Ref: {invoice.invoiceNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
