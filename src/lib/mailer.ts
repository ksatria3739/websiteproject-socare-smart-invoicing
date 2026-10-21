import nodemailer from 'nodemailer';
import { CompanySettingData, MemberUserData } from './types';

export interface SendVerificationEmailResult {
  sent: boolean;
  provider: 'HOSTINGER_SMTP' | 'FALLBACK_SIMULATOR';
  smtpHost: string;
  smtpUser: string;
  messageId?: string;
  error?: string;
}

export async function sendMemberVerificationEmail(
  member: MemberUserData,
  company: CompanySettingData,
  baseUrl = 'https://socare-smart-invoicing.vercel.app'
): Promise<SendVerificationEmailResult> {
  const smtpHost = process.env.SMTP_HOST || company.smtpHost || 'smtp.hostinger.com';
  const smtpUser = process.env.SMTP_USER || company.smtpUser || 'admin@socare.id';
  const smtpPass = process.env.SMTP_PASS || company.smtpPass || 'P@ssw0rd2026*';
  const preferredPort = Number(process.env.SMTP_PORT || company.smtpPort || 465);

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const verifyUrl = `${cleanBaseUrl}/verify-email?email=${encodeURIComponent(
    member.email
  )}&code=${encodeURIComponent(member.verificationCode || '')}&auto=1`;

  const htmlBody = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Verifikasi Akun Member — ${company.companyName}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <tr>
              <td style="background:linear-gradient(135deg,#192730,#0089e4);padding:28px 32px;color:#ffffff;">
                <div style="font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#7dd3fc;margin-bottom:6px;">
                  VERIFIKASI AKUN RESMI • SO SAFE AND EASY PARTNER
                </div>
                <div style="font-size:22px;font-weight:800;">
                  ${company.companyName}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 14px;font-size:15px;">
                  Halo <strong>${member.fullName} (${member.nickname})</strong>,
                </p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">
                  Terima kasih telah mendaftar sebagai Member di portal resmi <strong>${company.companyName}</strong>. Sebelum dapat mengakses <strong>Portal Cek Tagihan & Pembayaran</strong> serta melakukan pemesanan layanan konsultan/produk, silakan verifikasi alamat email Anda menggunakan kode OTP berikut:
                </p>

                <div style="background:#f8fafc;border:2px dashed #0089e4;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
                  <div style="font-size:11px;font-weight:bold;text-transform:uppercase;color:#64748b;margin-bottom:8px;">
                    KODE VERIFIKASI EMAIL (6-DIGIT OTP)
                  </div>
                  <div style="font-family:monospace;font-size:34px;font-weight:900;letter-spacing:10px;color:#192730;">
                    ${member.verificationCode || '123456'}
                  </div>
                </div>

                <div style="text-align:center;margin:26px 0;">
                  <a href="${verifyUrl}" style="display:inline-block;background:#0089e4;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 28px;border-radius:10px;">
                    Verifikasi Akun Saya Sekarang
                  </a>
                </div>

                <table width="100%" style="background:#f8fafc;border-radius:10px;padding:14px;font-size:12px;color:#475569;margin-top:20px;">
                  <tr>
                    <td><strong>ID Member:</strong> ${member.memberCode}</td>
                    <td><strong>Email:</strong> ${member.email}</td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                  Jika ada pertanyaan, hubungi kami di Email: ${company.email} atau WhatsApp: ${company.phone}.<br/>
                  ${company.address}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const portsToTry = preferredPort === 465 ? [465, 587] : [preferredPort, 465];
  let lastError = '';

  for (const port of portsToTry) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 9000,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: `"${company.companyName}" <${smtpUser}>`,
        to: member.email,
        subject: `[${member.verificationCode}] Kode Verifikasi Akun Member — ${company.companyName}`,
        text: `Halo ${member.fullName} (${member.nickname}), Kode Verifikasi Email Anda di ${company.companyName} adalah: ${member.verificationCode}. Klik link berikut untuk verifikasi: ${verifyUrl}`,
        html: htmlBody,
      });

      return {
        sent: true,
        provider: 'HOSTINGER_SMTP',
        smtpHost: `${smtpHost}:${port}`,
        smtpUser,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    sent: false,
    provider: 'FALLBACK_SIMULATOR',
    smtpHost,
    smtpUser,
    error: lastError,
  };
}
