"use client";

import { useState, useEffect, useCallback } from "react";
import { NETWORK } from "@/hooks/contract";

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

interface NavbarProps {
  walletAddress: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  isConnecting: boolean;
  onOpenGuide?: () => void;
}

export default function Navbar({
  walletAddress,
  onConnect,
  onDisconnect,
  isConnecting,
  onOpenGuide,
}: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const close = () => setShowDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showDropdown]);

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0f] animate-fade-in-down">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#7c6cf0]/30 bg-[#7c6cf0]/10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c6cf0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold tracking-widest uppercase text-white/90">
              Credit Scoring
            </span>
            <span className="text-[9px] font-mono text-white/20 border border-white/[0.06] rounded px-1.5 py-0.5 tracking-wider">
              v2.0
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Platform", href: "#" },
            { label: "How It Works", onClick: onOpenGuide },
            { label: "Developers", href: "https://developers.stellar.org/docs/smart-contracts" },
            { label: "GitHub", href: "https://github.com/ankit79600/My-Credit-Scoring" },
          ].map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-[12px] text-white/35 hover:text-white/70 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                className="px-3 py-1.5 text-[12px] text-white/35 hover:text-white/70 transition-colors"
              >
                {item.label}
              </button>
            )
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Guide — mobile only */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex md:hidden items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/30 hover:text-white/60 transition-colors px-2 py-1.5"
            >
              Guide
            </button>
          )}

          {/* Network badge */}
          <div className="flex items-center gap-1.5 rounded border border-[#34d399]/20 bg-[#34d399]/[0.05] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#34d399]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
            {NETWORK}
          </div>

          {walletAddress ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
                className="flex items-center gap-2 rounded border border-white/[0.08] bg-[#131720] px-3 py-1.5 text-xs transition-all hover:border-white/[0.15]"
              >
                <span className="h-2 w-2 rounded-full bg-[#7c6cf0]" />
                <span className="font-mono text-white/60">{truncate(walletAddress)}</span>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-white/25 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-[#131720] shadow-2xl animate-fade-in-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-white/[0.06]">
                    <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2">Connected Wallet</p>
                    <p className="font-mono text-xs text-white/50 break-all leading-relaxed">{walletAddress}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { handleCopy(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-xs text-white/50 hover:bg-white/[0.05] hover:text-white/80 transition-colors"
                    >
                      {copied ? <CheckSmallIcon /> : <CopyIcon />}
                      {copied ? "Copied!" : "Copy Address"}
                    </button>
                    <button
                      onClick={() => { onDisconnect(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-xs text-[#f87171]/60 hover:bg-[#f87171]/[0.06] hover:text-[#f87171] transition-colors"
                    >
                      <PowerIcon />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={async () => {
                  setConnectError(null);
                  try {
                    await onConnect();
                  } catch (err: unknown) {
                    setConnectError(err instanceof Error ? err.message : "Failed to connect wallet");
                  }
                }}
                disabled={isConnecting}
                className="flex items-center gap-2 rounded border border-[#7c6cf0]/40 bg-[#7c6cf0]/10 px-4 py-1.5 text-xs font-medium text-[#7c6cf0] hover:bg-[#7c6cf0]/15 hover:border-[#7c6cf0]/60 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <WalletIcon />
                    Connect Wallet
                  </>
                )}
              </button>
              {connectError && (
                <p className="text-[10px] text-[#f87171]/70 max-w-[200px] text-right">{connectError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
