'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Package,
  CheckCircle2,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import { useAppState } from '@/context/AppStateContext';
import { CatalogItemData } from '@/lib/types';
import { formatIDR } from '@/lib/crypto';

export default function ServicesCatalogPage() {
  const { state } = useAppState();
  const [selectedItem, setSelectedItem] = useState<CatalogItemData | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'SERVICE' | 'PRODUCT'>('ALL');

  const items = state.catalog.filter(
    (c) => c.isActive && (filter === 'ALL' || c.type === filter)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-[#192730] to-[#0b3b66] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0089e4]/20 border border-[#0089e4]/40 px-3 py-1 text-xs font-bold text-sky-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Layanan Konsultan & Katalog Produk Terintegrasi
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Solusi Komprehensif Bisnis, Investasi PMA & Produk Korporasi
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl">
              Seluruh paket layanan dan produk fisik di bawah ini tersinkronisasi langsung dengan sistem penerbitan Invoice & Pembayaran Online (Kartu Kredit Visa/Mastercard/JCB & Virtual Account Bank).
            </p>
          </div>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              {[
                { id: 'ALL', label: 'Semua Layanan & Produk' },
                { id: 'SERVICE', label: 'Jasa Konsultan & Program' },
                { id: 'PRODUCT', label: 'Produk Fisik & Modul' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as 'ALL' | 'SERVICE' | 'PRODUCT')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    filter === t.id
                      ? 'bg-[#0089e4] text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
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
                    <span className="font-mono text-xs font-bold text-slate-500">
                      SKU: {item.skuCode}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#192730]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.features && (
                    <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                      {item.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-slate-400">
                      Biaya Resmi
                    </span>
                    <span className="text-lg font-extrabold text-[#192730]">
                      {formatIDR(item.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2.5 text-xs font-bold text-white transition"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <QuickOrderModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <Footer />
    </div>
  );
}
