import { NextRequest, NextResponse } from 'next/server';
import { settleInvoicePayment } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * Payment Webhook & Settlement Handler (/api/payment/webhook)
 * Handles both live Midtrans/Xendit webhook callbacks AND Simulator 3DS / VA settlements.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both direct simulator payload and Midtrans/Xendit webhook payload formats
    const tokenOrId =
      body.checkoutToken ||
      body.tokenOrId ||
      body.order_id ||
      body.external_id;

    const paymentMethod =
      body.paymentMethod ||
      (body.payment_type === 'credit_card' ? 'CREDIT_CARD' : 'BANK_TRANSFER');

    const channel =
      body.channel ||
      body.bank ||
      body.payment_channel ||
      (paymentMethod === 'CREDIT_CARD' ? 'VISA' : 'BCA_VA');

    if (!tokenOrId) {
      return NextResponse.json(
        { error: 'Token atau ID invoice tidak ditemukan dalam payload.' },
        { status: 400 }
      );
    }

    const result = settleInvoicePayment({
      tokenOrId,
      paymentMethod,
      channel,
      cardLast4: body.cardLast4 || '4242',
      cardHolder: body.cardHolder,
      installmentPlan: body.installmentPlan,
    });

    return NextResponse.json({
      ok: true,
      message: 'Pembayaran berhasil diverifikasi dan status invoice diperbarui menjadi PAID.',
      invoice: result.invoice,
      transaction: result.transaction,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memproses webhook pembayaran';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
