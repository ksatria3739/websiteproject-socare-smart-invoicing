'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  LayoutDashboard,
  PlusCircle,
  FileText,
  CreditCard,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export function Navbar() {
  const pathname = usePathname();
  const { state, setActiveWhatsAppInvoice } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sampleInvoice =
    state.invoices.find((i) => i.invoiceNumber === 'INV/DPS/06/2026/1293') ||
    state.invoices[0];

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/about', label: 'Tentang Kami' },
    { href: '/services', label: 'Layanan & Katalog' },
    { href: '/terms', label: 'Syarat & Ketentuan' },
    { href: '/refund-policy', label: 'Kebijakan Refund' },
    { href: '/contact', label: 'Kontak' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full print:hidden">
      {/* Interactive Executive Demo Shortcut Bar */}
      <div className="bg-[#192730] text-slate-200 border-b border-slate-700/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0089e4]/20 border border-[#0089e4]/40 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
              <Sparkles className="h-3 w-3" />
              Live Integrated System
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <Phone className="h-3 w-3 text-[#0089e4]" />
              {state.company.phone}
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-slate-300">
              <Mail className="h-3 w-3 text-[#0089e4]" />
              {state.company.email}
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3 text-[#0089e4]" />
              BSD / Cisauk, Tangerang Selatan
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {sampleInvoice && (
              <>
                <button
                  onClick={() => setActiveWhatsAppInvoice(sampleInvoice)}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 transition"
                >
                  Format WA Sample
                </button>
                <Link
                  href={`/invoices/view/${sampleInvoice.viewToken}`}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition"
                >
                  <FileText className="h-3 w-3 text-sky-400" />
                  Sample View Invoice
                </Link>
                <Link
                  href={`/payment/checkout/${sampleInvoice.checkoutToken}`}
                  className="inline-flex items-center gap-1 rounded-md bg-[#0089e4]/20 hover:bg-[#0089e4]/30 border border-[#0089e4]/40 px-2.5 py-1 text-[11px] font-semibold text-sky-300 transition"
                >
                  <CreditCard className="h-3 w-3 text-sky-400" />
                  Simulasi Checkout CC
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Company Profile & Storefront Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#0089e4] to-[#192730] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#192730]">
                  {state.company.companyName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[10px] font-bold text-[#0089e4]">
                  <ShieldCheck className="h-3 w-3" />
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {state.company.companySub}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-sky-50 text-[#0089e4]'
                      : 'text-slate-700 hover:text-[#0089e4] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/admin/invoices/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0074c2] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              Buat Link Bayar
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition"
            >
              <LayoutDashboard className="h-4 w-4 text-sky-400" />
              Dashboard Admin
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                    pathname === item.href
                      ? 'bg-sky-50 text-[#0089e4]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                href="/admin/invoices/create"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0089e4] px-3 py-2.5 text-xs font-bold text-white"
              >
                <PlusCircle className="h-4 w-4" />
                Buat Invoice
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#192730] px-3 py-2.5 text-xs font-bold text-white"
              >
                <LayoutDashboard className="h-4 w-4 text-sky-400" />
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
