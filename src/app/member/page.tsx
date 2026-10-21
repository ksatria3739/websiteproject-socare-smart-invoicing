'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShoppingBag,
  User,
  Save,
  Sparkles,
  Building2,
  Briefcase,
  Package,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import { useAppState } from '@/context/AppStateContext';
import { CatalogItemData } from '@/lib/types';
import {
  formatIDR,
  formatDateDDMMYYYY,
  getInvoiceItemSummary,
} from '@/lib/crypto';

export default function MemberDashboardPage() {
  const router = useRouter();
  const { state, currentUser, isLoading, findInvoice, saveMember } = useAppState();

  const [activeTab, setActiveTab] = useState<'INVOICES' | 'CATALOG' | 'PROFILE'>('INVOICES');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItemData | null>(null);
  const [invoiceLookup, setInvoiceLookup] = useState('');
  const [lookupError, setLookupError] = useState('');

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (!currentUser.isVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(currentUser.email)}`);
      } else {
        setFullName(currentUser.fullName);
        setNickname(currentUser.nickname);
        setPhone(currentUser.phone);
        setCompanyName(currentUser.companyName || '');
        setJobTitle(currentUser.jobTitle || '');
        setCity(currentUser.city || '');
        setAddress(currentUser.address || '');
        setIdentityNumber(currentUser.identityNumber || '');
        setPassword(currentUser.password || '');
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || !currentUser.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8]">
        <div className="h-10 w-10 rounded-full border-4 border-[#0089e4] border-t-transparent animate-spin" />
      </div>
    );
  }

  const memberInvoices = state.invoices.filter(
    (inv) =>
      inv.memberId === currentUser.id ||
      inv.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      inv.clientFullName.toLowerCase().includes(currentUser.nickname.toLowerCase())
  );

  const unpaidInvoices = memberInvoices.filter((i) => i.status === 'UNPAID' || i.status === 'OVERDUE');
  const paidInvoices = memberInvoices.filter((i) => i.status === 'PAID');
  const totalUnpaidAmount = unpaidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaidAmount = paidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const found = findInvoice(invoiceLookup);
    if (!found) {
      setLookupError('Nomor Invoice tidak ditemukan.');
      return;
    }
    router.push(`/invoices/view/${found.viewToken}`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMember({
      id: currentUser.id,
      email: currentUser.email,
      fullName,
      nickname,
      phone,
      companyName,
      jobTitle,
      city,
      address,
      identityNumber,
      password: password || currentUser.password,
      isVerified: true,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Animated Member Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#192730] via-[#15293a] to-[#0089e4] p-7 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-extrabold text-emerald-300">
                <UserCheck className="h-3.5 w-3.5" />
                MEMBER TERVERIFIKASI
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-xs font-bold text-sky-200">
                ID: {currentUser.memberCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Selamat Datang, {currentUser.fullName} ({currentUser.nickname})
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4 text-sky-300" />
                {currentUser.companyName || 'Member Klien'} — {currentUser.jobTitle || 'Partner'}
              </span>
              <span>• Email: {currentUser.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('CATALOG')}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-[#192730] hover:bg-sky-50 px-4 py-3 text-xs font-extrabold shadow-md transition"
            >
              <ShoppingBag className="h-4 w-4 text-[#0089e4]" />
              + Pesan Layanan / Produk Baru
            </button>
          </div>
        </div>

        {/* 4 Animated KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tagihan Aktif (Unpaid)
            </span>
            <p className="text-2xl font-black text-amber-600 mt-2">
              {formatIDR(totalUnpaidAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {unpaidInvoices.length} Invoice menunggu pembayaran
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Tagihan Lunas (Paid)
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-2">
              {formatIDR(totalPaidAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {paidInvoices.length} Invoice telah lunas
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Dokumen Invoice
            </span>
            <p className="text-2xl font-black text-[#192730] mt-2">
              {memberInvoices.length} Dokumen
            </p>
            <p className="text-xs text-[#0089e4] font-semibold mt-1">
              Terenkripsi SHA-256 Token
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Keanggotaan
            </span>
            <p className="text-xl font-black text-emerald-700 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-5 w-5" />
              AKTIF & VERIFIED
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Akses Penuh Kartu Kredit 3DS & VA
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          {[
            { id: 'INVOICES', label: `Portal Tagihan & Pembayaran (${memberInvoices.length})`, icon: FileText },
            { id: 'CATALOG', label: 'Pesan Layanan Konsultan & Produk', icon: ShoppingBag },
            { id: 'PROFILE', label: 'Edit Profil & Detail Akun Saya', icon: User },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as 'INVOICES' | 'CATALOG' | 'PROFILE')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                  activeTab === t.id
                    ? 'bg-[#0089e4] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MEMBER INVOICES & PAYMENT PORTAL */}
        {activeTab === 'INVOICES' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Search Any Invoice by Number */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#192730]">
                  Cari & Buka Nomor Invoice Spesifik
                </h2>
                <p className="text-xs text-slate-500">
                  Masukkan Nomor Invoice resmi yang Anda terima melalui WhatsApp atau Email
                </p>
              </div>
              <form onSubmit={handleLookup} className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={invoiceLookup}
                    onChange={(e) => setInvoiceLookup(e.target.value)}
                    placeholder="Contoh: INV/DPS/06/2026/1293"
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2 text-xs font-bold text-white shrink-0"
                >
                  Buka Invoice
                </button>
              </form>
            </div>
            {lookupError && (
              <p className="text-xs font-bold text-red-600">{lookupError}</p>
            )}

            {/* Member Invoices Table */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-base font-extrabold text-[#192730]">
                  Daftar Tagihan (Invoice) & Riwayat Pembayaran Anda
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Nomor Invoice</th>
                      <th className="py-3.5 px-4">Tanggal & Jatuh Tempo</th>
                      <th className="py-3.5 px-4">Rincian Layanan / Produk</th>
                      <th className="py-3.5 px-4 text-right">Nominal</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {memberInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 font-mono font-bold text-[#192730]">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-700">
                            Terbit: {formatDateDDMMYYYY(inv.issueDate)}
                          </p>
                          <p className="text-rose-600 font-semibold">
                            Tempo: {formatDateDDMMYYYY(inv.dueDate)}
                          </p>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <p className="font-semibold text-slate-900">
                            {getInvoiceItemSummary(inv)}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-[#192730] whitespace-nowrap">
                          {formatIDR(inv.totalAmount)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              PAID (LUNAS)
                            </span>
                          ) : inv.status === 'OVERDUE' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700">
                              <AlertTriangle className="h-3 w-3" />
                              OVERDUE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                              <Clock className="h-3 w-3" />
                              UNPAID
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/invoices/view/${inv.viewToken}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700"
                            >
                              <FileText className="h-3.5 w-3.5 text-[#0089e4]" />
                              Lihat PDF
                            </Link>
                            <Link
                              href={`/payment/checkout/${inv.checkoutToken}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#0089e4] hover:bg-[#0073c2] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              {inv.status === 'PAID' ? 'Bukti Lunas' : 'Bayar CC / VA'}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER NEW SERVICE / PRODUCT FROM MEMBER PORTAL */}
        {activeTab === 'CATALOG' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {state.catalog
              .filter((c) => c.isActive)
              .map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                          item.type === 'SERVICE'
                            ? 'bg-sky-50 text-[#0089e4]'
                            : 'bg-amber-50 text-amber-800'
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
                        {item.skuCode}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#192730]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-[#192730]">
                      {formatIDR(item.price)}
                    </span>
                    <button
                      onClick={() => setSelectedCatalogItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-2.5 text-xs font-bold text-white"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Buat Pesanan & Bayar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* TAB 3: MEMBER PROFILE CONFIGURATION */}
        {activeTab === 'PROFILE' && (
          <form
            onSubmit={handleSaveProfile}
            className="max-w-3xl rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#192730]">
                  Konfigurasi Detail Profil Akun Member
                </h2>
                <p className="text-xs text-slate-500">
                  Data ini digunakan secara otomatis saat menerbitkan Invoice Resmi & Bukti Pembayaran
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                {currentUser.memberCode}
              </span>
            </div>

            {profileSaved && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800">
                Detail profil akun Anda berhasil diperbarui!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perusahaan / Institusi
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Identitas (NIK / Paspor / NPWP)
                </label>
                <input
                  type="text"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Akun
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-6 py-3 text-xs font-extrabold text-white shadow-md transition"
            >
              <Save className="h-4 w-4" />
              Simpan Perubahan Profil
            </button>
          </form>
        )}
      </main>

      <QuickOrderModal
        item={selectedCatalogItem}
        onClose={() => setSelectedCatalogItem(null)}
      />

      <Footer />
    </div>
  );
}
