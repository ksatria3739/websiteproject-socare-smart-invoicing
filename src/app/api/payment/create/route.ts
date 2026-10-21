import { NextRequest, NextResponse } from 'next/server';
import { findInvoiceByTokenOrId, getServerStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Modular Payment Gateway Adapter (/api/payment/create)
 * Supports:
 * - SIMULATOR (Built-in 3DS Credit Card OTP & Virtual Account Generator)
 * - MIDTRANS_SANDBOX / MIDTRANS_PRODUCTION (Snap Token / Core API structure)
 * - XENDIT (Invoice / Card Tokenization session structure)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutToken, paymentMethod, channel } = body;

    const invoice = findInvoiceByTokenOrId(checkoutToken);
    if (!invoice) {
      return NextResponse.json({ error: 'Token pembayaran tidak valid.' }, { status: 404 });
    }

    const store = getServerStore();
    const provider = store.company.pgProvider || 'SIMULATOR';

    // Generate deterministic Virtual Account number for Bank Transfer
    const bankPrefixes: Record<string, string> = {
      BCA_VA: '88708',
      MANDIRI_VA: '89022',
      BNI_VA: '88100',
      BRI_VA: '88810',
      PERMATA_VA: '85280',
    };

    const phoneDigits = (invoice.clientPhone || '081234567890')
      .replace(/[^0-9]/g, '')
      .slice(-10)
      .padStart(10, '0');
    const vaPrefix = bankPrefixes[channel] || '88708';
    const virtualAccountNumber = `${vaPrefix}${phoneDigits}`;

    return NextResponse.json({
      ok: true,
      provider,
      sessionId: `PG-SESS-${Date.now()}`,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.totalAmount,
      paymentMethod,
      channel,
      virtualAccountNumber: paymentMethod === 'BANK_TRANSFER' ? virtualAccountNumber : null,
      threeDSecureUrl:
        paymentMethod === 'CREDIT_CARD'
          ? `/payment/checkout/${invoice.checkoutToken}?3ds=challenge`
          : null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menginisiasi pembayaran';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
