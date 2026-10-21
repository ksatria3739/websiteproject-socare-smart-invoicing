'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  MailWarning,
  ShieldAlert,
  Search,
  Edit3,
  Trash2,
  Mail,
  CheckCircle2,
  X,
  Save,
  KeyRound,
  Building2,
  Phone,
  MapPin,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { AccountStatus, MemberUserData, UserRole } from '@/lib/types';

export default function AdminMembersPage() {
  const { state, saveMember, removeMember, resendVerificationEmail } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'SUSPENDED'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState('');

  // Detailed Member Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [memberCode, setMemberCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Member2026*');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('ACTIVE');
  const [verificationCode, setVerificationCode] = useState('');
  const [notes, setNotes] = useState('');
  const [sendEmailOnSave, setSendEmailOnSave] = useState(false);

  const members = state.members || [];

  const filteredMembers = members.filter((m) => {
    if (statusFilter === 'VERIFIED' && !m.isVerified) return false;
    if (statusFilter === 'UNVERIFIED' && m.isVerified) return false;
    if (statusFilter === 'SUSPENDED' && m.accountStatus !== 'SUSPENDED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.nickname.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.memberCode.toLowerCase().includes(q) ||
        (m.companyName || '').toLowerCase().includes(q) ||
        (m.phone || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openAddModal = () => {
    const seq = String(members.length + 1).padStart(3, '0');
    setEditId(null);
    setMemberCode(`MBR-SGI-2026-${seq}`);
    setFullName('');
    setNickname('');
    setEmail('');
    setPhone('');
    setPassword('Member2026*');
    setRole('MEMBER');
    setCompanyName('');
    setJobTitle('');
    setCity('');
    setAddress('');
    setIdentityNumber('');
    setIsVerified(false);
    setAccountStatus('PENDING_VERIFICATION');
    setVerificationCode(String(Math.floor(100000 + Math.random() * 900000)));
    setNotes('');
    setSendEmailOnSave(true);
    setModalOpen(true);
  };

  const openEditModal = (m: MemberUserData) => {
    setEditId(m.id);
    setMemberCode(m.memberCode);
    setFullName(m.fullName);
    setNickname(m.nickname);
    setEmail(m.email);
    setPhone(m.phone);
    setPassword(m.password || 'Member2026*');
    setRole(m.role);
    setCompanyName(m.companyName || '');
    setJobTitle(m.jobTitle || '');
    setCity(m.city || '');
    setAddress(m.address || '');
    setIdentityNumber(m.identityNumber || '');
    setIsVerified(m.isVerified);
    setAccountStatus(m.accountStatus);
    setVerificationCode(m.verificationCode || '123456');
    setNotes(m.notes || '');
    setSendEmailOnSave(false);
    setModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBannerNotice('');
    try {
      const res = await saveMember({
        id: editId || undefined,
        memberCode,
        fullName,
        nickname: nickname || fullName.split(' ')[0],
        email,
        phone,
        password,
        role,
        companyName,
        jobTitle,
        city,
        address,
        identityNumber,
        isVerified,
        accountStatus: isVerified && accountStatus === 'PENDING_VERIFICATION' ? 'ACTIVE' : accountStatus,
        verificationCode,
        notes,
        sendVerificationEmail: sendEmailOnSave,
      });

      setModalOpen(false);
      if (sendEmailOnSave) {
        if (res.emailResult?.sent) {
          setBannerNotice(
            `Data member "${res.member.fullName}" berhasil disimpan & email verifikasi OTP terkirim via SMTP Hostinger (${res.emailResult.smtpUser}).`
          );
        } else {
          setBannerNotice(
            `Data member "${res.member.fullName}" berhasil disimpan (Kode OTP: ${res.member.verificationCode}).`
          );
        }
      } else {
        setBannerNotice(`Data akun member "${res.member.fullName}" berhasil diperbarui!`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan member');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVerified = async (m: MemberUserData) => {
    const nextVerified = !m.isVerified;
    await saveMember({
      ...m,
      isVerified: nextVerified,
      accountStatus: nextVerified ? 'ACTIVE' : 'PENDING_VERIFICATION',
    });
    setBannerNotice(
      `Status verifikasi email untuk "${m.fullName}" diubah menjadi ${
        nextVerified ? 'TERVERIFIKASI (ACTIVE)' : 'BELUM VERIFIKASI'
      }.`
    );
  };

  const handleSendOtpEmail = async (m: MemberUserData) => {
    setSendingEmailId(m.id);
    setBannerNotice('');
    try {
      const res = await resendVerificationEmail(m.email);
      if (res.emailResult?.sent) {
        setBannerNotice(
          `Email verifikasi OTP (${res.member.verificationCode}) berhasil dikirim ke ${m.email} melalui SMTP Hostinger (admin@socare.id)!`
        );
      } else {
        setBannerNotice(
          `Kode OTP baru (${res.member.verificationCode}) telah di-generate untuk ${m.email}.`
        );
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengirim email OTP');
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#192730]">
            Manajemen & Konfigurasi Akun Member
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola seluruh akun Member, verifikasi OTP email via SMTP Hostinger (<strong>admin@socare.id</strong>), serta tambah/edit/hapus detail lengkap member
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-[#0089e4]/25 transition"
        >
          <UserPlus className="h-4 w-4" />
          + Tambah Akun Member Baru
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Akun Terdaftar
            </span>
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-[#0089e4] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#192730] mt-3">
            {members.length} Akun
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Termasuk Member Klien & Administrator
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Terverifikasi (Active)
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-3">
            {members.filter((m) => m.isVerified).length} Member
          </p>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            Dapat mengakses Portal Tagihan & Order
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menunggu Verifikasi OTP
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MailWarning className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-3">
            {members.filter((m) => !m.isVerified).length} Member
          </p>
          <p className="text-xs text-amber-700 font-semibold mt-1">
            Terkunci sampai kode OTP diverifikasi
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Server SMTP Verifikasi
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <p className="text-base font-black text-[#192730] mt-3 truncate">
            {state.company.smtpUser || 'admin@socare.id'}
          </p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            Hostinger SMTP ({state.company.smtpHost || 'smtp.hostinger.com'})
          </p>
        </div>
      </div>

      {bannerNotice && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 flex items-center justify-between gap-3 text-xs font-bold text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice('')} className="text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Members Table Card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-[#192730]">
              Daftar Seluruh Akun Member & Konfigurasi Rinci
            </h2>
            <p className="text-xs text-slate-500">
              Klik <strong>&ldquo;Edit Rinci&rdquo;</strong> untuk mengubah seluruh atribut profil, password, role, maupun status verifikasi member
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, perusahaan..."
                className="rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-[#0089e4] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(
                [
                  { id: 'ALL', label: 'Semua' },
                  { id: 'VERIFIED', label: 'Verified' },
                  { id: 'UNVERIFIED', label: 'Pending OTP' },
                  { id: 'SUSPENDED', label: 'Suspended' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    statusFilter === st.id
                      ? 'bg-white text-[#192730] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">ID & Nama Member</th>
                <th className="py-3.5 px-4">Kontak (Email & WA)</th>
                <th className="py-3.5 px-4">Perusahaan & Domisili</th>
                <th className="py-3.5 px-4 text-center">Verifikasi Email & OTP</th>
                <th className="py-3.5 px-4 text-right">Konfigurasi & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0089e4]">
                        {m.memberCode}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                          m.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {m.fullName} <span className="text-slate-500">({m.nickname})</span>
                    </p>
                    {m.identityNumber && (
                      <p className="text-[10px] font-mono text-slate-400">
                        ID/NIK: {m.identityNumber}
                      </p>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-semibold text-slate-800">{m.email}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      WA: {m.phone || '-'} • Pass:{' '}
                      <span className="font-mono text-slate-700">{m.password}</span>
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-800">
                      {m.companyName || '-'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {m.jobTitle || '-'} • {m.city || '-'}
                    </p>
                  </td>

                  <td className="py-4 px-4 text-center">
                    {m.accountStatus === 'SUSPENDED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-800">
                        <ShieldAlert className="h-3 w-3" />
                        SUSPENDED
                      </span>
                    ) : m.isVerified ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          VERIFIED (ACTIVE)
                        </span>
                        <p className="text-[10px] font-mono text-slate-400">
                          OTP: {m.verificationCode || '-'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                          <MailWarning className="h-3 w-3 text-amber-600" />
                          PENDING OTP
                        </span>
                        <p className="text-[10px] font-mono font-bold text-amber-900">
                          Kode OTP: {m.verificationCode || '123456'}
                        </p>
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(m)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0089e4] hover:bg-[#0073c2] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit Rinci
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleVerified(m)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                          m.isVerified
                            ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800'
                            : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <UserCheck className="h-3 w-3" />
                        {m.isVerified ? 'Set Unverified' : 'Verifikasi'}
                      </button>

                      <button
                        type="button"
                        disabled={sendingEmailId === m.id}
                        onClick={() => handleSendOtpEmail(m)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition"
                        title="Kirim kode verifikasi OTP ke email member via SMTP Hostinger"
                      >
                        <Mail className="h-3 w-3 text-[#0089e4]" />
                        {sendingEmailId === m.id ? 'Mengirim...' : 'Kirim OTP'}
                      </button>

                      {m.role !== 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Hapus permanen akun member "${m.fullName}" (${m.email})?`
                              )
                            ) {
                              removeMember(m.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 p-1.5 text-red-600 transition"
                          title="Hapus Akun Member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================================
          DETAILED ADD / EDIT MEMBER CONFIGURATION MODAL
      ============================================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in-up">
            <div className="bg-gradient-to-r from-[#192730] to-[#0089e4] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold">
                  {editId
                    ? `Konfigurasi Rinci Akun Member: ${fullName}`
                    : 'Tambah Akun Member Baru'}
                </h3>
                <p className="text-xs text-sky-100">
                  Edit seluruh bagian profil, kredensial login, status verifikasi email, dan catatan member secara rinci
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveMember}
              className="p-6 space-y-5 max-h-[82vh] overflow-y-auto"
            >
              {/* Section 1: Identity & Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode ID Member *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberCode}
                    onChange={(e) => setMemberCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role Akses *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="MEMBER">MEMBER (Klien / Pembeli)</option>
                    <option value="ADMIN">ADMIN (Full Dashboard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Akun *
                  </label>
                  <select
                    value={accountStatus}
                    onChange={(e) => {
                      const st = e.target.value as AccountStatus;
                      setAccountStatus(st);
                      if (st === 'ACTIVE') setIsVerified(true);
                      if (st === 'PENDING_VERIFICATION') setIsVerified(false);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (Terverifikasi & Aktif)</option>
                    <option value="PENDING_VERIFICATION">
                      PENDING_VERIFICATION (Wajib OTP Email)
                    </option>
                    <option value="SUSPENDED">SUSPENDED (Dibekukan)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Member *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: I Made Justin Laksmana Van Veggel"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold"
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
                    placeholder="Justin / Koh Very"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email Login *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@perusahaan.com"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Corporate & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Perusahaan / Institusi
                  </label>
                  <div className="relative">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-xs"
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
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
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
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Provinsi
                  </label>
                  <div className="relative">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Section 3: Email Verification OTP & Admin Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#192730] flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-[#0089e4]" />
                      Verifikasi Email & Kode OTP
                    </span>
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={(e) => {
                          setIsVerified(e.target.checked);
                          setAccountStatus(
                            e.target.checked ? 'ACTIVE' : 'PENDING_VERIFICATION'
                          );
                        }}
                        className="h-4 w-4 rounded"
                      />
                      Email Terverifikasi
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Kode OTP 6-Digit Saat Ini
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm font-black tracking-widest"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={sendEmailOnSave}
                      onChange={(e) => setSendEmailOnSave(e.target.checked)}
                      className="h-4 w-4 rounded text-[#0089e4]"
                    />
                    <span>
                      Kirim Email Kode OTP via SMTP Hostinger (<strong>admin@socare.id</strong>) saat disimpan
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Internal Admin (Notes)
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan riwayat konsultasi, progres dokumen PMA, atau preferensi penagihan member..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] disabled:opacity-50 px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Konfigurasi Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
