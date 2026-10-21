import { CompanySettingData, InvoiceData } from './types';

/**
 * Pure deterministic SHA-256 implementation (works synchronously in both Node.js & Browser)
 * Produces an authentic 64-character lowercase hexadecimal cryptographic hash.
 */
export function sha256Hex(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // UTF-8 encode string
  const utf8 = unescape(encodeURIComponent(ascii));
  let str = utf8 + '\x80';
  while ((str[lengthProperty] % 64) - 56) str += '\x00';
  for (i = 0; i < str[lengthProperty]; i++) {
    j = str.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Generates a unique 64-character SHA-256 hex token for viewToken or checkoutToken.
 */
export function generateInvoiceTokens(invoiceNumber: string, clientName: string, salt = ''): {
  viewToken: string;
  checkoutToken: string;
} {
  const seed = `${invoiceNumber}|${clientName}|${salt || Date.now().toString()}`;
  const viewToken = sha256Hex(`VIEW::${seed}::SOCARE_SECRET_KEY_2026`);
  const checkoutToken = sha256Hex(`CHECKOUT::${seed}::SOCARE_SECRET_KEY_2026`);
  return { viewToken, checkoutToken };
}

/**
 * Formats integer/decimal amount into Indonesian dot-separated nominal, e.g., 468650 -> "468.650"
 */
export function formatAmountNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

/**
 * Formats amount with Rp prefix, e.g., "Rp 468.650"
 */
export function formatIDR(amount: number): string {
  return `Rp ${formatAmountNumber(amount)}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into DD-MM-YYYY as required by WhatsApp template
 */
export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '-';
  // Handle YYYY-MM-DD directly to avoid timezone shift
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Formats a date string into Indonesian readable date, e.g., "15 Juni 2026"
 */
export function formatDateLongID(dateStr: string): string {
  if (!dateStr) return '-';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${parseInt(parts[2], 10)} ${months[mIdx] || parts[1]} ${parts[0]}`;
  }
  return dateStr;
}

/**
 * Summarizes invoice line items into a concise description string for the WhatsApp template.
 */
export function getInvoiceItemSummary(invoice: InvoiceData): string {
  if (!invoice.items || invoice.items.length === 0) {
    return 'Layanan Konsultan / Tagihan Reguler';
  }
  if (invoice.items.length === 1) {
    return invoice.items[0].description;
  }
  return invoice.items
    .map((item) =>
      item.quantity > 1 && !item.description.includes(`(${item.quantity}x)`)
        ? `${item.description} (${item.quantity}x)`
        : item.description
    )
    .join(', ');
}

/**
 * CRITICAL FORMAT REQUIREMENT FROM BLUEPRINT:
 * Generates the 100% exact WhatsApp message template requested by Koh Very.
 */
export function generateWhatsAppMessage(
  invoice: InvoiceData,
  company: CompanySettingData,
  baseUrl: string
): string {
  const cleanBaseUrl = (baseUrl || 'https://socare-smart-invoicing.vercel.app').replace(/\/+$/, '');
  const itemSummary = getInvoiceItemSummary(invoice);

  return `Halo ${invoice.clientFullName} (${invoice.clientNickname}),

${company.companyName} telah mengirimkan tagihan untuk Anda, dengan rincian berikut:

Nomor Invoice: ${invoice.invoiceNumber}
Tanggal: ${formatDateDDMMYYYY(invoice.issueDate)}
Jatuh Tempo: ${formatDateDDMMYYYY(invoice.dueDate)}
Nominal: Rp ${formatAmountNumber(invoice.totalAmount)}
Item: ${itemSummary}

Lihat invoice:
${cleanBaseUrl}/invoices/view/${invoice.viewToken}

Link pembayaran:
${cleanBaseUrl}/payment/checkout/${invoice.checkoutToken}

Jika ada pertanyaan, hubungi:
Email: ${company.email}
Telp: ${company.phone}

Terima kasih.`;
}

/**
 * Generates a direct wa.me link with pre-populated message
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}
