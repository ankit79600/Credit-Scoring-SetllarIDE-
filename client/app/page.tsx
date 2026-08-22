"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import ContractUI from "@/components/Contract";
import OnboardingModal, { useOnboarding } from "@/components/OnboardingModal";
import FeedbackModal, { FeedbackTrigger, useFeedback } from "@/components/FeedbackModal";
import {
  connectWallet,
  getWalletAddress,
  checkConnection,
} from "@/hooks/contract";
import { trackWalletConnect, trackWalletDisconnect } from "@/lib/posthog";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { showOnboarding, completeOnboarding, resetOnboarding } = useOnboarding();
  const { showFeedback, openFeedback, closeFeedback } = useFeedback();

  useEffect(() => {
    setMounted(true);
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
      const addr = await connectWallet();
      setWalletAddress(addr);
      trackWalletConnect(addr);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    trackWalletDisconnect();
    setWalletAddress(null);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#0a0a0f] overflow-hidden">
      {mounted && <ParticleBackground />}

      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
        onOpenGuide={resetOnboarding}
      />

      {/* Main split layout */}
      <main className="relative z-10 flex flex-1 w-full max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-0 lg:items-center gap-10 lg:gap-16 flex-col lg:flex-row">

        {/* ── Left: Hero ── */}
        <div className="flex-1 flex flex-col justify-center animate-fade-in-up">

          {/* Tag */}
          <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.06] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c6cf0] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7c6cf0]/70">
              Stellar Soroban · Testnet
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-5 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-white">
            Decentralized<br />
            Credit Scoring<br />
            <span className="text-white/30">on Stellar</span>
          </h1>

          {/* Subtext */}
          <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/35">
            Permissionless on-chain credit scores. Submit, verify, and share — immutably recorded on the Stellar blockchain.
          </p>

          {/* CTAs */}
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <button
              onClick={handleConnect}
              disabled={isConnecting || !!walletAddress}
              className="flex items-center gap-2 rounded-lg bg-[#7c6cf0] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#6a5dd4] active:scale-[0.98] disabled:opacity-50"
            >
              {walletAddress ? "Wallet Connected" : isConnecting ? "Connecting..." : "Launch App"}
            </button>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm text-white/50 transition-all hover:border-white/[0.15] hover:text-white/70"
            >
              View Contract
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 7h10v10M7 17 17 7" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="border-t border-white/[0.06] pt-8">
            <p className="mb-4 text-[9px] uppercase tracking-[0.2em] text-white/20 font-mono">Enterprise Infrastructure Standard</p>
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Settlement Latency", value: "~5s" },
                { label: "Proof Verification", value: "On-chain" },
                { label: "Cost Per Tx", value: "<$0.01" },
                { label: "Active Users", value: "50+" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs font-semibold text-white/60 font-mono">{s.value}</p>
                  <p className="text-[9px] uppercase tracking-wider text-white/20 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Contract Panel ── */}
        <div className="flex-1 w-full lg:max-w-[540px] animate-fade-in-up-delayed">
          <ContractUI
            walletAddress={walletAddress}
            onConnect={handleConnect}
            isConnecting={isConnecting}
          />
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/[0.04] py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
          <p className="text-[9px] font-mono uppercase tracking-wider text-white/15">
            Built on Stellar · Soroban Ready · Fast Settlement
          </p>
          <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-wider text-white/15">
            {mounted && (
              <button onClick={resetOnboarding} className="hover:text-white/40 transition-colors">
                How it works
              </button>
            )}
            <span>Freighter Wallet</span>
          </div>
        </div>
      </div>

      {mounted && showOnboarding && (
        <OnboardingModal onComplete={completeOnboarding} onConnect={handleConnect} />
      )}
      {mounted && showFeedback && <FeedbackModal onClose={closeFeedback} />}
      {mounted && !showFeedback && <FeedbackTrigger onClick={openFeedback} />}
    </div>
  );
}
