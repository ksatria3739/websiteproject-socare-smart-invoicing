# 🌐 PT Socare Group International — Smart Invoicing, Payment Gateway & Synchronized E-Commerce Web App

Sistem **Smart Invoicing, Payment Link Generator (Kartu Kredit 3D Secure & Virtual Account Bank)**, dan **Katalog Hibrida (Jasa Konsultan & Produk Fisik)** yang terintegrasi penuh dengan konsep **Company Profile Korporasi ([socare.id](https://socare.id))** serta siap di-deploy secara instan ke **Vercel (`vercel.app`)**.

---

## 🚀 Fitur Utama & Arsitektur Sistem

### 1. Public Company Profile & Synchronized E-Commerce Storefront (`/`)
Dirancang mengacu pada identitas korporasi **PT Socare Group International (`socare.id`)** sekaligus memenuhi standar verifikasi **KYB/KYC Acquirer Kartu Kredit (Midtrans / Xendit)**:
- **Company Profile Eksekutif**: Menampilkan profil perusahaan, Visi & Misi (`/about`), 4 Pilar Layanan Utama (Pendampingan PMA, Konsultasi Hukum & Kepatuhan Regulasi, Fasilitasi Kemitraan Bisnis Internasional, dan Program Magang Internasional Taiwan), serta Keunggulan Socare.
- **Katalog Penjualan Terintegrasi (`/services`)**: Pengunjung dapat memesan paket **Jasa Konsultan (`SERVICE`)** maupun **Produk Fisik & Modul (`PRODUCT`)** secara langsung dari halaman depan, yang otomatis menerbitkan Invoice Resmi & mengarahkan ke halaman Checkout.
- **Halaman Kepatuhan Payment Gateway (KYB Compliance)**: Dilengkapi halaman **Syarat & Ketentuan (`/terms`)**, **Kebijakan Pengembalian Dana & Anti-Gestun (`/refund-policy`)**, dan **Kontak Resmi (`/contact`)** sebagai syarat mutlak persetujuan fitur Kartu Kredit (CC) oleh bank penerbit dan Payment Gateway di Indonesia.

### 2. Tokenized Public Invoice View (`/invoices/view/[viewToken]`)
- **Keamanan Kriptografi SHA-256**: Diakses menggunakan 64-karakter hex hash (`SHA-256`) untuk mencegah *Insecure Direct Object Reference (IDOR)* / tebak nomor urut invoice.
- **Dokumen Digital Resmi & Print/PDF Ready**: Dilengkapi kop resmi perusahaan, rincian item, badge status (`UNPAID`, `PAID` dengan stempel watermark **LUNAS**, `OVERDUE`), tombol **Download / Cetak PDF (`@media print`)**, dan tombol **Bayar Sekarang**.

### 3. Fintech Payment Checkout & Simulator Kartu Kredit 3DS + VA (`/payment/checkout/[checkoutToken]`)
- **Kartu Kredit / Debit Online (Visa, Mastercard, JCB)**:
  - Dilengkapi pratinjau kartu interaktif, pemformatan 16-digit otomatis, pilihan cicilan (`Bayar Penuh 0%`, `3 Bulan`, `6 Bulan`, `12 Bulan`), tombol pengisian kartu uji coba 1-klik, serta **Simulasi Autentikasi Bank 3D Secure (3DS 2.0) OTP (`123456`)**.
- **Transfer Bank / Virtual Account (BCA, Mandiri, BNI, BRI, Permata)**:
  - Menghasilkan nomor Virtual Account otomatis lengkap dengan tombol salin dan panduan pembayaran ATM/M-Banking, serta simulator konfirmasi pembayaran instan.
- **Real-time Settlement**: Begitu pembayaran diselesaikan, layar otomatis beralih ke **Bukti Pembayaran Lunas (Digital Receipt)**, memotong stok produk fisik secara otomatis, dan memperbarui status invoice menjadi **PAID (LUNAS)**.

### 4. Admin Dashboard, Hybrid Catalog & One-Click WhatsApp Generator (`/admin/*`)
- **Dashboard Overview (`/admin`)**: Metrik pendapatan lunas (`PAID`), tagihan tertunda (`UNPAID`), tagihan jatuh tempo (`OVERDUE`), dan tabel manajemen seluruh invoice.
- **Generator Invoice & Link Bayar Cepat (`/admin/invoices/create`)**: Mendukung pemilihan item dari katalog maupun ketik manual (*ad-hoc item*), dengan pratinjau langsung pesan WhatsApp.
- **One-Click WhatsApp Message Template Modal**: Menghasilkan format pesan WhatsApp yang **100% persis** dengan standar yang diminta klien:
  ```text
  Halo {Client_Full_Name} ({Client_Nickname}),

  {Company_Name} telah mengirimkan tagihan untuk Anda, dengan rincian berikut:

  Nomor Invoice: {Invoice_Number}
  Tanggal: {Issue_Date_DD-MM-YYYY}
  Jatuh Tempo: {Due_Date_DD-MM-YYYY}
  Nominal: Rp {Formatted_Amount}
  Item: {Item_Summary_Description}

  Lihat invoice:
  {Base_URL}/invoices/view/{view_token_hash}

  Link pembayaran:
  {Base_URL}/payment/checkout/{checkout_token_hash}

  Jika ada pertanyaan, hubungi:
  Email: {Company_Email}
  Telp: {Company_Phone}

  Terima kasih.
  ```

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript) — Patched version (`15.5.28`) ready for Vercel
- **Styling & Icons**: Tailwind CSS + Lucide React Icons
- **Database Schema & ORM**: Prisma ORM (`prisma/schema.prisma` PostgreSQL) + Triple-Layer Serverless Store (`/tmp` + Memory + Client Sync)
- **Payment Gateway Adapter**: Modular API Routes (`/api/payment/create` & `/api/payment/webhook`) siap dihubungkan dengan API Key **Xendit** atau **Midtrans**

---

## 📦 Cara Menjalankan Secara Lokal

```bash
npm install
npm run dev
```
Buka **`http://localhost:3000`** di browser Anda.

---

## ☁️ Cara Deploy Live ke Vercel (`vercel.app`)
1. Buka dashboard [Vercel](https://vercel.com/new) dan pilih **Import Git Repository**.
2. Pilih repository GitHub proyek ini.
3. Klik **Deploy** (Framework Preset otomatis terdeteksi sebagai **Next.js** pada root directory tanpa perlu konfigurasi tambahan).
