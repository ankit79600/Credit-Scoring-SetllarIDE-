"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NETWORK } from "@/hooks/contract";

// ── Icons ──────────────────────────────────────────────────────

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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ── Navbar ─────────────────────────────────────────────────────

interface NavbarProps {
  walletAddress?: string | null;
  onConnect?: () => Promise<void>;
  onDisconnect?: () => void;
  isConnecting?: boolean;
  onOpenGuide?: () => void;
}

export default function Navbar({
  walletAddress,
  onConnect,
  onDisconnect,
  isConnecting = false,
  onOpenGuide,
}: NavbarProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Docs", href: "https://developers.stellar.org/docs/smart-contracts", external: true },
    { label: "GitHub", href: "https://github.com/ankit79600/My-Credit-Scoring", external: true },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-white/[0.05] animate-fade-in-down"
      style={{
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        background: "rgba(3,3,8,0.75)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 py-3 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#7c6cf0]/25 transition-all group-hover:border-[#7c6cf0]/50 group-hover:shadow-[0_0_20px_rgba(124,108,240,0.2)]"
            style={{ background: "rgba(124,108,240,0.1)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c6cf0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-white/85 group-hover:text-white transition-colors">
              Credit Scoring
            </span>
            <span className="hidden sm:inline text-[9px] font-mono text-white/20 border border-white/[0.06] rounded px-1.5 py-0.5 tracking-wider">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((item) => {
            const isActive = !item.external && pathname === item.href;
            return item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-[12px] text-white/30 hover:text-white/65 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-3 py-1.5 text-[12px] transition-colors ${
                  isActive ? "text-white/80" : "text-white/30 hover:text-white/65"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, #7c6cf0, transparent)" }}
                  />
                )}
              </Link>
            );
          })}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="px-3 py-1.5 text-[12px] text-white/30 hover:text-white/65 transition-colors"
            >
              Guide
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Network badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#34d399]/15 bg-[#34d399]/[0.04] px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-[#34d399]/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
            {NETWORK}
          </div>

          {/* Wallet */}
          {onConnect && (
            <>
              {walletAddress ? (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-1.5 text-xs transition-all hover:border-white/[0.14]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: "radial-gradient(circle, #7c6cf0, #5b4fd4)", boxShadow: "0 0 8px #7c6cf060" }}
                    />
                    <span className="font-mono text-white/55">{truncate(walletAddress)}</span>
                    <svg
                      width="9" height="9" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      className={`text-white/20 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div
                      className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.07] shadow-2xl animate-fade-in-up"
                      style={{
                        backdropFilter: "blur(32px)",
                        background: "rgba(10,10,20,0.92)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-white/[0.06]">
                        <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2">
                          Connected Wallet
                        </p>
                        <p className="font-mono text-xs text-white/45 break-all leading-relaxed">
                          {walletAddress}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => { handleCopy(); setShowDropdown(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-white/45 hover:bg-white/[0.05] hover:text-white/80 transition-colors"
                        >
                          {copied ? <CheckSmallIcon /> : <CopyIcon />}
                          {copied ? "Copied!" : "Copy Address"}
                        </button>
                        <button
                          onClick={() => { onDisconnect?.(); setShowDropdown(false); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-[#f87171]/50 hover:bg-[#f87171]/[0.06] hover:text-[#f87171] transition-colors"
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
                        setConnectError(
                          err instanceof Error ? err.message : "Failed to connect"
                        );
                      }
                    }}
                    disabled={isConnecting}
                    className="flex items-center gap-2 rounded-xl border border-[#7c6cf0]/35 px-4 py-1.5 text-xs font-medium text-[#7c6cf0] transition-all hover:border-[#7c6cf0]/60 hover:shadow-[0_0_20px_rgba(124,108,240,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "rgba(124,108,240,0.08)" }}
                  >
                    {isConnecting ? <><SpinnerIcon /> Connecting...</> : <><WalletIcon /> Connect</>}
                  </button>
                  {connectError && (
                    <p className="text-[10px] text-[#f87171]/70 max-w-[180px] text-right">
                      {connectError}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl border border-white/[0.07] text-white/40 hover:text-white/70 transition-colors"
          >
            {menuOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/[0.05] py-2"
          style={{ background: "rgba(3,3,8,0.95)" }}
        >
          {NAV_LINKS.map((item) => {
            const isActive = !item.external && pathname === item.href;
            return item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-2.5 text-sm text-white/30 hover:text-white/65"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-6 py-2.5 text-sm transition-colors ${
                  isActive ? "text-white/75" : "text-white/30 hover:text-white/65"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
