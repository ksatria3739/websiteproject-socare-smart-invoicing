import { NextRequest, NextResponse } from 'next/server';
import { getServerStore, upsertMemberUser, deleteMemberUser } from '@/lib/store';
import { sendMemberVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getServerStore();
  return NextResponse.json({ members: store.members });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.email || !body?.fullName) {
      return NextResponse.json(
        { error: 'Nama lengkap dan alamat email wajib diisi.' },
        { status: 400 }
      );
    }

    const member = upsertMemberUser(body);
    const store = getServerStore();

    let emailResult = null;
    if (body.sendVerificationEmail) {
      emailResult = await sendMemberVerificationEmail(
        member,
        store.company,
        body.baseUrl || req.nextUrl.origin
      );
    }

    return NextResponse.json({
      ok: true,
      member,
      emailResult,
      members: store.members,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan data member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID member diperlukan' }, { status: 400 });
  }
  const deleted = deleteMemberUser(id);
  const store = getServerStore();
  return NextResponse.json({ ok: deleted, members: store.members });
}
