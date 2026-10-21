'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Copy,
  Check,
  Send,
  ExternalLink,
  CreditCard,
  FileText,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import {
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  formatIDR,
} from '@/lib/crypto';

export function WhatsAppModal() {
  const { activeWhatsAppInvoice, setActiveWhatsAppInvoice, state } = useAppState();
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://socare-smart-invoicing.vercel.app');
  const [customPhone, setCustomPhone] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (activeWhatsAppInvoice) {
      setCustomPhone(activeWhatsAppInvoice.clientPhone || '');
      setCopied(false);
    }
  }, [activeWhatsAppInvoice]);

  if (!activeWhatsAppInvoice) return null;

  const messageText = generateWhatsAppMessage(
    activeWhatsAppInvoice,
    state.company,
    baseUrl
  );

  const waUrl = generateWhatsAppUrl(customPhone, messageText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback copy
      const el = document.createElement('textarea');
      el.value = messageText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#192730] via-[#1e3342] to-[#0089e4] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Format Pesan WhatsApp Siap Kirim
              </h3>
              <p className="text-xs text-sky-100/80">
                100% Sesuai Standar Template Tagihan & Tokenized SHA-256 Link
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveWhatsAppInvoice(null)}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
            aria-label="Tutup Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Invoice Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <div>
              <span className="text-xs font-medium text-slate-500">Nomor Invoice:</span>
              <p className="text-sm font-bold text-slate-900">
                {activeWhatsAppInvoice.invoiceNumber}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Klien:</span>
              <p className="text-sm font-semibold text-slate-800">
                {activeWhatsAppInvoice.clientFullName} ({activeWhatsAppInvoice.clientNickname})
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500">Total Tagihan:</span>
              <p className="text-base font-extrabold text-[#0089e4]">
                {formatIDR(activeWhatsAppInvoice.totalAmount)}
              </p>
            </div>
          </div>

          {/* WhatsApp Bubble Preview */}
          <div className="rounded-xl bg-[#efeae2] p-4 border border-amber-900/10 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live Preview Pesan WhatsApp
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                SHA-256 Tokenized URLs
              </span>
            </div>
            <div className="rounded-xl rounded-tl-none bg-[#d9fdd3] p-4 text-slate-900 shadow-sm border border-emerald-200/70">
              <pre className="whitespace-pre-wrap break-all font-sans text-xs sm:text-sm leading-relaxed text-slate-800 select-all">
                {messageText}
              </pre>
            </div>
          </div>

          {/* Target WhatsApp Number Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Tujuan (Opsional untuk Kirim Langsung)
              </label>
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="Contoh: 081234567890 atau 6281234567890"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none focus:ring-2 focus:ring-[#0089e4]/20"
              />
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition"
            >
              <Send className="h-4 w-4" />
              Kirim via WA
            </a>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0089e4] hover:bg-[#0073c2] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Teks Berhasil Disalin!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Format WhatsApp
                </>
              )}
            </button>

            <Link
              href={`/invoices/view/${activeWhatsAppInvoice.viewToken}`}
              onClick={() => setActiveWhatsAppInvoice(null)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition"
            >
              <FileText className="h-4 w-4 text-[#0089e4]" />
              Buka View Invoice
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <Link
              href={`/payment/checkout/${activeWhatsAppInvoice.checkoutToken}`}
              onClick={() => setActiveWhatsAppInvoice(null)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 px-4 py-3 text-sm font-semibold text-[#0089e4] transition"
            >
              <CreditCard className="h-4 w-4" />
              Buka Link Checkout
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
