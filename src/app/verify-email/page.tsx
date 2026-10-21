'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MailCheck,
  KeyRound,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAppState } from '@/context/AppStateContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, currentUser, verifyUserEmail, resendVerificationEmail } = useAppState();

  const initialEmail =
    searchParams.get('email') || currentUser?.email || '';
  const initialCode = searchParams.get('code') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const matchedMember = state.members.find(
    (m) => m.email.toLowerCase() === email.trim().toLowerCase()
  );

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await verifyUserEmail(email, otpCode);
      setVerifiedSuccess(true);
      setTimeout(() => {
        router.push('/member');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kode verifikasi tidak sesuai');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Masukkan alamat email Anda terlebih dahulu.');
      return;
    }
    setError('');
    setNotice('');
    setResending(true);
    try {
      const res = await resendVerificationEmail(email);
      if (res.emailResult?.sent) {
        setNotice(
          `Kode OTP baru berhasil dikirim via SMTP Hostinger (${res.emailResult.smtpUser}) ke ${email}.`
        );
      } else {
        setNotice(
          `Kode OTP baru telah diperbarui (${res.member.verificationCode}). Gunakan kode di bawah jika email tertunda.`
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulang OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-lg w-full rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up">
      <div className="bg-gradient-to-r from-[#192730] to-[#0089e4] p-7 text-white text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-2">
          <MailCheck className="h-8 w-8 text-sky-300" />
        </div>
        <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-200">
          SMTP Hostinger • admin@socare.id
        </span>
        <h1 className="text-2xl font-extrabold">Verifikasi Email Akun Member</h1>
        <p className="text-xs text-sky-100">
          Masukkan 6-Digit Kode OTP untuk mengaktifkan akun dan membuka Portal Tagihan & Pembayaran
        </p>
      </div>

      <div className="p-7 space-y-5">
        {verifiedSuccess ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
            <h2 className="text-lg font-extrabold text-emerald-900">
              Email Berhasil Diverifikasi!
            </h2>
            <p className="text-xs text-emerald-700">
              Akun Member Anda kini telah aktif sepenuhnya. Mengalihkan ke Member Dashboard...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800">
                {notice}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email Member
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  Kode Verifikasi 6-Digit OTP
                </label>
                <div className="relative">
                  <KeyRound className="h-5 w-5 text-[#0089e4] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full rounded-xl border-2 border-[#0089e4] bg-sky-50/30 py-3.5 text-center font-mono text-2xl font-black tracking-[0.5em] text-[#192730] focus:outline-none"
                  />
                </div>
              </div>

              {/* Helper Box showing active OTP if testing in sandbox or delayed email */}
              {matchedMember && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      Kode OTP Aktif untuk <strong>{matchedMember.nickname}</strong>:{' '}
                      <strong className="font-mono text-sm">
                        {matchedMember.verificationCode || '123456'}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setOtpCode(matchedMember.verificationCode || '123456')
                    }
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 px-2.5 py-1 text-[11px] font-bold text-white shrink-0"
                  >
                    Isi Otomatis
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] disabled:opacity-50 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition"
              >
                {loading ? 'Memverifikasi Kode OTP...' : 'Verifikasi Email & Aktifkan Akun'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Belum menerima email di Inbox/Spam?</span>
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 font-extrabold text-[#0089e4] hover:underline"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Mengirim Ulang...' : 'Kirim Ulang OTP (SMTP Hostinger)'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="p-8 text-center text-sm font-semibold text-slate-600">
              Memuat Halaman Verifikasi...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
