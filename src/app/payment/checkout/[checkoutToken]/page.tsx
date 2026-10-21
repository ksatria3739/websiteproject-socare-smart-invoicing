'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CreditCard,
  Building2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  ArrowLeft,
  Sparkles,
  KeyRound,
  AlertCircle,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import {
  formatIDR,
  formatDateDDMMYYYY,
  getInvoiceItemSummary,
} from '@/lib/crypto';
import { InvoiceData } from '@/lib/types';

const BANK_CHANNELS = [
  {
    code: 'BCA_VA',
    name: 'BCA Virtual Account',
    short: 'BCA',
    prefix: '88708',
    color: 'bg-blue-700',
    desc: 'Verifikasi otomatis 24 jam via m-BCA, KlikBCA & ATM BCA',
  },
  {
    code: 'MANDIRI_VA',
    name: 'Mandiri Virtual Account',
    short: 'MANDIRI',
    prefix: '89022',
    color: 'bg-amber-600',
    desc: "Verifikasi otomatis via Livin' by Mandiri & ATM Mandiri",
  },
  {
    code: 'BNI_VA',
    name: 'BNI Virtual Account',
    short: 'BNI',
    prefix: '88100',
    color: 'bg-orange-600',
    desc: 'Verifikasi otomatis via Wondr / BNI Mobile Banking & ATM',
  },
  {
    code: 'BRI_VA',
    name: 'BRI Virtual Account (BRIVA)',
    short: 'BRI',
    prefix: '88810',
    color: 'bg-sky-700',
    desc: 'Verifikasi otomatis via BRImo & jaringan ATM BRI',
  },
  {
    code: 'PERMATA_VA',
    name: 'Permata Virtual Account',
    short: 'PERMATA',
    prefix: '85280',
    color: 'bg-emerald-700',
    desc: 'Verifikasi otomatis via PermataMobile X & jaringan ATM Bersama',
  },
];

