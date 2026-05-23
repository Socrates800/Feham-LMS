import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Feham — School Management for Pakistan',
  description:
    'All-in-one school management platform for Pakistani private schools.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-white font-sans antialiased dark:bg-gray-950', inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}



