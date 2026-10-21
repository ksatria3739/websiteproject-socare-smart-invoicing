'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { SocareLogo } from '@/components/SocareLogo';

export function Footer() {
  const { state } = useAppState();

  return (
    <footer className="bg-[#192730] text-slate-300 border-t border-slate-800 print:hidden">
      {/* Acquirer / Payment Gateway Compliance Trust Strip */}
      <div className="bg-[#131e26] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0089e4]/15 border border-[#0089e4]/30 flex items-center justify-center text-[#0089e4]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Keamanan Transaksi & Kepatuhan Payment Gateway (KYB/KYC Verified)
              </p>
              <p className="text-xs text-slate-400">
                Mendukung Pembayaran Kartu Kredit Online (3D Secure 2.0) & Virtual Account Bank Nasional
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['VISA', 'MASTERCARD', 'JCB', '3DS 2.0', 'BCA VA', 'MANDIRI VA', 'BNI VA', 'BRI VA'].map(
              (badge) => (
                <span
                  key={badge}
                  className="rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-200 tracking-wide"
                >
                  {badge}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Column 1: Company Info with Uploaded Socare Logo */}
        <div className="space-y-4">
          <SocareLogo variant="dark" size="md" showSubtitle={false} />
          <div>
            <h3 className="text-sm font-extrabold text-white">
              {state.company.companyName}
            </h3>
            <p className="text-xs text-sky-400">So Safe and Easy Partner</p>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Konsultan manajemen internasional & pusat niaga terpadu yang berfokus pada pendampingan Penanaman Modal Asing (PMA), kepatuhan hukum bisnis, kemitraan strategis lintas negara, program magang internasional, serta penyediaan produk & modul korporasi.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Terdaftar Resmi & Patuh Regulasi Indonesia
          </div>
        </div>

        {/* Column 2: Core Services */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Layanan & Solusi Utama
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li>
              <Link href="/services" className="hover:text-[#0089e4] transition flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#0089e4]" />
                Pendampingan Investasi & PT PMA
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-[#0089e4] transition flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#0089e4]" />
                Konsultasi Hukum & Kepatuhan Regulasi
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-[#0089e4] transition flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#0089e4]" />
                Fasilitasi Kemitraan Bisnis Internasional
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-[#0089e4] transition flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#0089e4]" />
                Program Magang Internasional (Taiwan)
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-[#0089e4] transition flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-[#0089e4]" />
                Katalog Produk, Modul & Starter Kit
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Member Portal */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Akses Member & Kepatuhan Legal
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li>
              <Link href="/login" className="hover:text-[#0089e4] transition flex items-center justify-between text-sky-400 font-semibold">
                <span>Login Portal Member & Admin</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-[#0089e4] transition flex items-center justify-between text-emerald-400 font-semibold">
                <span>Daftar Akun Member Baru</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#0089e4] transition flex items-center justify-between">
                <span>Syarat & Ketentuan (Terms & Conditions)</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-[#0089e4] transition flex items-center justify-between">
                <span>Kebijakan Pengembalian (Refund Policy)</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#0089e4] transition flex items-center justify-between">
                <span>Hubungi Kami & Layanan Pengaduan</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Official Contact Info */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Kantor Pusat & Kontak Resmi
          </h4>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#0089e4] shrink-0 mt-0.5" />
              <span>{state.company.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[#0089e4] shrink-0" />
              <span>{state.company.phone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-[#0089e4] shrink-0" />
              <span>{state.company.email}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-800/80 bg-[#111b22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>
            Copyright © {new Date().getFullYear()} {state.company.companyName} (socare.id). All Rights Reserved.
          </p>
          <p>
            Smart Invoicing, Tokenized SHA-256 Payment Link & Synchronized E-Commerce Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
