"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { trackOnboardingStep } from "@/lib/posthog";

const STORAGE_KEY = "credit_scoring_onboarded_v2";

const STEPS = [
  {
    step: 1,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: "#7c6cf0",
    title: "Install Freighter Wallet",
    description:
      "Freighter is the official Stellar browser extension wallet. It lets you sign blockchain transactions without exposing your private key.",
    action: {
      label: "Install Freighter",
      href: "https://freighter.app/",
    },
    tip: "Available for Chrome, Firefox, and Brave. Takes under 2 minutes to set up.",
  },
  {
    step: 2,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    color: "#4fc3f7",
    title: "Connect Your Wallet",
    description:
      "Click \"Connect\" in the top-right corner of the app. Freighter will ask for permission — approve it to link your wallet.",
    tip: "Make sure Freighter is set to Testnet: open Freighter → Settings → Network → Testnet.",
  },
  {
    step: 3,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    color: "#fbbf24",
    title: "Fund With Testnet XLM",
    description:
      "Testnet XLM is free play-money for the Stellar test network. You need a tiny amount to pay transaction fees (< $0.01).",
    action: {
      label: "Get Free Testnet XLM",
      href: "https://laboratory.stellar.org/#account-creator?network=test",
    },
    tip: "Paste your wallet address (G...) in the Friendbot field and click Fund.",
  },
  {
    step: 4,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: "#34d399",
    title: "Submit or Look Up Scores",
    description:
      "Use the Lookup tab to check any address's credit score. Use the Submit tab to rate any wallet (0–1000). Scores are stored forever on-chain.",
    tip: "A score only becomes \"trusted\" once 3+ independent evaluators have rated the same address.",
  },
  {
    step: 5,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "#fb923c",
    title: "Share Feedback & Invite Others",
    description:
      "Help improve the app by sharing your experience. You can also invite others — the more evaluators rate a wallet, the more trusted the score becomes.",
    action: {
      label: "Share Feedback",
      href: "https://forms.gle/6hdSkpKgnYBqzp7J6",
    },
    tip: "Use the floating feedback button (bottom-right) anytime to rate the app or suggest features.",
  },
];

interface OnboardingModalProps {
  onComplete: () => void;
  onConnect?: () => void;
}

export default function OnboardingModal({ onComplete, onConnect }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    trackOnboardingStep(step.step, step.title);
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c1d]/95 shadow-[0_0_80px_rgba(124,108,240,0.15)] backdrop-blur-2xl">
          {/* Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[300px] rounded-full opacity-10 blur-[60px] pointer-events-none"
            style={{ background: step.color }}
          />

          {/* Header */}
          <div className="relative px-6 pt-6 pb-0">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/30">
                Getting Started
              </span>
              <button
                onClick={handleSkip}
                className="text-white/20 hover:text-white/60 transition-colors text-xs"
              >
                Skip
              </button>
            </div>

            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{
                    background:
                      i <= currentStep ? step.color : "rgba(255,255,255,0.06)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative px-6 pb-6">
            {/* Icon */}
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors"
              style={{
                color: step.color,
                borderColor: `${step.color}30`,
                background: `${step.color}10`,
              }}
            >
              {step.icon}
            </div>

            {/* Step label */}
            <div
              className="mb-1 text-[11px] font-mono font-semibold uppercase tracking-widest"
              style={{ color: step.color }}
            >
              Step {step.step} of {STEPS.length}
            </div>

            {/* Title */}
            <h2 className="mb-3 text-xl font-bold text-white/90 leading-tight">
              {step.title}
            </h2>

            {/* Description */}
            <p className="mb-4 text-sm leading-relaxed text-white/50">
              {step.description}
            </p>

            {/* Tip */}
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0 text-white/30">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-[11px] leading-relaxed text-white/35">{step.tip}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              {step.action && (
                <a
                  href={step.action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white/90 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  {step.action.label}
                </a>
              )}

              {currentStep === 1 && onConnect && (
                <button
                  onClick={() => { onConnect(); handleNext(); }}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all"
                  style={{
                    background: `linear-gradient(to right, ${step.color}, ${step.color}cc)`,
                    boxShadow: `0 0 20px ${step.color}30`,
                  }}
                >
                  Connect Wallet Now
                </button>
              )}

              <button
                onClick={handleNext}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isLast
                    ? "text-white"
                    : "border border-white/[0.06] bg-white/[0.03] text-white/60 hover:text-white/90 hover:border-white/[0.10]"
                )}
                style={
                  isLast
                    ? {
                        background: `linear-gradient(to right, ${step.color}, ${step.color}bb)`,
                        boxShadow: `0 0 20px ${step.color}25`,
                      }
                    : undefined
                }
              >
                {isLast ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Start Using the App
                  </>
                ) : (
                  <>
                    Next
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setShowOnboarding(true);
  }, []);

  return {
    showOnboarding,
    completeOnboarding: () => setShowOnboarding(false),
    resetOnboarding: () => {
      localStorage.removeItem(STORAGE_KEY);
      setShowOnboarding(true);
    },
  };
}
