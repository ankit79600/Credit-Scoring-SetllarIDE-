"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── Background ────────────────────────────────────────────────

function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030308]" />
      <div className="absolute -top-60 right-0 w-[500px] h-[500px] rounded-full bg-[#4fc3f7] opacity-[0.05] blur-[120px] animate-blob-delayed" />
      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-[#7c6cf0] opacity-[0.05] blur-[100px] animate-blob" />
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

// ── Data ──────────────────────────────────────────────────────

const LEADERBOARD = [
  {
    rank: 1,
    address: "GCY4ZWHCOXFRCCCHXMEEMQ2NNLRDNCA2WWTZM5KU4KDJMO4TCR6OGM45",
    avg: 875,
    label: "Excellent",
    min: 830,
    max: 920,
    evaluators: 10,
    color: "#34d399",
    txSample: "2b768602bf47612db4bcd1e61700692b73c2a33cc599125c34cb6bb791221583",
  },
  {
    rank: 2,
    address: "GCF5UKJ34CN3QEPA4UA3ZWV5RQNDBXSRX66CK7CGXTXRAPRV5YTO3V7G",
    avg: 750,
    label: "Good",
    min: 540,
    max: 880,
    evaluators: 10,
    color: "#4fc3f7",
    txSample: "c6abbf45b175f53365377a35697323116549751bb27e17e2291efd0967ae95b9",
  },
  {
    rank: 3,
    address: "GBK2H6A5QEFM5WXWIGQKAUB5GFZKOYB3T4B4WVCSL476CP2BC5LQ5TAD",
    avg: 684,
    label: "Fair",
    min: 630,
    max: 730,
    evaluators: 10,
    color: "#fbbf24",
    txSample: "ec5ab0fbb878827e73b27b0c39db861ef95d602d7df1fd6147f37bc66f45545e",
  },
  {
    rank: 4,
    address: "GC6IMMEGEEKNHSOFIYZTI4OFWPCLBJEKDLVUVPCJOCO4SGGQEHXIXHWI",
    avg: 565,
    label: "Fair",
    min: 520,
    max: 610,
    evaluators: 10,
    color: "#fbbf24",
    txSample: "705c825cf2402fb6a61bbdc100ae890ee42e22f5ac54c2823d15c82e08e2753d",
  },
  {
    rank: 5,
    address: "GD2RGU6SQXCCWHTPL6KSJHJD57YNR2GNM7CTDDCKLAB6SUH3ODKWEMTS",
    avg: 445,
    label: "Poor",
    min: 380,
    max: 500,
    evaluators: 10,
    color: "#fb923c",
    txSample: "60774ebf80a79a43ded50da196209d491f91c57ccbb1312504267c86df543ab0",
  },
];

const RANK_COLORS: Record<number, string> = {
  1: "#fbbf24",
  2: "#94a3b8",
  3: "#b87333",
};

// ── Row Card ──────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  index,
}: {
  entry: (typeof LEADERBOARD)[number];
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(entry.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [entry.address]);

  const truncate = (s: string) => `${s.slice(0, 8)}...${s.slice(-6)}`;
  const pct = (entry.avg / 1000) * 100;
  const rankColor = RANK_COLORS[entry.rank] ?? "rgba(255,255,255,0.2)";
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className="group relative rounded-2xl glass overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: isTop3
          ? `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${entry.color}20`
          : "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 0% 50%, ${entry.color}08, transparent 70%)`,
        }}
      />
      {/* Left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-opacity duration-300"
        style={{
          background: `linear-gradient(180deg, ${entry.color}60, ${entry.color}20)`,
          opacity: isTop3 ? 1 : 0.3,
        }}
      />

      <div className="relative z-10 flex items-center gap-5 p-5 pl-6">
        {/* Rank */}
        <div className="shrink-0 flex flex-col items-center gap-1 w-10">
          <div
            className="text-lg font-bold font-mono"
            style={{ color: rankColor }}
          >
            {entry.rank}
          </div>
          {isTop3 && (
            <div className="text-[10px]">
              {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-white/65 truncate">
              {truncate(entry.address)}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-white/20 hover:text-white/60 transition-colors"
              title="Copy address"
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">
              {entry.evaluators} evaluators
            </span>
            <span className="text-[9px] text-white/15">·</span>
            <span className="text-[9px] font-mono text-white/20">
              {entry.min} – {entry.max} spread
            </span>
          </div>
        </div>

        {/* Progress bar (desktop) */}
        <div className="hidden sm:block w-28 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: entry.color, boxShadow: `0 0 8px ${entry.color}60` }}
              />
            </div>
          </div>
          <div className="text-[9px] font-mono text-white/25 text-right">{pct.toFixed(1)}%</div>
        </div>

        {/* Score + label */}
        <div className="shrink-0 text-right">
          <div
            className="text-2xl font-bold font-mono tabular-nums leading-none mb-1"
            style={{ color: entry.color, textShadow: `0 0 20px ${entry.color}40` }}
          >
            {entry.avg}
          </div>
          <div
            className="text-[9px] uppercase tracking-widest"
            style={{ color: `${entry.color}80` }}
          >
            {entry.label}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col gap-1.5">
          <Link
            href={`/dashboard?user=${entry.address}`}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[9px] font-mono text-white/30 hover:text-white/70 hover:border-white/[0.12] transition-all"
          >
            Lookup
          </Link>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${entry.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[9px] font-mono text-white/20 hover:text-[#4fc3f7]/70 hover:border-[#4fc3f7]/15 transition-all"
          >
            Explorer
          </a>
        </div>
      </div>

      {/* Progress bar (mobile) */}
      <div className="sm:hidden px-6 pb-4">
        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: entry.color }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard Page ──────────────────────────────────────────

export default function LeaderboardPage() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      <Background />
      <Navbar />

      {/* Page header */}
      <div className="relative z-10 border-b border-white/[0.04] bg-white/[0.01] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 lg:px-10 py-4">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/20 mb-1">
              Leaderboard
            </p>
            <h1 className="text-sm font-semibold text-white/60">
              Top Credit Scores on Stellar Testnet
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-white/20 border border-white/[0.06] rounded-full px-2.5 py-1">
              5 wallets · 50 evaluations
            </span>
          </div>
        </div>
      </div>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-6 lg:px-10 py-10">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Tracked Wallets", val: "5" },
            { label: "Total Evaluations", val: "50" },
            { label: "Top Score", val: "920" },
            { label: "Avg Score", val: "664" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl glass p-5 text-center"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
            >
              <div className="text-xl font-bold font-mono text-white/70 mb-1">{s.val}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/20">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Column headers */}
        <div className="hidden sm:flex items-center gap-5 px-5 pl-6 mb-3 text-[9px] font-mono uppercase tracking-widest text-white/15">
          <span className="w-10 text-center">Rank</span>
          <span className="flex-1">Address</span>
          <span className="w-28">Progress</span>
          <span className="w-16 text-right">Score</span>
          <span className="w-24 text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="space-y-3 animate-fade-in-up">
          {LEADERBOARD.map((entry, i) => (
            <LeaderboardRow key={entry.address} entry={entry} index={i} />
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-2xl glass p-5 text-center">
          <p className="text-[10px] text-white/20 leading-relaxed max-w-xl mx-auto">
            Data shown is from the Stellar Testnet. Scores were generated by 50 independent
            evaluator wallets via{" "}
            <code className="font-mono text-white/30">scripts/generate-interactions.mjs</code>.
            All transactions are publicly verifiable on Stellar Expert.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-4 text-[10px] font-mono text-[#7c6cf0]/60 hover:text-[#7c6cf0] transition-colors group"
          >
            Look up any address in the Dashboard
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              className="group-hover:translate-x-0.5 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/[0.04] py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 lg:px-10">
          <p className="text-[9px] font-mono uppercase tracking-wider text-white/15">
            Stellar Testnet · Soroban
          </p>
          <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-wider text-white/15">
            <Link href="/" className="hover:text-white/40 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-white/40 transition-colors">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
