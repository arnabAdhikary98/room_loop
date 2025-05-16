import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoomLoop - Micro-Meetup App",
  description: "Create and join micro-meetups for focused discussions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    RoomLoop
                  </Link>
                </div>
                <nav className="ml-6 flex space-x-4 items-center">
                  <Link href="/rooms" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Rooms
                  </Link>
                  {session?.user && (
                    <Link href="/rooms/create" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                      Create Room
                    </Link>
                  )}
                </nav>
              </div>
              <div className="flex items-center">
                {session?.user ? (
                  <div className="flex space-x-4 items-center">
                    <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                      Dashboard
                    </Link>
                    <Link href="/api/auth/signout" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                      Sign Out
                    </Link>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {session.user.image ? (
                        <Image 
                          src={session.user.image} 
                          alt="User avatar" 
                          width={32} 
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">{session.user.name?.charAt(0) || &apos;?&apos;}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-4 items-center">
                    <Link href="/auth/signin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        {children}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} RoomLoop. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <Link href="/about" className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300">
                  About
                </Link>
                <Link href="/privacy" className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300">
                  Privacy
                </Link>
                <Link href="/terms" className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
