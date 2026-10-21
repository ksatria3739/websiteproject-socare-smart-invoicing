'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Send,
  ArrowLeft,
  CreditCard,
  Building2,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { useAppState } from '@/context/AppStateContext';
import {
  formatIDR,
  formatAmountNumber,
  formatDateDDMMYYYY,
} from '@/lib/crypto';

interface DraftLineItem {
  key: string;
  catalogId: string;
  skuCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { state, createInvoice, setActiveWhatsAppInvoice } = useAppState();

  const today = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientFullName, setClientFullName] = useState('');
  const [clientNickname, setClientNickname] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [allowCreditCard, setAllowCreditCard] = useState(true);
  const [allowBankTransfer, setAllowBankTransfer] = useState(true);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://socare-smart-invoicing.vercel.app');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState<DraftLineItem[]>([
    {
      key: 'row_1',
      catalogId: 'cat_soc_pma_01',
      skuCode: 'SOC-PMA-01',
      description: 'Pendampingan Penanaman Modal Asing (PMA) (SOC-PMA-01) (1x) - Retainer Oktober 2026',
      quantity: 1,
      unitPrice: 15500000,
    },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const seq = 1295 + state.invoices.length;
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    setInvoiceNumber(`${state.company.invoicePrefix}/${mm}/${yyyy}/${seq}`);
  }, [state.company.invoicePrefix, state.invoices.length]);

  const handleLoadPresetJustin = () => {
    setInvoiceNumber(`INV/DPS/06/2026/${1293 + state.invoices.length}`);
    setClientFullName('I Made Justin Laksmana Van Veggel');
    setClientNickname('Justin');
    setClientPhone('081234567890');
    setClientEmail('justin.vanveggel@gmail.com');
    setIssueDate('2026-06-15');
    setDueDate('2026-07-15');
    setItems([
      {
        key: `row_${Date.now()}`,
        catalogId: 'cat_fwp_01',
        skuCode: 'FWP 1',
        description: 'Robotics Explorer 1.0 (FWP 1) (1x) - Bulan Juli 2026',
        quantity: 1,
        unitPrice: 468650,
      },
    ]);
  };

  const handleLoadPresetKohVery = () => {
    const seq = 1295 + state.invoices.length;
    setInvoiceNumber(`${state.company.invoicePrefix}/10/2026/${seq}`);
    setClientFullName('Very Wijaya');
    setClientNickname('Koh Very');
    setClientPhone('082260604688');
    setClientEmail('very@socare.id');
    setIssueDate(today);
    setDueDate(defaultDue);
    setItems([
      {
        key: `row_${Date.now()}`,
        catalogId: 'cat_soc_pma_01',
        skuCode: 'SOC-PMA-01',
        description: 'Jasa Konsultan Manajemen & Pendampingan PMA (SOC-PMA-01) (1x) - Bulan Oktober 2026',
        quantity: 1,
        unitPrice: 15500000,
      },
    ]);
  };

  const handleSelectCatalog = (rowKey: string, catalogId: string) => {
    if (!catalogId) {
      setItems((prev) =>
        prev.map((r) => (r.key === rowKey ? { ...r, catalogId: '', skuCode: '' } : r))
      );
      return;
    }

    const found = state.catalog.find((c) => c.id === catalogId);
    if (!found) return;

    setItems((prev) =>
      prev.map((r) =>
        r.key === rowKey
          ? {
              ...r,
              catalogId: found.id,
              skuCode: found.skuCode,
              description: `${found.name} (${found.skuCode}) (${r.quantity}x)`,
              unitPrice: found.price,
            }
          : r
      )
    );
  };

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        key: `row_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        catalogId: '',
        skuCode: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveRow = (key: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((r) => r.key !== key));
  };

  const subtotal = items.reduce((acc, r) => acc + r.quantity * r.unitPrice, 0);
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  const previewSummaryItem = items
    .map((i) => i.description || 'Item Tagihan')
    .join(', ');

  const liveWhatsAppPreview = `Halo ${clientFullName || '{Client_Full_Name}'} (${
    clientNickname || '{Client_Nickname}'
  }),

${state.company.companyName} telah mengirimkan tagihan untuk Anda, dengan rincian berikut:

Nomor Invoice: ${invoiceNumber || 'INV/DPS/06/2026/1293'}
Tanggal: ${formatDateDDMMYYYY(issueDate)}
Jatuh Tempo: ${formatDateDDMMYYYY(dueDate)}
Nominal: Rp ${formatAmountNumber(grandTotal)}
Item: ${previewSummaryItem}

Lihat invoice:
${baseUrl}/invoices/view/{64_char_sha256_view_token}

Link pembayaran:
${baseUrl}/payment/checkout/{64_char_sha256_checkout_token}

Jika ada pertanyaan, hubungi:
Email: ${state.company.email}
Telp: ${state.company.phone}

