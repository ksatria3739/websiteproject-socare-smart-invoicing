'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAppState } from '@/context/AppStateContext';

export default function ContactPage() {
  const { state } = useAppState();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-[#0089e4] mb-2">
              Hubungi Kami — Official Contact
            </span>
            <h1 className="text-3xl font-extrabold text-[#192730]">
              Kantor Pusat & Layanan Pelanggan {state.company.companyName}
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Tim konsultan dan bagian keuangan (billing support) kami siap membantu pertanyaan Anda terkait layanan PMA, kemitraan bisnis, maupun konfirmasi pembayaran invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-[#0089e4]/10 text-[#0089e4] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#192730]">Alamat Kantor Pusat</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {state.company.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#192730]">Telepon & WhatsApp Resmi</h3>
                    <p className="text-xs text-slate-600 mt-1">{state.company.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-[#0089e4] flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#192730]">Email Korporasi & Billing</h3>
                    <p className="text-xs text-slate-600 mt-1">{state.company.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#192730]">Jam Operasional</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Senin – Jumat: 08.30 – 17.30 WIB
                      <br />
                      Sabtu: 09.00 – 14.00 WIB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-extrabold text-[#192730] mb-4">
                  Kirim Pesan / Permohonan Konsultasi & Penawaran
                </h2>

                {submitted ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                    <h3 className="text-base font-bold text-emerald-900">
                      Pesan Anda Berhasil Terkirim!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Tim konsultan {state.company.companyName} akan segera menghubungi Anda melalui WhatsApp atau Email.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      Kirim Pesan Lainnya
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nama Lengkap *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Nama Anda"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email *
                        </label>
                        <input
                          required
                          type="email"
                          placeholder="nama@perusahaan.com"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Subjek / Kebutuhan Layanan
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Konsultasi Pendirian PT PMA / Konfirmasi Invoice"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pesan Lengkap *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tuliskan rincian kebutuhan konsultasi atau pertanyaan Anda..."
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-6 py-3 text-sm font-bold text-white shadow-sm transition"
                    >
                      <Send className="h-4 w-4" />
                      Kirim Pesan Sekarang
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
