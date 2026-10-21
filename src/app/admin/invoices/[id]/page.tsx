'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  Send,
  FileText,
  CreditCard,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import {
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  formatIDR,
  formatDateDDMMYYYY,
} from '@/lib/crypto';

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { state, findInvoice, changeInvoiceStatus } = useAppState();
  const [baseUrl, setBaseUrl] = useState('https://socare-smart-invoicing.vercel.app');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const invoice = findInvoice(id);

  if (!invoice) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-4">
        <p className="text-base font-bold text-slate-800">Invoice tidak ditemukan.</p>
        <Link
          href="/admin"
          className="inline-block rounded-xl bg-[#0089e4] px-4 py-2 text-xs font-bold text-white"
        >
          Kembali ke Dashboard Admin
        </Link>
      </div>
    );
  }

  const waMessage = generateWhatsAppMessage(invoice, state.company, baseUrl);
  const waLink = generateWhatsAppUrl(invoice.clientPhone, waMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Daftar Invoice
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-[#192730]">
              Detail Invoice & Format Pesan WhatsApp: {invoice.invoiceNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Klien: {invoice.clientFullName} ({invoice.clientNickname}) • Nominal: {formatIDR(invoice.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === 'PAID' ? (
            <button
              onClick={() => changeInvoiceStatus(invoice.id, 'UNPAID')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset ke UNPAID
            </button>
          ) : (
            <button
              onClick={() => changeInvoiceStatus(invoice.id, 'PAID')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tandai Lunas (PAID)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-[#192730]">
            Template Pesan WhatsApp Siap Kirim
          </h2>
          <div className="rounded-xl bg-[#efeae2] p-4">
            <div className="rounded-xl rounded-tl-none bg-[#d9fdd3] p-4 border border-emerald-200">
              <pre className="whitespace-pre-wrap break-all font-sans text-xs sm:text-sm leading-relaxed text-slate-800">
                {waMessage}
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-5 py-3 text-xs font-extrabold text-white"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Berhasil Disalin!' : 'Copy Format WhatsApp'}
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-extrabold text-white"
            >
              <Send className="h-4 w-4" />
              Kirim via WhatsApp
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-[#192730]">
            Tautan Token Enkripsi SHA-256
          </h2>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
              <span className="font-bold text-slate-700 block">
                1. Public Tokenized Invoice View:
              </span>
              <p className="font-mono text-[11px] text-slate-500 break-all">
                {baseUrl}/invoices/view/{invoice.viewToken}
              </p>
              <Link
                href={`/invoices/view/${invoice.viewToken}`}
                className="inline-flex items-center gap-1.5 text-[#0089e4] font-bold hover:underline pt-1"
              >
                <FileText className="h-3.5 w-3.5" />
                Buka Halaman Invoice &rarr;
              </Link>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
              <span className="font-bold text-slate-700 block">
                2. Public Tokenized Payment Checkout (CC & VA):
              </span>
              <p className="font-mono text-[11px] text-slate-500 break-all">
                {baseUrl}/payment/checkout/{invoice.checkoutToken}
              </p>
              <Link
                href={`/payment/checkout/${invoice.checkoutToken}`}
                className="inline-flex items-center gap-1.5 text-[#0089e4] font-bold hover:underline pt-1"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Buka Halaman Checkout &rarr;
              </Link>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
              <p>
                <strong>Tanggal Terbit:</strong> {formatDateDDMMYYYY(invoice.issueDate)}
              </p>
              <p>
                <strong>Jatuh Tempo:</strong> {formatDateDDMMYYYY(invoice.dueDate)}
              </p>
              <p>
                <strong>Status:</strong> {invoice.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
