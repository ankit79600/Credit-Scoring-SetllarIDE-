import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import FeedbackModal from "@/components/FeedbackModal";
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
  title: "Stellar MicroLoan Protocol",
  description:
    "A trustless microloan protocol where your on-chain reputation becomes real access to capital — built on Stellar's low-cost, instant-settlement rails.",
  openGraph: {
    title: "Stellar MicroLoan Protocol",
    description: "Decentralized microloans powered by reputation-based credit scoring on Stellar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050510]">
        {children}
        <FeedbackModal />
        <Analytics />
      </body>
    </html>
  );
}
