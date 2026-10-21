'use client';

import React from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAppState } from '@/context/AppStateContext';

export default function RefundPolicyPage() {
  const { state } = useAppState();

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 mb-2">
                <RefreshCcw className="h-3.5 w-3.5" />
                Standar Kepatuhan Acquirer Kartu Kredit & Payment Gateway
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#192730]">
                Kebijakan Pengembalian Dana & Pembatalan (Refund Policy)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kebijakan resmi perlindungan konsumen {state.company.companyName}
              </p>
            </div>

            <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-[#192730] mb-1">
                  1. Ketentuan Pembatalan & Refund Jasa Konsultan
                </h2>
                <p>
                  Klien berhak mengajukan permohonan pembatalan layanan konsultasi atau program sebelum sesi pendampingan atau pengurusan dokumen resmi dimulai. Pengajuan yang disetujui sebelum pelaksanaan tahapan kerja akan mendapatkan pengembalian dana hingga <strong>100%</strong> (dikurangi biaya administrasi bank/payment gateway jika berlaku).
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#192730] mb-1">
                  2. Ketentuan Pengembalian / Penukaran Produk Fisik
                </h2>
                <p>
                  Untuk pembelian produk fisik (starter kit, buku panduan, atau perangkat modul), pelanggan dapat mengajukan penukaran barang baru atau pengembalian dana penuh dalam waktu <strong>7 (tujuh) hari kalender</strong> sejak barang diterima apabila terdapat cacat produksi, kerusakan pengiriman, atau ketidaksesuaian spesifikasi pesanan.
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#192730] mb-1">
                  3. Prosedur & Estimasi Waktu Pengembalian Dana (SLA Refund)
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Kirimkan permohonan refund beserta Nomor Invoice dan bukti pembayaran ke email resmi{' '}
                    <strong>{state.company.email}</strong> atau WhatsApp <strong>{state.company.phone}</strong>.
                  </li>
                  <li>
                    Tim Finance akan melakukan verifikasi dalam waktu maksimal <strong>2 hari kerja</strong>.
                  </li>
                  <li>
                    Untuk pembayaran menggunakan <strong>Kartu Kredit</strong>, dana akan dikembalikan langsung ke limit Kartu Kredit pemegang kartu dalam waktu 7–14 hari kerja mengikuti kebijakan bank penerbit (issuer).
                  </li>
                  <li>
                    Untuk pembayaran melalui <strong>Transfer Bank / Virtual Account</strong>, dana akan ditransfer kembali ke rekening pengirim dalam waktu 1–3 hari kerja.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <strong>Anti-Gesek Tunai (Anti-Gestun Compliance):</strong> {state.company.companyName} secara tegas melarang segala bentuk transaksi fiktif atau pencairan tunai kartu kredit (Gestun). Setiap transaksi Kartu Kredit wajib didasarkan pada tagihan layanan atau pembelian barang yang sah.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
