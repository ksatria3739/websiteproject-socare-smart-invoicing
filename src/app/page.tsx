'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe,
  ShieldCheck,
  Building2,
  Scale,
  Handshake,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Search,
  CreditCard,
  FileText,
  Sparkles,
  Package,
  Briefcase,
  Award,
  Users,
  Layers,
  Send,
  PlusCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import { useAppState } from '@/context/AppStateContext';
import { CatalogItemData } from '@/lib/types';
import { formatIDR, formatDateDDMMYYYY } from '@/lib/crypto';

export default function HomePage() {
  const router = useRouter();
  const { state, findInvoice, setActiveWhatsAppInvoice } = useAppState();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SERVICE' | 'PRODUCT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItemData | null>(null);
  const [invoiceSearchInput, setInvoiceSearchInput] = useState('INV/DPS/06/2026/1293');
  const [lookupError, setLookupError] = useState('');

  const activeCatalog = state.catalog.filter((item) => {
    if (!item.isActive) return false;
    if (categoryFilter !== 'ALL' && item.type !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.skuCode.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInvoiceLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const found = findInvoice(invoiceSearchInput);
    if (!found) {
      setLookupError('Nomor Invoice atau Token tidak ditemukan. Coba gunakan contoh di bawah.');
      return;
    }
    router.push(`/invoices/view/${found.viewToken}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION — SOCARE.ID CORPORATE PROFILE + FINTECH COMMERCE */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#192730] via-[#152534] to-[#0b3b66] text-white py-16 lg:py-24">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#0089e4_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Hero Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#0089e4]/20 border border-[#0089e4]/40 px-4 py-1.5 text-xs font-bold text-sky-300">
                  <Globe className="h-4 w-4 text-[#0089e4]" />
                  <span>Connecting People. Expanding Business. Creating Global Impact</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Menghubungkan Anda Dengan{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-[#0089e4]">
                    Peluang Global
                  </span>{' '}
                  & Sistem Penjualan Terintegrasi
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                  <strong className="text-white">{state.company.companyName}</strong> adalah mitra konsultan manajemen internasional untuk pendampingan{' '}
                  <span className="text-sky-300 font-semibold">Penanaman Modal Asing (PMA)</span>, kepatuhan hukum bisnis, kemitraan lintas negara, program magang internasional, serta penyediaan produk & modul korporasi dengan sistem{' '}
                  <span className="text-emerald-300 font-semibold">
                    Smart Invoicing & Pembayaran Kartu Kredit (3DS) / Virtual Account
                  </span>{' '}
                  terintegrasi.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#katalog-terintegrasi"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0074c2] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0089e4]/25 transition"
                  >
                    Eksplorasi Layanan & Katalog
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/admin/invoices/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Buat Invoice & Link WA Cepat
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition"
                  >
                    Tentang Kami
                  </Link>
                </div>

                {/* Trust Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-xl">
                  <div>
                    <p className="text-2xl font-extrabold text-white">100%</p>
                    <p className="text-xs text-slate-300">Patuh Regulasi & KYB</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-sky-400">SHA-256</p>
                    <p className="text-xs text-slate-300">Tokenized Invoice Link</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-emerald-400">CC & VA</p>
                    <p className="text-xs text-slate-300">Visa/MC 3DS & Bank</p>
                  </div>
                </div>
              </div>

              {/* Right Interactive Invoice & Payment Lookup Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-white text-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-200/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-[#0089e4]/10 flex items-center justify-center text-[#0089e4]">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#192730]">
                          Portal Cek Tagihan & Pembayaran
                        </h2>
                        <p className="text-xs text-slate-500">
                          Bayar tagihan konsultan / produk dengan Kartu Kredit atau VA
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      3DS SECURE
                    </span>
                  </div>

                  <form onSubmit={handleInvoiceLookup} className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Masukkan Nomor Invoice atau Token Pembayaran
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={invoiceSearchInput}
                        onChange={(e) => setInvoiceSearchInput(e.target.value)}
                        placeholder="Contoh: INV/DPS/06/2026/1293"
                        className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-[#0089e4] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2.5 text-xs font-bold text-white transition shrink-0"
                      >
                        Buka Invoice
                      </button>
                    </div>
                    {lookupError && (
                      <p className="text-xs font-medium text-red-600">{lookupError}</p>
                    )}
                  </form>

                  {/* Sample Invoices List for Instant Demo */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tagihan Aktif (Klik untuk Uji Coba Live)
                      </span>
                      <Link
                        href="/admin"
                        className="text-xs font-bold text-[#0089e4] hover:underline"
                      >
                        Semua Invoice &rarr;
                      </Link>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {state.invoices.slice(0, 3).map((inv) => (
                        <div
                          key={inv.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50/50 p-3 transition flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-[#192730]">
                                  {inv.invoiceNumber}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    inv.status === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inv.status === 'OVERDUE'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-700 mt-0.5">
                                {inv.clientFullName} ({inv.clientNickname})
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-[#0089e4]">
                              {formatIDR(inv.totalAmount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/70">
                            <Link
                              href={`/invoices/view/${inv.viewToken}`}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition"
                            >
                              <FileText className="h-3 w-3 text-[#0089e4]" />
                              Lihat Invoice
                            </Link>
                            <Link
                              href={`/payment/checkout/${inv.checkoutToken}`}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-[#0089e4] hover:bg-[#0073c2] px-2.5 py-1.5 text-[11px] font-bold text-white transition"
                            >
                              <CreditCard className="h-3 w-3" />
                              Bayar CC / VA
                            </Link>
                            <button
                              type="button"
                              onClick={() => setActiveWhatsAppInvoice(inv)}
                              className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white transition"
                              title="Format Pesan WhatsApp"
                            >
                              <Send className="h-3 w-3" />
                              WA
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MITRA KOLABORASI TERPERCAYA & EMPAT PILAR LAYANAN SOCARE.ID */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-bold text-[#0089e4]">
                Mitra Kolaborasi Terpercaya
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#192730]">
                Solusi Komprehensif Investasi Asing, Kepatuhan Hukum & Pengembangan Talenta Global
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Kami mengedepankan integritas, kepatuhan hukum, dan kolaborasi lintas negara dalam memberikan layanan pendampingan PMA, dukungan hukum, fasilitasi kemitraan bisnis strategis, hingga penyaluran Program Magang Internasional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Building2,
                  title: 'Pendampingan Investasi & PMA',
                  desc: 'Pendampingan strategis bagi investor asing dalam pendirian dan pengembangan usaha di Indonesia melalui skema Penanaman Modal Asing (PT PMA) & OSS RBA.',
                  points: ['Pendirian Usaha & NIB', 'Strategi Struktur Investasi', 'Pelaporan LKPM Berkala'],
                },
                {
                  icon: Scale,
                  title: 'Konsultasi Hukum & Kepatuhan',
                  desc: 'Dukungan pendampingan perizinan usaha serta kepatuhan terhadap ketentuan hukum dan regulasi bisnis yang berlaku di Indonesia.',
                  points: ['Kontrak Bisnis Bilingual', 'Audit Kepatuhan Regulasi', 'Pengurusan KITAS / RPTKA'],
                },
                {
                  icon: Handshake,
                  title: 'Kemitraan Bisnis Internasional',
                  desc: 'Fasilitasi penjajakan, negosiasi, dan pengembangan kemitraan bisnis lintas negara untuk mendukung kolaborasi bernilai tambah.',
                  points: ['Identifikasi Mitra Strategis', 'Negosiasi & Penyusunan MoU', 'Monitoring Kerja Sama'],
                },
                {
                  icon: GraduationCap,
                  title: 'Program Magang Internasional',
                  desc: 'Fasilitasi penyaluran magang internasional (Taiwan & Global) melalui kerja sama perusahaan mitra luar negeri dan perguruan tinggi Indonesia.',
                  points: ['Penempatan Hotel & Industri', 'Uang Saku & Tunjangan', 'Konversi SKS Akademik'],
                },
              ].map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-2xl bg-[#f6f6f8] hover:bg-white border border-slate-200 hover:border-[#0089e4]/40 p-6 transition shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-12 w-12 rounded-xl bg-[#0089e4] text-white flex items-center justify-center mb-4 shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#192730] mb-2">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {pillar.desc}
                      </p>
                    </div>
                    <ul className="space-y-1.5 pt-3 border-t border-slate-200/80">
                      {pillar.points.map((pt) => (
                        <li
                          key={pt}
                          className="flex items-center gap-2 text-xs font-semibold text-slate-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#0089e4] shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SYNCHRONIZED SYSTEMATIC E-COMMERCE & CONSULTING CATALOG */}
        <section id="katalog-terintegrasi" className="py-16 bg-[#f6f6f8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tersinkronisasi Real-Time dengan Modul Katalog & Invoicing Admin
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#192730]">
                  Katalog Jasa Konsultan & Produk Korporasi
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Pilih layanan konsultan atau produk fisik di bawah ini untuk memesan langsung dan mendapatkan Invoice Resmi & Link Pembayaran Kartu Kredit / Virtual Account.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm self-start">
                {[
                  { id: 'ALL', label: `Semua (${state.catalog.filter((c) => c.isActive).length})` },
                  {
                    id: 'SERVICE',
                    label: `Jasa Konsultan (${
                      state.catalog.filter((c) => c.isActive && c.type === 'SERVICE').length
                    })`,
                  },
                  {
                    id: 'PRODUCT',
                    label: `Produk Fisik (${
                      state.catalog.filter((c) => c.isActive && c.type === 'PRODUCT').length
                    })`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id as 'ALL' | 'SERVICE' | 'PRODUCT')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                      categoryFilter === tab.id
                        ? 'bg-[#0089e4] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari layanan konsultan, program, SKU, atau produk..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            {/* Catalog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCatalog.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-slate-200 hover:border-[#0089e4]/50 shadow-sm hover:shadow-lg transition flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            item.type === 'SERVICE'
                              ? 'bg-sky-50 text-[#0089e4] border border-sky-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.type === 'SERVICE' ? (
                            <Briefcase className="h-3 w-3" />
                          ) : (
                            <Package className="h-3 w-3" />
                          )}
                          {item.type === 'SERVICE' ? 'JASA KONSULTAN' : 'PRODUK FISIK'}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700">
                          {item.skuCode}
                        </span>
                      </div>

                      {item.type === 'PRODUCT' && typeof item.stock === 'number' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          Stok: {item.stock} unit
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-extrabold text-[#192730] group-hover:text-[#0089e4] transition">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Features List */}
                    {item.features && item.features.length > 0 && (
                      <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                        {item.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-2 text-xs text-slate-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Card Footer Price & Checkout Button */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Investasi / Harga Resmi
                      </span>
                      <span className="text-lg font-extrabold text-[#192730]">
                        {formatIDR(item.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCatalogItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Pesan & Bayar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEUNGGULAN SOCARE (FROM SOCARE.ID) */}
        <section className="py-16 bg-[#192730] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                Keunggulan Socare Group International
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
                Pendekatan Terstruktur, Berorientasi Kolaborasi, dan Kemitraan Jangka Panjang
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Award,
                  title: 'REKAM JEJAK TERUJI',
                  desc: 'Pengalaman mendampingi mitra korporasi dan institusi dalam pengembangan usaha, investasi PMA, dan kerja sama lintas negara secara berkelanjutan.',
                },
                {
                  icon: Users,
                  title: 'JARINGAN INTERNASIONAL',
                  desc: 'Didukung jaringan mitra bisnis dan institusi pendidikan internasional (Taiwan & Asia Pasifik) untuk membuka akses kolaborasi dan peluang usaha.',
                },
                {
                  icon: Layers,
                  title: 'PENDAMPING TERPADU (B2B & B2C)',
                  desc: 'Pendekatan menyeluruh dari tahap perencanaan, perizinan legal, hingga implementasi sistem penagihan & pembayaran terintegrasi.',
                },
              ].map((adv) => {
                const Icon = adv.icon;
                return (
                  <div
                    key={adv.title}
                    className="rounded-2xl bg-slate-800/70 border border-slate-700 p-6 space-y-3"
                  >
                    <div className="h-11 w-11 rounded-xl bg-[#0089e4]/20 border border-[#0089e4]/40 flex items-center justify-center text-sky-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-wide text-white">
                      {adv.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{adv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <QuickOrderModal
        item={selectedCatalogItem}
        onClose={() => setSelectedCatalogItem(null)}
      />

      <Footer />
    </div>
  );
}
