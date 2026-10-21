'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Settings,
  Globe,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { state, resetDemoData } = useAppState();

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard & Invoice',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/invoices/create',
      label: 'Buat Invoice & Link WA',
      icon: PlusCircle,
    },
    {
      href: '/admin/catalog',
      label: 'Katalog Jasa & Produk',
      icon: Package,
    },
    {
      href: '/admin/settings',
      label: 'Pengaturan & Gateway',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f6f6f8]">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-[#192730] text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0089e4] flex items-center justify-center text-white font-bold shadow">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-white line-clamp-1">
                  {state.company.companyName}
                </h1>
                <span className="text-[11px] text-sky-400 font-semibold block">
                  Smart Invoicing & ERP Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Quick CTA */}
          <div className="p-4">
            <Link
              href="/admin/invoices/create"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-[#0089e4]/25 transition"
            >
              <PlusCircle className="h-4 w-4" />
              + Buat Invoice & Link Bayar Cepat
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 pb-4 space-y-1 flex lg:flex-col overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                    active
                      ? 'bg-[#0089e4]/20 text-sky-300 border border-[#0089e4]/40'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-[#0089e4]' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2.5 hidden lg:block">
          <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              Gateway: {state.company.pgProvider}
            </div>
            <p className="text-[11px] text-slate-400">
              Prefix Invoice: <strong className="text-slate-200 font-mono">{state.company.invoicePrefix}</strong>
            </p>
          </div>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
          </Link>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset seluruh invoice dan katalog kembali ke data contoh awal?')) {
                resetDemoData();
              }
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/80 hover:bg-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Data Sample Demo
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#192730]">
              Panel Kendali Smart Invoicing, Payment Link & Katalog Terintegrasi
            </h2>
            <p className="text-xs text-slate-500">
              Tersinkronisasi otomatis dengan halaman Company Profile, Tokenized View Invoice, dan Checkout Kartu Kredit (3DS) / VA
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
            >
              <Globe className="h-3.5 w-3.5 text-[#0089e4]" />
              Storefront Publik
            </Link>
            <Link
              href="/admin/invoices/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Buat Invoice Baru
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
