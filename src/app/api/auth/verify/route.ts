import { NextRequest, NextResponse } from 'next/server';
import {
  getServerStore,
  verifyMemberOtp,
  generateSixDigitOtp,
  persistServerStore,
} from '@/lib/store';
import { sendMemberVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, code, baseUrl } = body;

    if (!email) {
      return NextResponse.json({ error: 'Alamat email diperlukan.' }, { status: 400 });
    }

    const store = getServerStore();

    if (action === 'RESEND_OTP') {
      const member = store.members.find(
        (m) => m.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!member) {
        return NextResponse.json(
          { error: 'Akun member tidak ditemukan.' },
          { status: 404 }
        );
      }

      member.verificationCode = generateSixDigitOtp();
      member.verificationSentAt = new Date().toISOString();
      member.updatedAt = new Date().toISOString();
      persistServerStore(store);

      const emailResult = await sendMemberVerificationEmail(
        member,
        store.company,
        baseUrl || req.nextUrl.origin
      );

      return NextResponse.json({
        ok: true,
        member,
        emailResult,
        members: store.members,
      });
    }

    // Default: VERIFY_OTP
    if (!code) {
      return NextResponse.json(
        { error: 'Kode OTP verifikasi wajib diisi.' },
        { status: 400 }
      );
    }

    const result = verifyMemberOtp(email, code);
    if (!result.ok || !result.member) {
      return NextResponse.json(
        { error: result.error || 'Kode verifikasi tidak valid.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      member: result.member,
      members: store.members,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memverifikasi email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
