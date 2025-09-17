import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from 'next/font/google';
import "./globals.css";
import ClientLayout from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="pt-BR" 
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeBisSkinChecked() {
                  var elements = document.querySelectorAll('[bis_skin_checked]');
                  for (var i = 0; i < elements.length; i++) {
                    elements[i].removeAttribute('bis_skin_checked');
                  }
                }
                removeBisSkinChecked();
                setTimeout(removeBisSkinChecked, 10);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
