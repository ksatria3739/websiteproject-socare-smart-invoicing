import { NextRequest, NextResponse } from 'next/server';
import { getServerStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const store = getServerStore();
    const member = store.members.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!member || member.password !== password) {
      return NextResponse.json(
        { error: 'Email atau password tidak sesuai. Silakan periksa kembali.' },
        { status: 401 }
      );
    }

    if (member.accountStatus === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Akun Anda sedang dinonaktifkan (Suspended). Silakan hubungi Admin.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      member,
      requiresVerification: !member.isVerified,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal melakukan login';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
