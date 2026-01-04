import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import StoreSync from '@/components/StoreSync';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Naval Shopfloor Management',
  description: 'Sistema de gestão de fabricação naval',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={cn(inter.className, "h-screen bg-background")}>
        <StoreSync />
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-slate-50/50 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
