import type { Metadata } from 'next';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';
import { WhatsAppModal } from '@/components/WhatsAppModal';

export const metadata: Metadata = {
  title: 'PT Socare Group International — Smart Invoicing, Payment Gateway & Corporate Solutions',
  description:
    'Perusahaan yang bergerak di bidang training SDM, Consulting PMA, Man Power Supply, Assessment & Event Corporate terintegrasi dengan Sistem Smart Invoicing & Payment Link (Kartu Kredit & Virtual Account).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <AppStateProvider>
          {children}
          <WhatsAppModal />
        </AppStateProvider>
      </body>
    </html>
  );
}
