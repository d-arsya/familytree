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
  title: "Family Heritage - Digital Genealogy & Family Tree Archive",
  description: "Preserve and explore your collective family heritage. A digital platform for documenting ancestors, connecting generations, and celebrating the legacy of our families.",
  keywords: ["Family Tree", "Genealogy", "Family Heritage", "Ancestor Archive", "Connections", "Digital History", "Lineage"],
  authors: [{ name: "Family Heritage Archive" }],
  openGraph: {
    title: "Family Heritage Archive",
    description: "Preserving the past, connecting the future. Discovery your family lineage in our digital archive.",
    type: "website",
    locale: "en_US",
    siteName: "Family Heritage Tree",
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Heritage Archive",
    description: "Discover and document your family's digital genealogy.",
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
    <html lang="en" suppressHydrationWarning>
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
