import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoomLoop - Virtual Rooms for Real Conversations',
  description: 'Join or create virtual rooms for scheduled discussions on any topic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <Providers>
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
