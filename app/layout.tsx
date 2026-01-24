import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Keluarga Besar Haji Abdul Salam & Siti Khodijah - Trah Wonogiri",
  description: "Silsilah dan kisah perjalanan keluarga besar H. Abdul Salam (Jokariyo) dan Siti Khodijah (Kadikem) dari Wonogiri. Merawat akar, menyambung silaturahmi. Platform digital untuk mendokumentasikan warisan leluhur dan mempererat hubungan keluarga.",
  keywords: ["Silsilah Keluarga", "Family Tree", "Wonogiri", "Haji Abdul Salam", "Siti Khodijah", "Jokariyo", "Kadikem", "Trah Wonogiri", "Genealogi Jawa"],
  authors: [{ name: "Keluarga Besar Wonogiri" }],
  openGraph: {
    title: "Keluarga Besar Haji Abdul Salam & Siti Khodijah",
    description: "Merawat akar, menyambung silaturahmi. Dokumentasi digital silsilah keluarga besar dari Wonogiri.",
    type: "website",
    locale: "id_ID",
    siteName: "Trah Wonogiri Family Tree",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keluarga Besar Haji Abdul Salam & Siti Khodijah",
    description: "Silsilah digital keluarga besar Wonogiri.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
