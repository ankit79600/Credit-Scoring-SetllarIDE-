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
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { trackWalletConnect, trackWalletDisconnect } from "@/lib/posthog";

const ParticleBackground = dynamic(
  () => import("@/components/ParticleBackground"),
  { ssr: false }
);

// ── Background ────────────────────────────────────────────────

function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030308]" />
      <div className="absolute -top-80 -left-40 w-[700px] h-[700px] rounded-full bg-[#7c6cf0] opacity-[0.06] blur-[130px] animate-blob" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-[#4fc3f7] opacity-[0.04] blur-[100px] animate-blob-delayed" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ── Contract Info Sidebar ─────────────────────────────────────

function ContractSidebar() {
  const truncate = (s: string) => `${s.slice(0, 8)}...${s.slice(-6)}`;
  return (
    <div className="hidden xl:flex flex-col gap-4 w-[240px] shrink-0">
      {/* Contract info */}
      <div className="rounded-2xl glass p-5" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25">
            Contract
          </span>
        </div>
        <p className="font-mono text-[10px] text-white/40 break-all leading-relaxed mb-4">
          {truncate(CONTRACT_ADDRESS)}
        </p>
        <div className="space-y-2.5">
          {[
            { label: "Network", val: "Testnet" },
            { label: "Language", val: "Rust" },
            { label: "SDK", val: "Soroban" },
            { label: "Functions", val: "9 methods" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-white/20">{r.label}</span>
              <span className="text-[9px] font-mono text-white/45">{r.val}</span>
            </div>
          ))}
        </div>
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-1.5 text-[9px] text-[#4fc3f7]/40 hover:text-[#4fc3f7]/80 transition-colors group"
        >
          Stellar Expert
          <svg
            width="9" height="9" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          >
            <path d="M7 7h10v10M7 17 17 7" />
          </svg>
        </a>
      </div>

      {/* Score scale legend */}
      <div className="rounded-2xl glass p-5" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 mb-4">
          Score Scale
        </p>
        <div className="space-y-2">
          {[
            { range: "800–1000", label: "Excellent", color: "#34d399" },
            { range: "700–799", label: "Good", color: "#4fc3f7" },
            { range: "600–699", label: "Fair", color: "#fbbf24" },
            { range: "400–599", label: "Poor", color: "#fb923c" },
            { range: "0–399", label: "Very Poor", color: "#f87171" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-[9px] text-white/35">{s.label}</span>
              </div>
              <span className="text-[9px] font-mono text-white/20">{s.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl glass p-5" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 mb-3">
          Resources
        </p>
        <div className="space-y-2">
          {[
            { label: "Get Testnet XLM", href: "https://laboratory.stellar.org/#account-creator?network=test" },
            { label: "Freighter Wallet", href: "https://freighter.app/" },
            { label: "Soroban Docs", href: "https://developers.stellar.org/docs/smart-contracts" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[9px] text-white/30 hover:text-white/60 transition-colors group"
            >
              <span>{link.label}</span>
              <svg
                width="9" height="9" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              >
                <path d="M7 7h10v10M7 17 17 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────

export default function DashboardPage() {
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
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      <Background />
      {mounted && <ParticleBackground />}

      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
        onOpenGuide={resetOnboarding}
      />

      {/* Page header */}
      <div className="relative z-10 border-b border-white/[0.04] bg-white/[0.01] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 py-4">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/20 mb-1">
              Dashboard
            </p>
            <h1 className="text-sm font-semibold text-white/60">
              Contract Interface
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#34d399]/60 border border-[#34d399]/15 rounded-full px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
              Testnet Active
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex gap-8 items-start">
          <ContractSidebar />
          <div className="flex-1 min-w-0">
            <ContractUI
              walletAddress={walletAddress}
              onConnect={handleConnect}
              isConnecting={isConnecting}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/[0.04] py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
          <p className="text-[9px] font-mono uppercase tracking-wider text-white/15">
            Stellar Testnet · Soroban Smart Contract
          </p>
          {mounted && (
            <button
              onClick={resetOnboarding}
              className="text-[9px] font-mono uppercase tracking-wider text-white/15 hover:text-white/40 transition-colors"
            >
              How It Works
            </button>
          )}
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
