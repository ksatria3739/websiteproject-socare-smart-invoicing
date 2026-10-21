'use client';

import React from 'react';
import { FileCheck2, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAppState } from '@/context/AppStateContext';

export default function TermsPage() {
  const { state } = useAppState();

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-[#0089e4] mb-2">
                <FileCheck2 className="h-3.5 w-3.5" />
                Kepatuhan Transaksi Elektronik & Payment Gateway
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#192730]">
                Syarat & Ketentuan Layanan (Terms & Conditions)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Berlaku efektif untuk seluruh transaksi jasa konsultan dan pembelian produk pada {state.company.companyName}
              </p>
            </div>

            <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-[#192730] mb-1">
                  1. Ketentuan Umum & Identitas Penyelenggara
                </h2>
                <p>
                  Situs web dan sistem Smart Invoicing ini dikelola secara resmi oleh{' '}
                  <strong>{state.company.companyName}</strong> yang berkedudukan di{' '}
                  {state.company.address}. Seluruh penagihan jasa konsultan manajemen, pendampingan PMA, program magang internasional, maupun penjualan produk fisik tunduk pada hukum Negara Kesatuan Republik Indonesia.
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#192730] mb-1">
                  2. Mekanisme Penagihan (Tokenized Invoice) & Mata Uang
                </h2>
                <p>
                  Seluruh harga layanan dan barang dicantumkan serta ditagihkan dalam mata uang{' '}
                  <strong>Rupiah Indonesia (IDR)</strong>. Setiap tagihan resmi dilengkapi dengan Nomor Invoice unik dan tautan terenkripsi (Token SHA-256) yang dikirimkan melalui saluran resmi perusahaan (WhatsApp Resmi / Email).
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#192730] mb-1">
                  3. Metode Pembayaran Kartu Kredit & Transfer Bank
                </h2>
                <p>
                  Pembayaran dapat dilakukan secara aman melalui Kartu Kredit/Debit Online (Visa, Mastercard, JCB) yang dilindungi protokol autentikasi{' '}
                  <strong>3D Secure (3DS 2.0)</strong>, maupun melalui Virtual Account Transfer Bank Nasional (BCA, Mandiri, BNI, BRI, Permata). Data kartu kredit pelanggan diproses secara langsung melalui infrastruktur Payment Gateway tersertifikasi PCI-DSS Level 1 dan tidak disimpan di server kami.
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#192730] mb-1">
                  4. Waktu Pelaksanaan Layanan & Pengiriman Produk (Service Delivery)
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Jasa Konsultan & Program:</strong> Pendampingan dan sesi konsultasi dimulai maksimal 1x24 jam kerja setelah status invoice tercatat <strong>PAID (Lunas)</strong>.
                  </li>
                  <li>
                    <strong>Produk Fisik & Modul:</strong> Pesanan barang fisik diproses dan dikirimkan melalui ekspedisi tercatat dalam waktu 1–3 hari kerja setelah pembayaran terverifikasi.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <strong>Kontak Resmi Layanan Pelanggan:</strong> Jika terdapat pertanyaan mengenai tagihan atau transaksi, silakan hubungi kami melalui email{' '}
                  <span className="font-semibold text-slate-900">{state.company.email}</span> atau telepon/WhatsApp{' '}
                  <span className="font-semibold text-slate-900">{state.company.phone}</span>.
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
