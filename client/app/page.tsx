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
    <div className="relative flex flex-col min-h-screen bg-[#0d0d0d] overflow-hidden">
      {/* 3D Particle Network */}
      {mounted && <ParticleBackground />}

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
          <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.25em] text-[#7c6cf0]/60">
            Stellar Soroban · Testnet
          </p>

          <h1 className="mb-4">
            <span className="block text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              Credit Scoring System
            </span>
          </h1>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-white/35">
            Permissionless on-chain credit scores. Submit, verify, and share — immutably on Stellar.
          </p>

          {/* Stats */}
          <div className="mt-8 inline-flex items-center divide-x divide-white/[0.06] rounded border border-white/[0.06] bg-[#131720] animate-fade-in-up-delayed">
            {[
              { label: "Users", value: "50+" },
              { label: "Finality", value: "~5s" },
              { label: "Cost", value: "<$0.01" },
              { label: "Network", value: "Testnet" },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-3 text-center">
                <p className="text-base font-bold text-white font-mono">{stat.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-white/30 mt-0.5">{stat.label}</p>
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
        <div className="mt-10 flex flex-col items-center gap-3 animate-fade-in">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-wider text-white/15 font-mono">
            <span>Stellar Network</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Freighter Wallet</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Soroban Smart Contracts</span>
            {mounted && (
              <>
                <span className="h-2.5 w-px bg-white/10" />
                <button
                  onClick={resetOnboarding}
                  className="text-white/20 hover:text-white/50 transition-colors"
                >
                  How it works
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
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
