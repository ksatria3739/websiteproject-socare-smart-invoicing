'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  MapPin,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
  UserCheck,
  LogOut,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { SocareLogo } from '@/components/SocareLogo';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, currentUser, logoutUser } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/about', label: 'Tentang Kami' },
    { href: '/services', label: 'Layanan & Katalog' },
    { href: '/terms', label: 'Syarat & Ketentuan' },
    { href: '/refund-policy', label: 'Kebijakan Refund' },
    { href: '/contact', label: 'Kontak' },
  ];

  const handleLogout = () => {
    logoutUser();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full print:hidden">
      {/* Top Corporate Bar */}
      <div className="bg-[#192730] text-slate-200 border-b border-slate-700/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0089e4]/20 border border-[#0089e4]/40 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
              <Sparkles className="h-3 w-3 animate-pulse" />
              So Safe and Easy Partner
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
            {!currentUser ? (
              <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Portal Tagihan Terproteksi — Silakan{' '}
                <Link href="/login" className="text-sky-300 font-bold hover:underline">
                  Login Member
                </Link>{' '}
                atau{' '}
                <Link href="/register" className="text-emerald-300 font-bold hover:underline">
                  Daftar Akun
                </Link>
              </span>
            ) : !currentUser.isVerified ? (
              <Link
                href={`/verify-email?email=${encodeURIComponent(currentUser.email)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 px-3 py-0.5 text-[11px] font-bold text-amber-300 animate-pulse"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Email Belum Diverifikasi — Klik untuk Input OTP
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  <UserCheck className="h-3 w-3" />
                  Login: {currentUser.fullName} ({currentUser.role})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Official Socare Logo */}
          <Link href="/" className="flex items-center gap-3">
            <SocareLogo variant="light" size="md" showSubtitle={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
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

          {/* Role-Aware Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {!currentUser ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#192730] transition shadow-sm"
                >
                  <LogIn className="h-4 w-4 text-[#0089e4]" />
                  Masuk (Login)
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0089e4] to-sky-600 hover:from-[#0074c2] hover:to-sky-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#0089e4]/20 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  Daftar Member
                </Link>
              </>
            ) : currentUser.role === 'ADMIN' ? (
              <>
                <Link
                  href="/admin/invoices/create"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0074c2] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Buat Link Bayar
                </Link>
                <Link
                  href="/admin/members"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition"
                >
                  <Users className="h-4 w-4 text-[#0089e4]" />
                  Member
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#192730] hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-white transition"
                >
                  <LayoutDashboard className="h-4 w-4 text-sky-400" />
                  Dashboard Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2.5 text-xs font-bold text-red-600 transition"
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                {!currentUser.isVerified ? (
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(currentUser.email)}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Verifikasi Email OTP
                  </Link>
                ) : (
                  <Link
                    href="/member"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0074c2] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard Member & Tagihan
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  Keluar
                </button>
              </>
            )}
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
              {!currentUser ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-800"
                  >
                    <LogIn className="h-4 w-4 text-[#0089e4]" />
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0089e4] px-3 py-2.5 text-xs font-bold text-white"
                  >
                    <UserPlus className="h-4 w-4" />
                    Daftar Member
                  </Link>
                </>
              ) : currentUser.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#192730] px-3 py-2.5 text-xs font-bold text-white"
                  >
                    <LayoutDashboard className="h-4 w-4 text-sky-400" />
                    Admin Panel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/member"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0089e4] px-3 py-2.5 text-xs font-bold text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Member Portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
