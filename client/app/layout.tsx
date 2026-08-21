import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import PostHogProvider from "@/components/PostHogProvider";
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
  title: "Credit Scoring System — Stellar Soroban",
  description:
    "Submit, track, and verify credit scores immutably on Stellar with Soroban smart contracts. Decentralized, permissionless, and transparent.",
  keywords: ["credit score", "Stellar", "Soroban", "blockchain", "DeFi", "smart contract"],
  openGraph: {
    title: "Credit Scoring System — Stellar Soroban",
    description:
      "Decentralized credit scoring on Stellar. Submit and verify scores on-chain with Soroban smart contracts.",
    type: "website",
    url: "https://my-credit-scoring-1.vercel.app",
    siteName: "Credit Scoring System",
  },
  twitter: {
    card: "summary",
    title: "Credit Scoring System — Stellar Soroban",
    description:
      "Decentralized credit scoring on Stellar. Submit and verify scores on-chain with Soroban smart contracts.",
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
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
