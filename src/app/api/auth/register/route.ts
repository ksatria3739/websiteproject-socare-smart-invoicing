import { NextRequest, NextResponse } from 'next/server';
import { getServerStore, upsertMemberUser, generateSixDigitOtp } from '@/lib/store';
import { sendMemberVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      nickname,
      email,
      phone,
      password,
      companyName,
      jobTitle,
      address,
      city,
      identityNumber,
      baseUrl,
    } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const store = getServerStore();
    const existing = store.members.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        { error: 'Alamat email ini sudah terdaftar. Silakan login atau gunakan email lain.' },
        { status: 400 }
      );
    }

    const otp = generateSixDigitOtp();
    const createdMember = upsertMemberUser({
      fullName,
      nickname: nickname || fullName.split(' ')[0],
      email,
      phone: phone || '',
      password,
      role: 'MEMBER',
      companyName: companyName || 'Personal / Klien Reguler',
      jobTitle: jobTitle || 'Member Klien',
      address: address || '',
      city: city || '',
      identityNumber: identityNumber || '',
      isVerified: false,
      accountStatus: 'PENDING_VERIFICATION',
      verificationCode: otp,
    });

    const emailResult = await sendMemberVerificationEmail(
      createdMember,
      store.company,
      baseUrl || req.nextUrl.origin
    );

    return NextResponse.json({
      ok: true,
      member: createdMember,
      emailResult,
      members: store.members,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mendaftarkan akun member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
