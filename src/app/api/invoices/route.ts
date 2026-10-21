import { NextRequest, NextResponse } from 'next/server';
import {
  getServerStore,
  createNewInvoice,
  findInvoiceByTokenOrId,
  updateInvoiceStatus,
} from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (token) {
    const invoice = findInvoiceByTokenOrId(token);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }
    const store = getServerStore();
    return NextResponse.json({ invoice, company: store.company });
  }

  const store = getServerStore();
  return NextResponse.json({
    invoices: store.invoices,
    company: store.company,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.clientFullName || !Array.isArray(body?.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Nama lengkap klien dan minimal 1 item wajib diisi.' },
        { status: 400 }
      );
    }

    const invoice = createNewInvoice(body);
    const store = getServerStore();

    return NextResponse.json({
      ok: true,
      invoice,
      company: store.company,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal membuat invoice';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { idOrToken, status } = body;
    if (!idOrToken || !status) {
      return NextResponse.json({ error: 'Parameter idOrToken dan status diperlukan' }, { status: 400 });
    }

    const updated = updateInvoiceStatus(idOrToken, status);
    if (!updated) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, invoice: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui status invoice';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
