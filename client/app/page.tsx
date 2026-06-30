"use client";

import { useState, useEffect, useCallback } from "react";
import { Meteors } from "@/components/ui/meteors";
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
    <div className="relative flex flex-col min-h-screen bg-[#050510] overflow-hidden">
      {/* Meteors */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Meteors number={12} />
      </div>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#7c6cf0]/20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#4fc3f7]/15 blur-[120px] animate-float-delayed" />
      </div>

      {/* Navbar */}
      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
        onOpenGuide={resetOnboarding}
      />

      {/* Hero + Content */}
      <main className="relative z-10 flex flex-1 w-full max-w-5xl mx-auto flex-col items-center px-4 sm:px-6 pt-10 pb-20">
        {/* Hero */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-white/50 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7c6cf0] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7c6cf0]" />
            </span>
            Powered by Soroban on Stellar
          </div>

          <h1 className="mb-3">
            <span className="block text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-r from-[#7c6cf0] via-[#4fc3f7] to-[#7c6cf0] bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                Credit Scoring System
              </span>
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-sm sm:text-base leading-relaxed text-white/40">
            Submit, track, and verify credit scores — immutably on Stellar.
          </p>

          {/* Stats */}
          <div className="mt-6 flex items-center justify-center gap-6 sm:gap-10 animate-fade-in-up-delayed">
            {[
              { label: "Finality", value: "~5s" },
              { label: "Cost", value: "<$0.01" },
              { label: "Network", value: "Testnet" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg sm:text-xl font-bold text-white/90 font-mono">{stat.value}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contract UI */}
        <ContractUI
          walletAddress={walletAddress}
          onConnect={handleConnect}
          isConnecting={isConnecting}
        />

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-3 text-xs text-white/20">
            {["Submit", "Average", "Trusted"].map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    i === 0 ? "bg-[#7c6cf0]/50" : i === 1 ? "bg-[#fbbf24]/50" : "bg-[#34d399]/50"
                  }`} />
                  <span className="font-mono">{step}</span>
                </span>
                {i < 2 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/10">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-white/15">
            <span>Stellar Network</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Freighter Wallet</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Soroban Smart Contracts</span>
            <span className="h-2.5 w-px bg-white/10" />
            {mounted && (
              <button
                onClick={resetOnboarding}
                className="text-white/20 hover:text-white/50 transition-colors underline underline-offset-2"
              >
                How it works
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Onboarding Modal — shown on first visit */}
      {mounted && showOnboarding && (
        <OnboardingModal
          onComplete={completeOnboarding}
          onConnect={handleConnect}
        />
      )}

      {/* Feedback Modal */}
      {mounted && showFeedback && (
        <FeedbackModal onClose={closeFeedback} />
      )}

      {/* Floating Feedback Button */}
      {mounted && !showFeedback && (
        <FeedbackTrigger onClick={openFeedback} />
      )}
    </div>
  );
}
