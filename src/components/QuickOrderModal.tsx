'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingBag,
  CreditCard,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CatalogItemData } from '@/lib/types';
import { formatIDR } from '@/lib/crypto';
import { useAppState } from '@/context/AppStateContext';

interface QuickOrderModalProps {
  item: CatalogItemData | null;
  onClose: () => void;
}

export function QuickOrderModal({ item, onClose }: QuickOrderModalProps) {
  const router = useRouter();
  const { createInvoice, setActiveWhatsAppInvoice } = useAppState();

  const [clientFullName, setClientFullName] = useState('');
  const [clientNickname, setClientNickname] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!item) return null;

  const totalNominal = item.price * Math.max(1, quantity);

  const handleQuickFillDemo = () => {
    setClientFullName('Koh Very Wijaya');
    setClientNickname('Koh Very');
    setClientPhone('081288990011');
    setClientEmail('very.wijaya@partnerbisnis.id');
    setCustomNote('Pemesanan langsung dari katalog website terintegrasi');
  };

  const handleOrder = async (destination: 'CHECKOUT' | 'INVOICE' | 'WHATSAPP') => {
    if (!clientFullName.trim()) {
      setError('Mohon isi Nama Lengkap Anda terlebih dahulu.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const desc = `${item.name} (${item.skuCode}) (${quantity}x)${
        customNote ? ` - ${customNote}` : ''
      }`;

      const created = await createInvoice({
        clientFullName: clientFullName.trim(),
        clientNickname:
          clientNickname.trim() || clientFullName.trim().split(' ')[0] || 'Klien',
        clientPhone: clientPhone.trim() || '081234567890',
        clientEmail: clientEmail.trim() || 'client@perusahaan.com',
        issueDate: today,
        dueDate: due,
        allowCreditCard: true,
        allowBankTransfer: true,
        notes: customNote,
        items: [
          {
            catalogId: item.id,
            skuCode: item.skuCode,
            description: desc,
            quantity,
            unitPrice: item.price,
          },
        ],
      });

      onClose();

      if (destination === 'CHECKOUT') {
        router.push(`/payment/checkout/${created.checkoutToken}`);
      } else if (destination === 'INVOICE') {
        router.push(`/invoices/view/${created.viewToken}`);
      } else {
        setActiveWhatsAppInvoice(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#192730] to-[#0089e4] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Pemesanan & Checkout Terintegrasi
              </h3>
              <p className="text-xs text-sky-100">
                Otomatis Menerbitkan Invoice Resmi & Link Pembayaran Kartu Kredit / VA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Selected Item Card */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-[#0089e4]/10 px-2 py-0.5 text-[11px] font-bold text-[#0089e4]">
                  {item.skuCode}
                </span>
                <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {item.type === 'SERVICE' ? 'JASA KONSULTAN' : 'PRODUK FISIK'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {item.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400">Harga Satuan</span>
              <p className="text-sm font-extrabold text-[#0089e4]">
                {formatIDR(item.price)}
              </p>
            </div>
          </div>

          {/* Demo Autofill Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Data Pemesan / Klien
            </span>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0089e4] hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Isi Data Contoh Otomatis
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Klien / Perusahaan *
              </label>
              <input
                type="text"
                value={clientFullName}
                onChange={(e) => setClientFullName(e.target.value)}
                placeholder="Contoh: I Made Justin Laksmana Van Veggel"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Panggilan (Nickname)
              </label>
              <input
                type="text"
                value={clientNickname}
                onChange={(e) => setClientNickname(e.target.value)}
                placeholder="Contoh: Justin / Koh Very"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Klien
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="email@perusahaan.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kuantitas / Jumlah Sesi
              </label>
              <input
                type="number"
                min={1}
                max={item.type === 'PRODUCT' && item.stock ? item.stock : 100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan Periode / Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Contoh: Bulan Juli 2026 / Retainer Q4"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>
          </div>

          {/* Total Calculation */}
          <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0089e4]" />
              <div>
                <span className="text-xs font-medium text-slate-600">
                  Total Tagihan ({quantity}x item)
                </span>
                <p className="text-[11px] text-slate-500">
                  Tersedia Kartu Kredit (Visa/MC/JCB) & Virtual Account Bank
                </p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-[#192730]">
              {formatIDR(totalNominal)}
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleOrder('CHECKOUT')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0074c2] disabled:opacity-50 px-5 py-3.5 text-sm font-bold text-white shadow-md transition"
            >
              <CreditCard className="h-4 w-4" />
              {submitting ? 'Memproses...' : 'Lanjut ke Pembayaran (Kartu Kredit / Transfer VA)'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleOrder('INVOICE')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition"
              >
                <FileText className="h-4 w-4 text-[#0089e4]" />
                Lihat Dokumen Invoice Resmi
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleOrder('WHATSAPP')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 text-xs font-bold text-emerald-800 transition"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Buat & Tampilkan Format WA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
