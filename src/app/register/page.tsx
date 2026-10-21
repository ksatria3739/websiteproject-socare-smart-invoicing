'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Mail,
  Phone,
  Building2,
  MapPin,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SocareLogo } from '@/components/SocareLogo';
import { useAppState } from '@/context/AppStateContext';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAppState();

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password minimal terdiri dari 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await registerUser({
        fullName,
        nickname: nickname || fullName.split(' ')[0],
        email,
        phone,
        password,
        companyName,
        jobTitle,
        city,
        address,
        identityNumber,
      });

      const sentParam = res.emailResult?.sent ? '1' : '0';
      router.push(
        `/verify-email?email=${encodeURIComponent(
          res.member.email
        )}&sent=${sentParam}`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftarkan akun member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-4xl w-full rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#192730] via-[#132636] to-[#0089e4] p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-sky-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Registrasi Member Resmi & Verifikasi SMTP Email
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Daftar Akun Member Baru
              </h1>
              <p className="text-xs text-sky-100 max-w-xl">
                Lengkapi data diri dan perusahaan Anda. Kode verifikasi OTP 6-digit akan dikirimkan secara otomatis melalui email resmi <strong>admin@socare.id</strong> (SMTP Hostinger).
              </p>
            </div>
            <SocareLogo variant="dark" size="md" showSubtitle={false} />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-2.5 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Sesuai Identitas *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Very Wijaya"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Panggilan (Nickname) *
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: Koh Very"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email Aktif (Untuk Terima Kode OTP) *
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Perusahaan / Institusi
                </label>
                <div className="relative">
                  <Building2 className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="PT Mitra Global / Personal"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Direktur / Pemilik Bisnis / Mahasiswa"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota / Domisili
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Jakarta / Tangerang Selatan / Denpasar"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Identitas (NIK / Paspor / NPWP)
                </label>
                <input
                  type="text"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="Opsional untuk kelengkapan dokumen PMA"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama Jalan, Gedung, Ruko, Kecamatan, Kode Pos"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Akun *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Password *
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 flex items-start gap-3 text-xs text-slate-700">
              <CheckCircle2 className="h-5 w-5 text-[#0089e4] shrink-0 mt-0.5" />
              <div>
                <strong>Verifikasi Email Wajib:</strong> Setelah klik daftar, sistem akan mengirimkan kode verifikasi OTP 6-digit melalui SMTP Hostinger (<strong>admin@socare.id</strong>) ke alamat email Anda. Akun harus diverifikasi sebelum dapat melakukan pemesanan dan mengakses Portal Tagihan.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-600 hover:text-[#0089e4]"
              >
                Sudah punya akun? Masuk di sini &rarr;
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] disabled:opacity-50 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#0089e4]/25 transition"
              >
                <UserPlus className="h-4 w-4" />
                {loading
                  ? 'Mengirim Kode Verifikasi via SMTP...'
                  : 'Daftar & Kirim Kode Verifikasi Email'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
