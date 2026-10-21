import { NextRequest, NextResponse } from 'next/server';
import { getServerStore, upsertCatalogItem, deleteCatalogItem } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getServerStore();
  return NextResponse.json({ catalog: store.catalog });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.skuCode) {
      return NextResponse.json(
        { error: 'Nama item dan kode SKU wajib diisi.' },
        { status: 400 }
      );
    }

    const item = upsertCatalogItem(body);
    const store = getServerStore();
    return NextResponse.json({ ok: true, item, catalog: store.catalog });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan katalog';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID item diperlukan' }, { status: 400 });
  }
  const deleted = deleteCatalogItem(id);
  const store = getServerStore();
  return NextResponse.json({ ok: deleted, catalog: store.catalog });
}
