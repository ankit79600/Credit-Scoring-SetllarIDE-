"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NETWORK } from "@/hooks/contract";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function WalletIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

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

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Score", icon: "★" },
  { href: "/borrow", label: "Borrow", icon: "↓" },
  { href: "/lend", label: "Lend", icon: "+" },
  { href: "/evaluate", label: "Evaluate", icon: "✓" },
];

interface NavbarProps {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
}

export default function Navbar({
  walletAddress,
  onConnect,
  onDisconnect,
  isConnecting,
}: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const close = () => setShowDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showDropdown]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300 animate-fade-in-down",
        scrolled
          ? "border-white/[0.08] bg-[#050510]/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "border-white/[0.04] bg-transparent backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c6cf0] to-[#4fc3f7] shadow-[0_0_20px_rgba(124,108,240,0.3)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
              <span className="hidden sm:inline">Stellar MicroLoan</span>
              <span className="sm:hidden">MicroLoan</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-white/20 border border-white/[0.06] rounded px-1.5 py-0.5">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all rounded-lg",
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-[#7c6cf0] to-[#4fc3f7]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant="success" className="hidden sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
            {NETWORK}
          </Badge>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white/50 hover:text-white/90 transition-colors p-1.5"
            onClick={() => setShowMobileMenu((v) => !v)}
            aria-label="Menu"
          >
            <MenuIcon />
          </button>

          {/* Wallet */}
          {walletAddress ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-2 text-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06] sm:px-3"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#4fc3f7] p-[1.5px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0a1a] text-[8px] font-bold text-white/80">
                    {walletAddress.slice(0, 2)}
                  </div>
                </div>
                <span className="font-mono text-xs text-white/70 hidden sm:inline">
                  {truncate(walletAddress)}
                </span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={cn("text-white/30 transition-transform duration-200 hidden sm:block", showDropdown && "rotate-180")}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c1d]/95 backdrop-blur-2xl shadow-2xl animate-fade-in-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-wider text-white/25 mb-2">Connected Wallet</p>
                    <p className="font-mono text-xs text-white/60 break-all leading-relaxed">{walletAddress}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { handleCopy(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                    >
                      {copied ? <CheckSmallIcon /> : <CopyIcon />}
                      {copied ? "Copied!" : "Copy Address"}
                    </button>
                    <button
                      onClick={() => { onDisconnect(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#f87171]/70 hover:bg-[#f87171]/[0.08] hover:text-[#f87171] transition-colors"
                    >
                      <PowerIcon />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#7c6cf0] to-[#5b8cf0] p-[1px] transition-all hover:shadow-[0_0_25px_rgba(124,108,240,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 rounded-[11px] bg-[#0c0c1d]/90 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm sm:px-4">
                {isConnecting ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span className="hidden sm:inline">Connecting...</span>
                  </>
                ) : (
                  <>
                    <WalletIcon size={14} />
                    Connect
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#050510]/95 backdrop-blur-2xl">
          <div className="flex flex-col p-3 gap-1">
            <Badge variant="success" className="self-start mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
              {NETWORK}
            </Badge>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#7c6cf0]/10 text-[#7c6cf0] border border-[#7c6cf0]/20"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/90"
                  )}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
