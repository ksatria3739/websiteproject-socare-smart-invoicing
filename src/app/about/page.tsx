'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Target,
  Compass,
  Award,
  Handshake,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAppState } from '@/context/AppStateContext';

export default function AboutPage() {
  const { state } = useAppState();

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />
      <main className="flex-1">
        {/* Banner */}
        <section className="bg-gradient-to-r from-[#192730] to-[#0b3b66] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0089e4]/20 border border-[#0089e4]/40 px-3 py-1 text-xs font-bold text-sky-300 mb-3">
              Tentang Kami — Corporate Profile
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {state.company.companyName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl">
              Konsultan manajemen internasional yang berfokus pada pendampingan investor dan perusahaan asing dalam mengembangkan usaha di Indonesia secara patuh regulasi dan berkelanjutan.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl bg-white p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0089e4]">
                <Building2 className="h-4 w-4" />
                Profil Korporasi (socare.id)
              </div>
              <h2 className="text-2xl font-extrabold text-[#192730]">
                So Safe and Easy Partner untuk Investasi & Kolaborasi Global
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>{state.company.companyName}</strong> mengedepankan integritas, kepatuhan hukum, dan kolaborasi lintas negara dalam memberikan layanan pendampingan Penanaman Modal Asing (PMA), dukungan hukum bisnis, serta fasilitasi kemitraan bisnis strategis.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sebagai bagian dari komitmen jangka panjang terhadap pengembangan sumber daya manusia, kami juga memfasilitasi penyaluran <strong>Program Magang Internasional</strong> (termasuk penempatan di Taiwan) melalui kerja sama resmi dengan perusahaan mitra internasional dan perguruan tinggi di Indonesia, serta menyediakan berbagai perangkat & modul manajemen korporasi.
              </p>
            </div>

            {/* Visi & Misi */}
            <div className="grid grid-cols-1 gap-5">
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-[#0089e4]/10 text-[#0089e4] flex items-center justify-center shrink-0">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#192730]">Visi Perusahaan</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Menjadi mitra konsultan internasional yang terpercaya dalam mendukung investasi dan kolaborasi bisnis lintas negara di Indonesia.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#192730]">Misi Perusahaan</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Mendampingi investasi asing secara patuh regulasi, memfasilitasi kemitraan bisnis internasional yang bernilai tambah, serta mendukung kerja sama pengembangan talenta secara berkelanjutan.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#192730]">Why Socare</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Pendekatan terstruktur, pemahaman regulasi lintas negara, transparansi penagihan digital, dan fokus pada kemitraan jangka panjang.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="rounded-2xl bg-[#192730] text-white p-8">
            <h3 className="text-xl font-extrabold mb-6">Core Values Kami</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Integritas',
                  desc: 'Menjunjung tinggi kejujuran, kepatuhan hukum, transparansi transaksi, dan profesionalisme di setiap pendampingan.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Keunggulan',
                  desc: 'Memberikan standar layanan terbaik mulai dari pendampingan investasi bisnis hingga program magang internasional.',
                },
                {
                  icon: Handshake,
                  title: 'Kolaborasi',
                  desc: 'Mencapai kesuksesan bersama melalui sinergi erat dengan mitra korporasi, perguruan tinggi, dan jaringan internasional.',
                },
              ].map((val) => {
                const Icon = val.icon;
                return (
                  <div key={val.title} className="rounded-xl bg-slate-800/80 border border-slate-700 p-5 space-y-2">
                    <Icon className="h-6 w-6 text-[#0089e4]" />
                    <h4 className="text-base font-bold">{val.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-6 py-3.5 text-sm font-bold text-white shadow-md transition"
            >
              Lihat Layanan & Katalog Penjualan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
