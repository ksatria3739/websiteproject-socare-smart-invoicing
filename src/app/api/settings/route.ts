import { NextRequest, NextResponse } from 'next/server';
import { getServerStore, updateCompanySettings } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getServerStore();
  return NextResponse.json({ company: store.company });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateCompanySettings(body);
    return NextResponse.json({ ok: true, company: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui pengaturan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
