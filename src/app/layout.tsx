import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InsanyShop",
  description: "InsanyShop",
};


const isDevelopment = process.env.NODE_ENV === 'development';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Early script to remove bis_skin_checked before React hydration
              (function() {
                function removeBisSkinChecked() {
                  var elements = document.querySelectorAll('[bis_skin_checked]');
                  for (var i = 0; i < elements.length; i++) {
                    elements[i].removeAttribute('bis_skin_checked');
                  }
                }
                // Run immediately
                removeBisSkinChecked();
                // Run again after a short delay
                setTimeout(removeBisSkinChecked, 10);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
