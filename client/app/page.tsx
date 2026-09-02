"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── Background orbs ──────────────────────────────────────────

function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030308]" />
      <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full bg-[#7c6cf0] opacity-[0.07] blur-[120px] animate-blob" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-[#4fc3f7] opacity-[0.05] blur-[100px] animate-blob-delayed" />
      <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-[#7c6cf0] opacity-[0.04] blur-[100px] animate-blob-delayed-2" />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ── 3D Hero Card ─────────────────────────────────────────────

function HeroCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 4, y: -8 });
  const [isHovered, setIsHovered] = useState(false);
  const [reflectPos, setReflectPos] = useState({ x: 45, y: 35 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xRaw = (e.clientX - rect.left) / rect.width;
    const yRaw = (e.clientY - rect.top) / rect.height;
    const x = (xRaw - 0.5) * 2;
    const y = (yRaw - 0.5) * 2;
    setTilt({ x: -y * 14, y: x * 14 });
    setReflectPos({ x: xRaw * 100, y: yRaw * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 4, y: -8 });
    setReflectPos({ x: 45, y: 35 });
  }, []);

  const scoreColor = "#34d399";
  const scoreItems = [
    { addr: "GD5V...GQU", score: 920 },
    { addr: "GAZM...BZ5", score: 900 },
    { addr: "GAW4...POC", score: 890 },
  ];

  return (
    <div
      ref={cardRef}
      style={{ perspective: "1200px" }}
      className="relative w-full max-w-[420px] mx-auto"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background glow */}
      <div className="absolute inset-4 rounded-3xl bg-[#7c6cf0] opacity-20 blur-3xl animate-glow-pulse" />

      {/* Depth layer behind */}
      <div
        style={{
          transform: `rotateX(${tilt.x * 0.6}deg) rotateY(${tilt.y * 0.6}deg) translateZ(-24px)`,
          transition: isHovered ? "transform 0.08s linear" : "transform 0.7s cubic-bezier(0.23,1,0.32,1)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-0 rounded-3xl glass scale-[0.96] translate-y-3 opacity-50"
      />

      {/* Main glass card */}
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered ? "transform 0.08s linear" : "transform 0.7s cubic-bezier(0.23,1,0.32,1)",
          transformStyle: "preserve-3d",
          boxShadow: `0 32px 80px rgba(0,0,0,0.65), 0 0 60px rgba(124,108,240,0.14), inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
        className={`relative rounded-3xl glass-md overflow-hidden ${!isHovered ? "animate-float-gentle" : ""}`}
      >
        {/* Dynamic light reflection */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl z-10"
          style={{
            background: `radial-gradient(ellipse at ${reflectPos.x}% ${reflectPos.y}%, rgba(255,255,255,0.07) 0%, transparent 65%)`,
          }}
        />
        {/* Top shine line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-20 p-6">
          {/* Card header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
                Credit Score
              </span>
            </div>
            <span className="font-mono text-[10px] text-white/20">GCY4...M45</span>
          </div>

          {/* Score display */}
          <div className="text-center mb-5">
            <div
              className="text-[72px] font-bold leading-none tabular-nums mb-1"
              style={{ color: scoreColor, textShadow: `0 0 40px ${scoreColor}40` }}
            >
              875
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/35 mb-4">Excellent</div>
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "87.5%",
                    background: `linear-gradient(90deg, #34d399, #4fc3f7)`,
                    boxShadow: "0 0 12px rgba(52,211,153,0.5)",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/30">87.5%</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Evaluators", val: "10" },
              { label: "Average", val: "875" },
              { label: "Lowest", val: "830" },
              { label: "Highest", val: "920" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center"
              >
                <div className="text-sm font-bold font-mono text-white/75">{s.val}</div>
                <div className="text-[8px] text-white/25 uppercase tracking-wider mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Mini evaluator list */}
          <div className="space-y-1.5 mb-4">
            {scoreItems.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.05] px-3 py-1.5"
              >
                <span className="font-mono text-[10px] text-white/35">{e.addr}</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full" style={{ background: scoreColor }} />
                  <span className="font-mono text-xs font-bold" style={{ color: scoreColor }}>
                    {e.score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Trusted badge */}
          <div
            className="flex items-center justify-center gap-2 rounded-xl py-2 border"
            style={{
              borderColor: "rgba(52,211,153,0.2)",
              background: "rgba(52,211,153,0.05)",
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#34d399]/70">
              Verified · 10 Evaluators
            </span>
          </div>
        </div>
      </div>

      {/* Floating accent chips */}
      <div
        className="absolute -top-3 -right-4 glass rounded-xl px-3 py-1.5 animate-float"
        style={{ animationDelay: "0.5s" }}
      >
        <span className="text-[9px] font-mono text-[#34d399]/70 uppercase tracking-wider">
          On-chain ✓
        </span>
      </div>
      <div
        className="absolute -bottom-3 -left-4 glass rounded-xl px-3 py-1.5 animate-float"
        style={{ animationDelay: "2s" }}
      >
        <span className="text-[9px] font-mono text-[#4fc3f7]/70 uppercase tracking-wider">
          ~5s finality
        </span>
      </div>
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div
      className="group relative rounded-2xl glass p-6 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}12, transparent 70%)` }}
      />
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
      />
      <div className="relative z-10">
        <div
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4"
          style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <h3 className="text-sm font-semibold text-white/80 mb-2">{title}</h3>
        <p className="text-xs leading-relaxed text-white/35">{desc}</p>
      </div>
    </div>
  );
}

// ── Step ─────────────────────────────────────────────────────

function Step({
  num,
  title,
  desc,
  accent,
}: {
  num: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold font-mono"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}
        >
          {num}
        </div>
        <div className="flex-1 w-px bg-white/[0.05]" />
      </div>
      <div className="pb-8">
        <h4 className="text-sm font-semibold text-white/75 mb-1.5">{title}</h4>
        <p className="text-xs leading-relaxed text-white/30">{desc}</p>
      </div>
    </div>
  );
}

// ── Landing Page ─────────────────────────────────────────────

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative flex flex-col min-h-screen text-white overflow-hidden">
      <Background />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-1 w-full max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-0 lg:min-h-[calc(100vh-56px)] lg:items-center gap-12 lg:gap-20 flex-col lg:flex-row">
        {/* Left */}
        <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
          {/* Tag */}
          <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.06] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c6cf0] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7c6cf0]/70">
              Stellar Soroban · Testnet Live
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl sm:text-6xl lg:text-[4rem] font-bold leading-[1.05] tracking-tight">
            <span className="gradient-text">Decentralized</span>
            <br />
            <span className="text-white">Credit Scoring</span>
            <br />
            <span className="text-white/25">on Stellar</span>
          </h1>

          <p className="mb-8 max-w-md text-sm leading-relaxed text-white/35">
            Any wallet can rate any wallet — 0 to 1000, averaged on-chain. A
            score only becomes{" "}
            <span className="text-white/55">trusted</span> once 3+ independent
            evaluators agree. Permissionless. Immutable. Verifiable.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c6cf0, #5b4fd4)",
                boxShadow: "0 0 30px rgba(124,108,240,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Launch App
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm text-white/50 transition-all hover:border-white/[0.15] hover:text-white/75 hover:bg-white/[0.05]"
            >
              View Leaderboard
            </Link>
          </div>

          {/* Stats */}
          <div className="border-t border-white/[0.05] pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { val: "~5s", label: "Finality" },
              { val: "<$0.01", label: "Per Tx" },
              { val: "50+", label: "Users" },
              { val: "On-chain", label: "Proof" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-base font-bold font-mono text-white/70">{s.val}</div>
                <div className="text-[9px] uppercase tracking-widest text-white/20 mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 3D card */}
        {mounted && (
          <div className="flex-1 flex items-center justify-center animate-fade-in-up-delayed">
            <HeroCard />
          </div>
        )}
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20 mb-3">
            Core Functions
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white/80">
            Everything in one place
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FeatureCard
            accent="#4fc3f7"
            title="Look Up Any Score"
            desc="Query the on-chain average score for any Stellar wallet address. Read-only — no wallet connection needed."
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            }
          />
          <FeatureCard
            accent="#7c6cf0"
            title="Submit a Score"
            desc="Rate any wallet 0–1000 with your Freighter signature. Your score is recorded immutably on the Stellar testnet."
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          />
          <FeatureCard
            accent="#34d399"
            title="Trust via Threshold"
            desc="Scores are marked Trusted only after 3+ independent evaluators contribute, preventing single-party manipulation."
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20 mb-3">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white/80 mb-8">
              Three steps to trust
            </h2>
            <div>
              <Step
                num="01"
                accent="#7c6cf0"
                title="Connect Freighter Wallet"
                desc="Install the Freighter browser extension, set it to Testnet, and fund your account via Stellar Friendbot — free testnet XLM in seconds."
              />
              <Step
                num="02"
                accent="#4fc3f7"
                title="Submit or Look Up Scores"
                desc="Enter any Stellar address to look up their score, or submit your own rating (0–1000). Each submission is signed by your wallet and recorded on-chain."
              />
              <Step
                num="03"
                accent="#34d399"
                title="Score Becomes Trusted"
                desc="Once 3 or more independent evaluators have submitted scores, the average is marked Trusted. The anti-gaming threshold prevents manipulation."
              />
            </div>
          </div>

          {/* Contract info panel */}
          <div className="rounded-2xl glass-md p-6 space-y-4" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25">
                Deployed Contract
              </span>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#34d399]/70 border border-[#34d399]/20 rounded-full px-2.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
                Testnet Active
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/20 mb-2">
                Contract Address
              </p>
              <p className="font-mono text-[11px] text-white/50 break-all leading-relaxed">
                CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Network", val: "Stellar Testnet" },
                { label: "Language", val: "Rust / Soroban" },
                { label: "Functions", val: "9 methods" },
                { label: "Unit Tests", val: "8 passing" },
              ].map((r) => (
                <div key={r.label} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3">
                  <div className="text-[9px] uppercase tracking-wider text-white/20 mb-1">
                    {r.label}
                  </div>
                  <div className="text-xs font-mono text-white/55">{r.val}</div>
                </div>
              ))}
            </div>
            <a
              href="https://stellar.expert/explorer/testnet/contract/CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs text-white/30 hover:text-white/60 hover:border-white/[0.10] transition-all group"
            >
              <span>View on Stellar Expert</span>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              >
                <path d="M7 7h10v10M7 17 17 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-12 mb-8">
        <div
          className="relative rounded-3xl overflow-hidden glass p-12 text-center"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          {/* Glow bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c6cf0]/[0.08] via-transparent to-[#4fc3f7]/[0.05]" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white/80 mb-3">
              Ready to build credit on-chain?
            </h2>
            <p className="text-sm text-white/30 mb-8 max-w-md mx-auto">
              No sign-up, no KYC. Connect your Freighter wallet and start
              evaluating in under 60 seconds.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c6cf0, #5b4fd4)",
                boxShadow: "0 0 40px rgba(124,108,240,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Open Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 lg:px-10">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/15">
              Built on Stellar · Soroban
            </span>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-mono uppercase tracking-wider text-white/15">
            <Link href="/dashboard" className="hover:text-white/40 transition-colors">Dashboard</Link>
            <Link href="/leaderboard" className="hover:text-white/40 transition-colors">Leaderboard</Link>
            <a
              href="https://github.com/ankit79600/My-Credit-Scoring"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/40 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