Terima kasih.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFullName.trim()) {
      setError('Nama Lengkap Klien wajib diisi.');
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      setError('Deskripsi item tagihan tidak boleh kosong.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const created = await createInvoice({
        invoiceNumber,
        clientFullName: clientFullName.trim(),
        clientNickname:
          clientNickname.trim() || clientFullName.trim().split(' ')[0] || 'Klien',
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        issueDate,
        dueDate,
        taxAmount,
        discountAmount,
        allowCreditCard,
        allowBankTransfer,
        notes,
        items: items.map((r) => ({
          catalogId: r.catalogId || null,
          skuCode: r.skuCode || undefined,
          description: r.description.trim(),
          quantity: r.quantity,
          unitPrice: r.unitPrice,
        })),
      });

      setActiveWhatsAppInvoice(created);
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-[#192730]">
              Generator Invoice & Link Pembayaran WhatsApp
            </h1>
            <p className="text-xs text-slate-500">
              Pilih dari Katalog Jasa/Produk atau ketik manual, lalu salin format pesan WhatsApp otomatis
            </p>
          </div>
        </div>

        {/* Instant Demo Fill Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadPresetJustin}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-2 text-xs font-bold text-[#0089e4] transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Isi Sample Blueprint (Justin - Rp 468.650)
          </button>
          <button
            type="button"
            onClick={handleLoadPresetKohVery}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Isi Sample Konsultan PMA (Koh Very)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Card 1: Client & Invoice Meta */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#192730] border-b border-slate-100 pb-3">
              1. Informasi Klien & Nomor Invoice
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Klien (Client Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={clientFullName}
                  onChange={(e) => setClientFullName(e.target.value)}
                  placeholder="Contoh: I Made Justin Laksmana Van Veggel"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Panggilan (Nickname di Sapaan WA) *
                </label>
                <input
                  type="text"
                  required
                  value={clientNickname}
                  onChange={(e) => setClientNickname(e.target.value)}
                  placeholder="Contoh: Justin / Koh Very"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Klien
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Klien
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="klien@perusahaan.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Invoice (Dapat Disesuaikan)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-[#0089e4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Terbit Invoice
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Hybrid Catalog & Ad-Hoc Line Items */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#192730]">
                  2. Rincian Item Tagihan (Katalog Jasa/Barang atau Input Manual)
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih dari katalog yang sudah ada atau ketik deskripsi custom (ad-hoc)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 text-xs font-bold text-[#0089e4] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Baris Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((row, idx) => (
                <div
                  key={row.key}
                  className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#192730] flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-[#0089e4]" />
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.key)}
                        className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-12">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Pilih Cepat dari Katalog (Opsional — Jasa Konsultan & Produk)
                      </label>
                      <select
                        value={row.catalogId}
                        onChange={(e) => handleSelectCatalog(row.key, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#0089e4] focus:outline-none"
                      >
                        <option value="">
                          -- Ketik Manual (Ad-Hoc Item) atau Pilih dari Katalog --
                        </option>
                        <optgroup label="JASA KONSULTAN & PROGRAM (SERVICE)">
                          {state.catalog
                            .filter((c) => c.type === 'SERVICE')
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                [{c.skuCode}] {c.name} — {formatIDR(c.price)}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="PRODUK FISIK & MODUL (PRODUCT)">
                          {state.catalog
                            .filter((c) => c.type === 'PRODUCT')
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                [{c.skuCode}] {c.name} — {formatIDR(c.price)} (Stok: {c.stock})
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Deskripsi Item (Muncul di Invoice & WA) *
                      </label>
                      <input
                        type="text"
                        required
                        value={row.description}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((r) =>
                              r.key === row.key ? { ...r, description: e.target.value } : r
                            )
                          )
                        }
                        placeholder="Contoh: Robotics Explorer 1.0 (FWP 1) (1x) - Bulan Juli 2026"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => {
                          const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setItems((prev) =>
                            prev.map((r) => (r.key === row.key ? { ...r, quantity: q } : r))
                          );
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Harga Satuan (Rp)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={row.unitPrice}
                        onChange={(e) => {
                          const p = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setItems((prev) =>
                            prev.map((r) => (r.key === row.key ? { ...r, unitPrice: p } : r))
                          );
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tax, Discount & Allowed Payment Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pajak / PPN Tambahan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Diskon / Potongan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) =>
                    setDiscountAmount(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <span className="block text-xs font-bold text-slate-700">
                Metode Pembayaran yang Diizinkan pada Link Checkout:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCreditCard}
                    onChange={(e) => setAllowCreditCard(e.target.checked)}
                    className="h-4 w-4 rounded text-[#0089e4]"
                  />
                  <CreditCard className="h-4 w-4 text-[#0089e4]" />
                  <span className="text-xs font-bold text-slate-800">
                    Credit Card (Visa / Mastercard / JCB)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowBankTransfer}
                    onChange={(e) => setAllowBankTransfer(e.target.checked)}
                    className="h-4 w-4 rounded text-[#0089e4]"
                  />
                  <Building2 className="h-4 w-4 text-[#0089e4]" />
                  <span className="text-xs font-bold text-slate-800">
                    Bank Transfer / Virtual Account
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Total Nominal Tagihan</span>
                <span className="text-2xl font-black text-[#0089e4]">
                  {formatIDR(grandTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] disabled:opacity-50 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition"
              >
                <Send className="h-4 w-4" />
                {submitting
                  ? 'Menyimpan...'
                  : 'Simpan & Generate Format Pesan WhatsApp'}
              </button>
            </div>
          </div>
        </form>

        {/* Live WhatsApp Message Preview Column */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <div className="rounded-2xl bg-[#192730] text-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-extrabold">
                    Live Preview Format WhatsApp
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    100% Persis dengan Standar Format Tagihan Klien
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                AUTO-SYNC
              </span>
            </div>

            <div className="rounded-xl bg-[#efeae2] p-3.5 text-slate-900">
              <div className="rounded-xl rounded-tl-none bg-[#d9fdd3] p-4 shadow-sm border border-emerald-200">
                <pre className="whitespace-pre-wrap break-all font-sans text-xs leading-relaxed text-slate-800">
                  {liveWhatsAppPreview}
                </pre>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Begitu Anda mengklik <strong>&ldquo;Simpan & Generate Format Pesan WhatsApp&rdquo;</strong>, sistem akan menghasilkan hash kriptografi <strong className="text-sky-300 font-mono">SHA-256 (64 karakter)</strong> dan menampilkan modal siap salin / kirim langsung ke WhatsApp klien.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
