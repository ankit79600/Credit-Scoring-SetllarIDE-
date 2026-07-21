"use client";

import { useState, useEffect, useCallback } from "react";
import { Meteors } from "@/components/ui/meteors";
import Navbar from "@/components/Navbar";
import ContractUI from "@/components/Contract";
import {
  connectWallet,
  getWalletAddress,
  checkConnection,
} from "@/hooks/contract";
import Link from "next/link";
import { cn } from "@/lib/utils";

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center sm:p-6">
      <p className="text-2xl font-bold text-white/90 font-mono sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-white/20">{sub}</p>}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1] hover:bg-white/[0.04] hover:shadow-lg sm:p-6"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] transition-transform group-hover:scale-110"
        style={{ background: `${color}15` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white/90">{title}</h3>
        <p className="mt-1 text-xs text-white/40 leading-relaxed">{description}</p>
      </div>
      <div
        className="flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2"
        style={{ color }}
      >
        Open dashboard
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (await checkConnection()) {
          const addr = await getWalletAddress();
          if (addr) setWalletAddress(addr);
        }
      } catch {
        /* Freighter not installed */
      }
    })();
  }, []);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      setWalletAddress(await connectWallet());
    } catch {
      // handled in child components
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => setWalletAddress(null), []);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#050510] overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Meteors number={10} />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#7c6cf0]/20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#4fc3f7]/15 blur-[120px] animate-float-delayed" />
      </div>

      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
      />

      <main className="relative z-10 flex flex-1 w-full flex-col items-center px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <div className="w-full max-w-5xl">

          {/* Hero */}
          <div className="mb-10 text-center animate-fade-in-up sm:mb-14">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-white/50 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7c6cf0] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7c6cf0]" />
              </span>
              Live on Stellar Testnet · Powered by Soroban
            </div>

            <h1 className="mb-4">
              <span className="block text-3xl font-bold tracking-tight leading-[1.1] sm:text-5xl">
                <span className="bg-gradient-to-r from-[#7c6cf0] via-[#4fc3f7] to-[#7c6cf0] bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                  Reputation → Capital
                </span>
              </span>
              <span className="mt-2 block text-2xl font-bold text-white/80 sm:text-4xl">
                Decentralized Microloans on Stellar
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
              Your on-chain reputation — built by people who vouch for you — becomes real access to capital.
              No bank. No credit bureau. Just trust, code, and instant settlement.
            </p>

            {/* Protocol stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              <StatCard value="~5s" label="Finality" sub="Stellar network" />
              <StatCard value="<$0.01" label="Per Tx" sub="~0.00001 XLM" />
              <StatCard value="3" label="Contracts" sub="On testnet" />
            </div>
          </div>

          {/* Feature cards */}
          <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 animate-fade-in-up-delayed">
            <FeatureCard
              href="/borrow"
              color="#4fc3f7"
              title="Borrow"
              description="Check your credit score, apply for a microloan, and repay on-chain. Score ≥ 600 required."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <FeatureCard
              href="/lend"
              color="#34d399"
              title="Lend"
              description="Deposit tokens into the liquidity pool. Earn yield from interest as borrowers repay loans."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              }
            />
            <FeatureCard
              href="/evaluate"
              color="#7c6cf0"
              title="Evaluate"
              description="Submit credit scores and stake reputation tokens to vouch for borrowers. Earn rewards for good vouches."
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
            />
          </div>

          {/* How it works */}
          <div className="mb-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-8">
            <h2 className="mb-6 text-center text-base font-semibold text-white/80 sm:text-lg">How it works</h2>
            <div className="relative">
              {/* Connector line (hidden on mobile) */}
              <div className="absolute left-[calc(16.67%+1px)] right-[calc(16.67%+1px)] top-5 hidden h-px bg-white/[0.06] sm:block" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    color: "#7c6cf0",
                    title: "Evaluators vouch",
                    desc: "Employers, DAOs, and community leaders submit on-chain credit scores and stake reputation as collateral.",
                  },
                  {
                    step: "02",
                    color: "#4fc3f7",
                    title: "Borrower applies",
                    desc: "LoanPool contract cross-calls CreditScore to verify eligibility. If score ≥ 600, funds are disbursed instantly.",
                  },
                  {
                    step: "03",
                    color: "#34d399",
                    title: "Repay & earn",
                    desc: "Borrower repays principal + interest. Evaluators earn rewards. LPs receive yield. Defaulters get slashed.",
                  },
                ].map((step) => (
                  <div key={step.step} className="flex flex-col items-center text-center gap-3 relative">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold font-mono z-10 bg-[#050510]"
                      style={{ borderColor: `${step.color}40`, color: step.color }}
                    >
                      {step.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{step.title}</p>
                      <p className="mt-1 text-xs text-white/35 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Credit Score Contract UI */}
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <h2 className="text-base font-semibold text-white/80 sm:text-lg">Credit Score Contract</h2>
              <p className="mt-1 text-xs text-white/35">Submit and look up on-chain reputation scores</p>
            </div>
            <ContractUI
              walletAddress={walletAddress}
              onConnect={handleConnect}
              isConnecting={isConnecting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