export default function PublicCheckoutPage() {
  const params = useParams();
  const checkoutToken =
    typeof params?.checkoutToken === 'string' ? params.checkoutToken : '';

  const { state, findInvoice, processPayment } = useAppState();
  const [invoice, setInvoice] = useState<InvoiceData | undefined>(() =>
    findInvoice(checkoutToken)
  );
  const [loadingToken, setLoadingToken] = useState(false);

  // Payment Tabs: CREDIT_CARD vs BANK_TRANSFER
  const [activeTab, setActiveTab] = useState<'CREDIT_CARD' | 'BANK_TRANSFER'>('CREDIT_CARD');

  // Credit Card State
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('889');
  const [installmentPlan, setInstallmentPlan] = useState('FULL');
  const [ccError, setCcError] = useState('');

  // 3DS OTP Challenge Modal State
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [otpInput, setOtpInput] = useState('123456');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Virtual Account State
  const [selectedBank, setSelectedBank] = useState(BANK_CHANNELS[0]);
  const [copiedVA, setCopiedVA] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  useEffect(() => {
    const localFound = findInvoice(checkoutToken);
    if (localFound) {
      setInvoice(localFound);
      if (!cardHolder) {
        setCardHolder(localFound.clientFullName.toUpperCase());
      }
      if (!localFound.allowCreditCard && localFound.allowBankTransfer) {
        setActiveTab('BANK_TRANSFER');
      }
      return;
    }

    if (checkoutToken) {
      setLoadingToken(true);
      fetch(`/api/invoices?token=${encodeURIComponent(checkoutToken)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.invoice) {
            setInvoice(data.invoice);
            setCardHolder(data.invoice.clientFullName.toUpperCase());
          }
        })
        .catch(() => {})
        .finally(() => setLoadingToken(false));
    }
  }, [checkoutToken, findInvoice, state.invoices, cardHolder]);

  const formatCardNumberInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const detectCardBrand = (num: string): 'VISA' | 'MASTERCARD' | 'JCB' => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('5') || clean.startsWith('2')) return 'MASTERCARD';
    if (clean.startsWith('35')) return 'JCB';
    return 'VISA';
  };

  const fillTestCard = (brand: 'VISA' | 'MASTERCARD') => {
    if (brand === 'VISA') {
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('08/29');
      setCardCvv('889');
    } else {
      setCardNumber('5454 5454 5454 5454');
      setCardExpiry('11/28');
      setCardCvv('742');
    }
    if (invoice) {
      setCardHolder(invoice.clientFullName.toUpperCase());
    }
    setCcError('');
  };

  const handleInitiateCreditCard = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 15) {
      setCcError('Nomor Kartu Kredit harus terdiri dari 15–16 digit.');
      return;
    }
    if (!cardHolder.trim()) {
      setCcError('Nama Pemegang Kartu wajib diisi.');
      return;
    }
    if (cardExpiry.length < 5) {
      setCcError('Format masa berlaku kartu harus MM/YY.');
      return;
    }
    if (cardCvv.length < 3) {
      setCcError('Kode CVV/CVC harus 3–4 digit.');
      return;
    }
    setCcError('');
    setOtpInput('123456');
    setShow3DSModal(true);
  };

  const handleConfirm3DSPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setIsProcessingPayment(true);
    try {
      const digits = cardNumber.replace(/\D/g, '');
      const brand = detectCardBrand(digits);
      const last4 = digits.slice(-4) || '4242';

      const res = await processPayment({
        tokenOrId: invoice.checkoutToken,
        paymentMethod: 'CREDIT_CARD',
        channel: brand,
        cardLast4: last4,
        cardHolder: cardHolder.trim(),
        installmentPlan,
      });

      setInvoice(res.invoice);
      setShow3DSModal(false);
    } catch (err: unknown) {
      setCcError(err instanceof Error ? err.message : 'Gagal memproses pembayaran');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleConfirmVAPayment = async () => {
    if (!invoice) return;
    setIsProcessingPayment(true);
    try {
      const res = await processPayment({
        tokenOrId: invoice.checkoutToken,
        paymentMethod: 'BANK_TRANSFER',
        channel: selectedBank.code,
      });
      setInvoice(res.invoice);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memproses konfirmasi VA');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loadingToken && !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] p-6">
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-full border-4 border-[#0089e4] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Menyiapkan Sesi Pembayaran Terenkripsi...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] p-6">
        <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-lg space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-extrabold text-[#192730]">
            Sesi Checkout Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-600">
            Token pembayaran tidak ditemukan. Pastikan Anda mengakses link pembayaran resmi dari pesan WhatsApp atau halaman Invoice.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-[#0089e4] px-5 py-2.5 text-xs font-bold text-white"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const phoneSuffix = (invoice.clientPhone || '081234567890')
    .replace(/\D/g, '')
    .slice(-10)
    .padStart(10, '0');
  const generatedVANumber = `${selectedBank.prefix} ${phoneSuffix}`;
  const cardBrand = detectCardBrand(cardNumber);

  // ============================================================================
  // PAYMENT SUCCESS RECEIPT VIEW (WHEN INVOICE IS PAID)
  // ============================================================================
  if (invoice.status === 'PAID') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#192730] to-slate-900 py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-xl w-full rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              Transaksi Berhasil & Terverifikasi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Pembayaran Lunas!
            </h1>
            <p className="text-xs text-emerald-100">
              Terima kasih, pembayaran untuk invoice <strong>{invoice.invoiceNumber}</strong> telah kami terima.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center border-b border-slate-200 pb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nominal Dibayarkan
              </span>
              <p className="text-3xl font-black text-[#192730] mt-1">
                {formatIDR(invoice.totalAmount)}
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Merchant Penerima</span>
                <span className="font-bold text-slate-900 text-right">
                  {state.company.companyName}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Nomor Invoice</span>
                <span className="font-mono font-bold text-slate-900">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Nama Klien</span>
                <span className="font-semibold text-slate-800 text-right">
                  {invoice.clientFullName} ({invoice.clientNickname})
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Metode Pembayaran</span>
                <span className="font-bold text-emerald-700 text-right">
                  {invoice.paymentMethodUsed || 'CREDIT_CARD (Visa *4242)'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">ID Referensi Gateway</span>
                <span className="font-mono font-bold text-slate-900">
                  {invoice.pgReferenceId || 'SIM-CC-VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Waktu Transaksi</span>
                <span className="font-medium text-slate-700">
                  {invoice.paidAt
                    ? new Date(invoice.paidAt).toLocaleString('id-ID')
                    : new Date().toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={`/invoices/view/${invoice.viewToken}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition"
              >
                <FileText className="h-4 w-4" />
                Lihat Invoice Stempel LUNAS
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 transition"
              >
                <Printer className="h-4 w-4 text-[#0089e4]" />
                Cetak Bukti Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ACTIVE FINTECH CHECKOUT VIEW (CREDIT CARD 3DS + VIRTUAL ACCOUNT)
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#eef2f6] pb-16">
      {/* Secure Top Header */}
      <div className="bg-[#192730] text-white border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/invoices/view/${invoice.viewToken}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Lihat Dokumen Invoice
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight">
                {state.company.companyName} — Secure Payment Gateway
              </h1>
              <p className="text-[11px] text-slate-300">
                Mode Gateway: <span className="font-mono text-sky-300">{state.company.pgProvider}</span> • Enkripsi 256-Bit SSL & 3D Secure 2.0
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
            <Lock className="h-3.5 w-3.5" />
            PCI-DSS Level 1 Verified
          </div>
        </div>
      </div>

      {/* Main Checkout Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#192730] to-[#0b3b66] p-5 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                Ringkasan Tagihan Resmi
              </span>
              <p className="text-2xl sm:text-3xl font-black mt-1">
                {formatIDR(invoice.totalAmount)}
              </p>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                No. Invoice: {invoice.invoiceNumber}
              </p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2 border-b border-slate-200 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Klien</span>
                  <span className="font-bold text-slate-900 text-right">
                    {invoice.clientFullName} ({invoice.clientNickname})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Tagihan</span>
                  <span className="font-semibold text-slate-800">
                    {formatDateDDMMYYYY(invoice.issueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batas Jatuh Tempo</span>
                  <span className="font-bold text-rose-600">
                    {formatDateDDMMYYYY(invoice.dueDate)}
                  </span>
                </div>
              </div>

              {/* Itemized Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Rincian Layanan / Produk
                </span>
                {invoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-900 leading-snug">
                        {item.description}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {item.quantity} x {formatIDR(item.unitPrice)}
                      </span>
                    </div>
                    <span className="font-extrabold text-[#192730] shrink-0">
                      {formatIDR(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">Total Pembayaran</span>
                <span className="text-lg font-black text-[#0089e4]">
                  {formatIDR(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Garansi Keamanan Pembayaran:</strong> Status invoice pada link{' '}
              <span className="font-mono text-slate-800">/invoices/view/...</span> akan otomatis berubah menjadi{' '}
              <strong className="text-emerald-700">LUNAS (PAID)</strong> seketika setelah pembayaran berhasil.
            </div>
          </div>
        </div>

        {/* Right Column: Payment Method Selector & Interactive Forms */}
        <div className="lg:col-span-7 space-y-5">
          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('CREDIT_CARD')}
              className={`flex items-center justify-center gap-2.5 rounded-xl py-3.5 px-4 text-xs sm:text-sm font-extrabold transition ${
                activeTab === 'CREDIT_CARD'
                  ? 'bg-[#0089e4] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Kartu Kredit / Debit Online
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BANK_TRANSFER')}
              className={`flex items-center justify-center gap-2.5 rounded-xl py-3.5 px-4 text-xs sm:text-sm font-extrabold transition ${
                activeTab === 'BANK_TRANSFER'
                  ? 'bg-[#0089e4] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Transfer Bank / Virtual Account
            </button>
          </div>

          {/* TAB 1: CREDIT CARD PAYMENT FLOW */}
          {activeTab === 'CREDIT_CARD' && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#192730]">
                    Pembayaran Kartu Kredit / Debit Online (3DS 2.0)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mendukung seluruh Kartu Kredit & Debit berlogo Visa, Mastercard, dan JCB
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-blue-900 text-white px-2 py-0.5 text-[10px] font-black tracking-wider">
                    VISA
                  </span>
                  <span className="rounded bg-amber-600 text-white px-2 py-0.5 text-[10px] font-black tracking-wider">
                    MASTERCARD
                  </span>
                  <span className="rounded bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-black tracking-wider">
                    JCB
                  </span>
                </div>
              </div>

              {/* Interactive Visual Credit Card Preview */}
              <div className="rounded-2xl bg-gradient-to-br from-[#192730] via-[#1e3748] to-[#0089e4] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-100/50 shadow-inner" />
                    <span className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider">
                      3D Secure 2.0 Enabled
                    </span>
                  </div>
                  <span className="text-lg font-black tracking-widest italic">
                    {cardBrand}
                  </span>
                </div>

                <p className="font-mono text-xl sm:text-2xl font-bold tracking-widest mb-6">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>

                <div className="flex items-end justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-sky-200/80 block">
                      Cardholder Name
                    </span>
                    <span className="font-bold tracking-wider uppercase">
                      {cardHolder || 'NAMA PEMEGANG KARTU'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-sky-200/80 block">
                      Valid Thru
                    </span>
                    <span className="font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Demo Quick-Fill Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 border border-sky-200 px-3.5 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#192730]">
                  <Sparkles className="h-3.5 w-3.5 text-[#0089e4]" />
                  Kartu Uji Coba Sandbox:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fillTestCard('VISA')}
                    className="rounded-lg bg-white hover:bg-sky-100 border border-sky-300 px-2.5 py-1 text-[11px] font-bold text-[#0089e4] transition"
                  >
                    Isi Visa (*4242)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCard('MASTERCARD')}
                    className="rounded-lg bg-white hover:bg-sky-100 border border-sky-300 px-2.5 py-1 text-[11px] font-bold text-[#0089e4] transition"
                  >
                    Isi Mastercard (*5454)
                  </button>
                </div>
              </div>

              {ccError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-700">
                  {ccError}
                </div>
              )}

              <form onSubmit={handleInitiateCreditCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Kartu Kredit / Debit (16 Digit)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-[#0089e4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pemegang Kartu (Sesuai Kartu)
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="NAMA LENGKAP DI KARTU"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold uppercase text-slate-900 focus:border-[#0089e4] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Masa Berlaku (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                      placeholder="08/29"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-[#0089e4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CVV / CVC (3 Digit)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="889"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-[#0089e4] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Opsi Pembayaran
                    </label>
                    <select
                      value={installmentPlan}
                      onChange={(e) => setInstallmentPlan(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0089e4] focus:outline-none"
                    >
                      <option value="FULL">Bayar Penuh (0%)</option>
                      <option value="3 Bulan">Cicilan 3 Bulan</option>
                      <option value="6 Bulan">Cicilan 6 Bulan</option>
                      <option value="12 Bulan">Cicilan 12 Bulan</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#0089e4]/25 transition"
                >
                  <Lock className="h-4 w-4" />
                  Bayar Sekarang dengan Kartu Kredit ({formatIDR(invoice.totalAmount)})
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: BANK TRANSFER / VIRTUAL ACCOUNT FLOW */}
          {activeTab === 'BANK_TRANSFER' && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-[#192730]">
                  Pilih Bank Virtual Account (Verifikasi Otomatis)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pembayaran akan diverifikasi secara instan tanpa perlu unggah bukti transfer manual
                </p>
              </div>

              {/* Bank Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BANK_CHANNELS.map((bank) => {
                  const selected = selectedBank.code === bank.code;
                  return (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
                        selected
                          ? 'border-[#0089e4] bg-sky-50/70 ring-2 ring-[#0089e4]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-lg ${bank.color} text-white px-2.5 py-1 text-[11px] font-black`}
                        >
                          {bank.short}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{bank.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {bank.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 ${
                          selected ? 'text-[#0089e4]' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Generated Virtual Account Box */}
              <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] text-sky-400 font-bold uppercase tracking-wider">
                      Nomor {selectedBank.name}
                    </span>
                    <p className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white mt-0.5">
                      {generatedVANumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedVANumber.replace(/\s/g, ''));
                      setCopiedVA(true);
                      setTimeout(() => setCopiedVA(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-3.5 py-2 text-xs font-bold text-white transition"
                  >
                    {copiedVA ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Salin VA
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      Nominal Transfer Tepat
                    </span>
                    <p className="text-lg font-extrabold text-emerald-400">
                      {formatIDR(invoice.totalAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(String(invoice.totalAmount));
                      setCopiedAmount(true);
                      setTimeout(() => setCopiedAmount(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition"
                  >
                    {copiedAmount ? 'Nominal Disalin' : 'Salin Nominal'}
                  </button>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-900">
                  Panduan Pembayaran {selectedBank.name}:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Buka aplikasi Mobile Banking ({selectedBank.short}) atau ATM terdekat.
                  </li>
                  <li>
                    Pilih menu <strong>Pembayaran / Transfer Virtual Account</strong>.
                  </li>
                  <li>
                    Masukkan Nomor Virtual Account:{' '}
                    <strong className="font-mono text-slate-900">{generatedVANumber}</strong>.
                  </li>
                  <li>
                    Periksa rincian tagihan atas nama{' '}
                    <strong>{invoice.clientFullName}</strong> sebesar{' '}
                    <strong>{formatIDR(invoice.totalAmount)}</strong>, lalu konfirmasi PIN Anda.
                  </li>
                </ol>
              </div>

              {/* Simulator Instant Confirmation Button */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmVAPayment}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-6 py-4 text-sm font-extrabold text-white shadow-lg transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isProcessingPayment
                  ? 'Memverifikasi Pembayaran...'
                  : `Simulasikan Pembayaran ${selectedBank.short} VA Diterima (Instant Lunas)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================================
          3D SECURE (3DS 2.0) BANK OTP AUTHENTICATION MODAL
      ============================================================================ */}
      {show3DSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#192730] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-extrabold">
                    3D Secure 2.0 Bank Authentication
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Verified by {cardBrand} • One-Time Password (OTP)
                  </p>
                </div>
              </div>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold">
                3DSv2
              </span>
            </div>

            <form onSubmit={handleConfirm3DSPayment} className="p-6 space-y-5">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant:</span>
                  <span className="font-bold text-slate-900">
                    {state.company.companyName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal Transaksi:</span>
                  <span className="font-extrabold text-[#0089e4]">
                    {formatIDR(invoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Kartu:</span>
                  <span className="font-mono font-bold text-slate-800">
                    •••• •••• •••• {cardNumber.replace(/\D/g, '').slice(-4) || '4242'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-medium text-slate-700 text-right line-clamp-1 max-w-[200px]">
                    {getInvoiceItemSummary(invoice)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 text-center">
                  Masukkan Kode 6-Digit OTP 3D Secure (Demo: 123456)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border-2 border-[#0089e4] bg-sky-50/30 py-3 text-center font-mono text-2xl font-black tracking-[0.5em] text-[#192730] focus:outline-none"
                />
                <p className="text-[11px] text-center text-slate-500">
                  Kode OTP simulasi otomatis terisi <strong className="font-mono">123456</strong> untuk kemudahan demo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShow3DSModal(false)}
                  className="rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-3 text-xs font-extrabold text-white shadow-md"
                >
                  {isProcessingPayment ? 'Memproses...' : 'Verifikasi & Bayar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
