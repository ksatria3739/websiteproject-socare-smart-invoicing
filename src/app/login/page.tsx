'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogIn,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck,
  ArrowRight,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SocareLogo } from '@/components/SocareLogo';
import { useAppState } from '@/context/AppStateContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(res.member.email)}`);
      } else if (res.member.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/member');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal masuk ke akun');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(demoEmail, demoPass);
      if (res.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(res.member.email)}`);
      } else if (res.member.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/member');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up">
          {/* Left Branding Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#192730] via-[#132432] to-[#0089e4] p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <SocareLogo variant="dark" size="md" showSubtitle={false} />

              <div className="space-y-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-sky-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Portal Resmi Member & Admin
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Akses Portal Cek Tagihan & Pembayaran Terintegrasi
                </h1>
                <p className="text-xs text-sky-100/90 leading-relaxed">
                  Masuk menggunakan akun Member Anda yang telah diverifikasi melalui email untuk melihat status tagihan, mengunduh invoice PDF, dan melakukan pembayaran Kartu Kredit (3DS) atau Virtual Account.
                </p>
              </div>
            </div>

            {/* Quick Demo Login Cards */}
            <div className="space-y-2.5 pt-8 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Akses Cepat Demo (1-Klik Login):
              </p>

              <button
                type="button"
                onClick={() => quickLogin('admin@socare.id', 'P@ssw0rd2026*')}
                className="w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 p-3 text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-white">
                    Super Admin (admin@socare.id)
                  </p>
                  <p className="text-[10px] text-sky-200">
                    Pass: P@ssw0rd2026* • Full Dashboard & Member CRUD
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-sky-300 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => quickLogin('justin.vanveggel@gmail.com', 'Member2026*')}
                className="w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 p-3 text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-emerald-300">
                    Member Terverifikasi (Justin)
                  </p>
                  <p className="text-[10px] text-sky-100">
                    justin.vanveggel@gmail.com • Tagihan Rp 468.650
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-300 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => quickLogin('chen.weiming@pacificinvest.tw', 'Member2026*')}
                className="w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 p-3 text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-sky-300">
                    Member Korporat PMA (Mr. Chen)
                  </p>
                  <p className="text-[10px] text-sky-100">
                    chen.weiming@pacificinvest.tw • Tagihan Rp 15.500.000
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-sky-300 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => quickLogin('diana@kreasidigital.id', 'Member2026*')}
                className="w-full rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 p-3 text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-amber-300">
                    Member Belum Verifikasi (Ibu Diana)
                  </p>
                  <p className="text-[10px] text-amber-100">
                    Simulasi wajib verifikasi OTP email sebelum aktivitas
                  </p>
                </div>
                <KeyRound className="h-4 w-4 text-amber-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#192730]">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan email dan password yang terdaftar di PT Socare Group International
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-2.5 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email Resmi *
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com atau admin@socare.id"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none focus:ring-2 focus:ring-[#0089e4]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-[#0089e4] focus:outline-none focus:ring-2 focus:ring-[#0089e4]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] disabled:opacity-50 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#0089e4]/25 transition"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Portal Sekarang'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                Belum memiliki akun Member?
              </span>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 font-extrabold text-[#0089e4] hover:underline"
              >
                <UserCheck className="h-4 w-4" />
                Daftar Akun Member Baru (Verifikasi Email) &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
