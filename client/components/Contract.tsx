"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  submitScore,
  getScores,
  getEvaluatorCount,
  getAverageScore,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { trackContractInteraction } from "@/lib/posthog";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CopyIcon({ copied }: { copied?: boolean }) {
  return copied ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  hint,
  ...props
}: { label: string; hint?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
          {label}
        </label>
        {hint}
      </div>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Score Config ─────────────────────────────────────────────

function getScoreConfig(score: number): { color: string; bg: string; label: string } {
  if (score >= 800) return { color: "text-[#34d399]", bg: "bg-[#34d399]", label: "Excellent" };
  if (score >= 700) return { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]", label: "Good" };
  if (score >= 600) return { color: "text-[#fbbf24]", bg: "bg-[#fbbf24]", label: "Fair" };
  if (score >= 400) return { color: "text-[#fb923c]", bg: "bg-[#fb923c]", label: "Poor" };
  return { color: "text-[#f87171]", bg: "bg-[#f87171]", label: "Very Poor" };
}

// ── Utilities ────────────────────────────────────────────────

function formatTimestamp(ts: number | bigint | undefined): string {
  if (!ts) return "—";
  return new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Score Bar Chart ──────────────────────────────────────────

function ScoreBarChart({ scores }: { scores: Array<{ score: number }> }) {
  if (scores.length === 0) return null;
  const avg = Math.round(scores.reduce((s, e) => s + e.score, 0) / scores.length);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Distribution</span>
        <span className="text-[10px] text-white/25 font-mono">avg {avg}</span>
      </div>
      <div className="flex items-end gap-1.5 h-14">
        {scores.map((entry, i) => {
          const cfg = getScoreConfig(entry.score);
          const heightPct = Math.max(8, (entry.score / 1000) * 100);
          return (
            <div key={i} className="relative flex-1 flex flex-col items-center gap-1 group">
              <div
                className={cn("w-full rounded-sm transition-opacity opacity-50 group-hover:opacity-100", cfg.bg)}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[8px] font-mono text-white/20 leading-none">{entry.score}</span>
              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex bg-[#1a1a2e]/95 border border-white/[0.08] rounded-lg px-2 py-1.5 text-[9px] text-white/70 whitespace-nowrap z-10 flex-col items-center gap-0.5 shadow-xl">
                <span className={cn("font-mono font-bold", cfg.color)}>{entry.score}</span>
                <span className="text-white/40">{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Average marker */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-px flex-1 bg-white/[0.04]" />
        <span className="text-[9px] text-white/20 font-mono">avg {avg}</span>
        <div className="h-px flex-1 bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "lookup" | "submit" | "history";

interface ScoreEntry {
  evaluator: string;
  score: number;
  timestamp?: number | bigint;
}

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("lookup");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);

  // 3D tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.transform = `perspective(1200px) rotateX(${y * 4}deg) rotateY(${x * 4}deg) scale3d(1.01,1.01,1.01)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }, []);

  // Submit form state
  const [submitUser, setSubmitUser] = useState("");
  const [submitScoreValue, setSubmitScoreValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Lookup state
  const [lookupUser, setLookupUser] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupData, setLookupData] = useState<{
    evaluatorCount: number;
    averageScore: number;
    scores: ScoreEntry[];
  } | null>(null);

  // History state
  const [historyUser, setHistoryUser] = useState("");
  const [isGettingHistory, setIsGettingHistory] = useState(false);
  const [historyData, setHistoryData] = useState<ScoreEntry[] | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // ── Copy to clipboard ──────────────────────────────────────

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedAddr(text);
    setTimeout(() => setCopiedAddr(null), 2000);
  }, []);

  // ── Lookup logic (extracted so URL init can call it) ───────

  const performLookup = useCallback(async (address: string) => {
    setError(null);
    setIsLookingUp(true);
    setLookupData(null);
    try {
      const [countResult, avgResult, scoresResult] = await Promise.all([
        getEvaluatorCount(address, walletAddress || undefined),
        getAverageScore(address, walletAddress || undefined),
        getScores(address, walletAddress || undefined),
      ]);
      setLookupData({
        evaluatorCount: countResult ?? 0,
        averageScore: avgResult ?? 0,
        scores: (scoresResult ?? []) as ScoreEntry[],
      });
      trackContractInteraction("lookup_score", { evaluator_count: countResult ?? 0 });
      // Sync URL so this lookup is shareable
      const url = new URL(window.location.href);
      url.searchParams.set("user", address);
      window.history.replaceState({}, "", url.toString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsLookingUp(false);
    }
  }, [walletAddress]);

  // ── Read ?user= from URL on first mount ───────────────────

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");
    if (user && user.startsWith("G")) {
      setLookupUser(user);
      setActiveTab("lookup");
      performLookup(user);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = useCallback(async () => {
    if (!lookupUser.trim()) return setError("Enter a user address");
    await performLookup(lookupUser.trim());
  }, [lookupUser, performLookup]);

  // ── Submit ────────────────────────────────────────────────

  const handleSubmitScore = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!submitUser.trim() || !submitScoreValue.trim()) return setError("Fill in all fields");
    const scoreNum = parseInt(submitScoreValue, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 1000) {
      return setError("Score must be between 0 and 1000");
    }
    setError(null);
    setTxHash(null);
    setIsSubmitting(true);
    setTxStatus("Awaiting signature...");
    try {
      const hash = await submitScore(walletAddress, submitUser.trim(), scoreNum, walletAddress);
      trackContractInteraction("submit_score", { score: scoreNum });
      setTxHash(hash);
      setTxStatus("Score submitted on-chain!");
      setSubmitUser("");
      setSubmitScoreValue("");
      setTimeout(() => { setTxStatus(null); setTxHash(null); }, 8000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [walletAddress, submitUser, submitScoreValue]);

  // ── History ───────────────────────────────────────────────

  const handleGetHistory = useCallback(async () => {
    if (!historyUser.trim()) return setError("Enter a user address");
    setError(null);
    setIsGettingHistory(true);
    setHistoryData(null);
    try {
      const result = await getScores(historyUser.trim(), walletAddress || undefined);
      trackContractInteraction("get_history", { entry_count: (result ?? []).length });
      setHistoryData((result ?? []) as ScoreEntry[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsGettingHistory(false);
    }
  }, [historyUser, walletAddress]);

  // ── Share current lookup ──────────────────────────────────

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.href);
    if (lookupUser.trim()) url.searchParams.set("user", lookupUser.trim());
    await copyToClipboard(url.toString());
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  }, [lookupUser, copyToClipboard]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "lookup", label: "Lookup", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "submit", label: "Submit", icon: <StarIcon />, color: "#7c6cf0" },
    { key: "history", label: "History", icon: <ChartIcon />, color: "#fbbf24" },
  ];

  const meetsThreshold = lookupData ? lookupData.evaluatorCount >= 3 : false;

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399] mt-0.5">
            {txStatus.includes("on-chain") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#34d399]/90">{txStatus}</span>
            {txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#34d399]/50 hover:text-[#34d399]/80 underline underline-offset-2 transition-colors font-mono"
              >
                View on Stellar Expert →
              </a>
            )}
          </div>
        </div>
      )}

      {shareToast && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#4fc3f7]/15 bg-[#4fc3f7]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="text-[#4fc3f7]"><CheckIcon /></span>
          <span className="text-sm text-[#4fc3f7]/90">Link copied to clipboard</span>
        </div>
      )}

      {/* Main Card — 3D tilt */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transition: "transform 0.15s ease-out", transformStyle: "preserve-3d", willChange: "transform" }}
        className="rounded-2xl"
      >
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#fbbf24]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#fbbf24]">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Credit Score</h3>
                <button
                  onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                  className="flex items-center gap-1.5 text-[10px] text-white/25 font-mono mt-0.5 hover:text-white/50 transition-colors group"
                  title="Copy contract address"
                >
                  {truncate(CONTRACT_ADDRESS)}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyIcon copied={copiedAddr === CONTRACT_ADDRESS} />
                  </span>
                </button>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setLookupData(null); setHistoryData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* ── Lookup ── */}
            {activeTab === "lookup" && (
              <div className="space-y-5">
                <MethodSignature name="get_evaluator_count / get_average_score" params="(user: Address)" returns="-> u32" color="#4fc3f7" />

                <Input
                  label="User Address"
                  value={lookupUser}
                  onChange={(e) => setLookupUser(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="G..."
                  hint={
                    walletAddress ? (
                      <button
                        onClick={() => setLookupUser(walletAddress)}
                        className="flex items-center gap-1 text-[10px] text-[#4fc3f7]/50 hover:text-[#4fc3f7] transition-colors"
                      >
                        <UserIcon /> My address
                      </button>
                    ) : undefined
                  }
                />

                <div className="flex gap-2">
                  <ShimmerButton onClick={handleLookup} disabled={isLookingUp} shimmerColor="#4fc3f7" className="flex-1">
                    {isLookingUp ? <><SpinnerIcon /> Looking up...</> : <><SearchIcon /> Look Up Score</>}
                  </ShimmerButton>
                  {lookupData && (
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-white/40 hover:text-white/70 hover:border-white/[0.10] transition-all"
                      title="Copy shareable link"
                    >
                      <ShareIcon /> Share
                    </button>
                  )}
                </div>

                {lookupData && (
                  <div className="space-y-4 animate-fade-in-up">
                    {/* Threshold warning */}
                    {lookupData.evaluatorCount > 0 && !meetsThreshold && (
                      <div className="flex items-start gap-3 rounded-xl border border-[#fbbf24]/15 bg-[#fbbf24]/[0.03] px-4 py-3 text-xs text-white/40">
                        <span className="text-[#fbbf24] mt-0.5"><AlertIcon /></span>
                        <span>
                          <span className="font-semibold text-[#fbbf24]/70">Low confidence:</span>{" "}
                          Only {lookupData.evaluatorCount} evaluator{lookupData.evaluatorCount !== 1 ? "s" : ""} — at least 3 needed for a trusted score.
                        </span>
                      </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                        <div className="text-2xl font-bold text-white/90">{lookupData.evaluatorCount}</div>
                        <div className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">Evaluators</div>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                        {(() => {
                          const cfg = getScoreConfig(lookupData.averageScore);
                          return (
                            <>
                              <div className={cn("text-2xl font-bold", meetsThreshold ? cfg.color : "text-white/30")}>
                                {lookupData.averageScore}
                              </div>
                              <div className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">
                                {meetsThreshold ? cfg.label : "Unverified"}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Score progress bar */}
                    {lookupData.averageScore > 0 && (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Score Position</span>
                          <span className={cn("text-[10px] font-mono font-semibold", meetsThreshold ? getScoreConfig(lookupData.averageScore).color : "text-white/30")}>
                            {lookupData.averageScore} / 1000
                          </span>
                        </div>
                        <div className="relative h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", meetsThreshold ? getScoreConfig(lookupData.averageScore).bg : "bg-white/20")}
                            style={{ width: `${(lookupData.averageScore / 1000) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          {["Very Poor", "Poor", "Fair", "Good", "Excellent"].map((label) => (
                            <span key={label} className="text-[8px] text-white/15">{label}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bar chart */}
                    {lookupData.scores.length > 0 && (
                      <ScoreBarChart scores={lookupData.scores} />
                    )}

                    {/* Score Entries */}
                    {lookupData.scores.length > 0 && (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                        <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Score Entries</span>
                          <span className="text-[10px] text-white/25 font-mono">{lookupData.scores.length} total</span>
                        </div>
                        <div className="p-2 space-y-2">
                          {lookupData.scores.map((entry, i) => {
                            const cfg = getScoreConfig(entry.score);
                            return (
                              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 border border-white/[0.04] bg-white/[0.01]">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-white/50">{truncate(entry.evaluator)}</span>
                                    <button
                                      onClick={() => copyToClipboard(entry.evaluator)}
                                      className="text-white/20 hover:text-white/60 transition-colors"
                                      title="Copy address"
                                    >
                                      <CopyIcon copied={copiedAddr === entry.evaluator} />
                                    </button>
                                  </div>
                                  {entry.timestamp ? (
                                    <span className="text-[9px] text-white/25">{formatTimestamp(entry.timestamp)}</span>
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={cn("h-1.5 w-1.5 rounded-full", cfg.bg)} />
                                  <span className={cn("font-mono text-sm font-semibold", cfg.color)}>{entry.score}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {lookupData.scores.length === 0 && (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center">
                        <p className="text-sm text-white/25">No scores found for this user</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Submit ── */}
            {activeTab === "submit" && (
              <div className="space-y-5">
                <MethodSignature name="submit_score" params="(user: Address, score: u32, evaluator: Address)" color="#7c6cf0" />
                <div className="rounded-xl border border-[#7c6cf0]/15 bg-[#7c6cf0]/[0.03] px-4 py-3 text-xs text-white/40">
                  <span className="font-semibold text-[#7c6cf0]/70">Note:</span> Scores must be 0–1000. You are the evaluator.
                </div>
                <Input
                  label="User Address"
                  value={submitUser}
                  onChange={(e) => setSubmitUser(e.target.value)}
                  placeholder="G... (the person being rated)"
                />
                <Input
                  label="Score (0-1000)"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={submitScoreValue}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, "");
                    if (v === "" || (parseInt(v, 10) <= 1000)) setSubmitScoreValue(v);
                  }}
                  placeholder="e.g. 750"
                />

                {/* Visual score slider */}
                {(() => {
                  const val = submitScoreValue !== "" ? parseInt(submitScoreValue, 10) : 0;
                  const cfg = getScoreConfig(isNaN(val) ? 0 : val);
                  const colorMap: Record<string, string> = {
                    "bg-[#34d399]": "#34d399",
                    "bg-[#4fc3f7]": "#4fc3f7",
                    "bg-[#fbbf24]": "#fbbf24",
                    "bg-[#fb923c]": "#fb923c",
                    "bg-[#f87171]": "#f87171",
                  };
                  const color = colorMap[cfg.bg] ?? "#7c6cf0";
                  const pct = isNaN(val) ? 0 : (val / 1000) * 100;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">Visual Range</span>
                        <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={isNaN(val) ? 0 : val}
                        onChange={(e) => setSubmitScoreValue(e.target.value)}
                        className="score-slider"
                        style={{ "--slider-color": color, "--slider-pct": `${pct}%` } as React.CSSProperties}
                      />
                      <div className="flex justify-between text-[9px] text-white/20">
                        <span>Very Poor</span>
                        <span>Poor</span>
                        <span>Fair</span>
                        <span>Good</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  );
                })()}

                {walletAddress ? (
                  <ShimmerButton onClick={handleSubmitScore} disabled={isSubmitting} shimmerColor="#7c6cf0" className="w-full">
                    {isSubmitting ? <><SpinnerIcon /> Submitting...</> : <><StarIcon /> Submit Score</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={async () => {
                      setError(null);
                      try {
                        await onConnect();
                      } catch (err: unknown) {
                        setError(err instanceof Error ? err.message : "Failed to connect wallet");
                      }
                    }}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {isConnecting ? "Connecting..." : "Connect wallet to submit scores"}
                  </button>
                )}

                {/* Score Guide */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {[
                    { range: "800-1000", label: "Excellent", color: "bg-[#34d399]" },
                    { range: "700-799", label: "Good", color: "bg-[#4fc3f7]" },
                    { range: "600-699", label: "Fair", color: "bg-[#fbbf24]" },
                    { range: "400-599", label: "Poor", color: "bg-[#fb923c]" },
                    { range: "0-399", label: "Very Poor", color: "bg-[#f87171]" },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2">
                      <div className={cn("h-1.5 w-1.5 rounded-full", s.color)} />
                      <div className="text-[9px] font-mono text-white/35">{s.range}</div>
                      <div className="text-[8px] text-white/20 text-center leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── History ── */}
            {activeTab === "history" && (
              <div className="space-y-5">
                <MethodSignature name="get_scores" params="(user: Address)" returns="-> Vec<ScoreEntry>" color="#fbbf24" />
                <Input
                  label="User Address"
                  value={historyUser}
                  onChange={(e) => setHistoryUser(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGetHistory()}
                  placeholder="G..."
                  hint={
                    walletAddress ? (
                      <button
                        onClick={() => setHistoryUser(walletAddress)}
                        className="flex items-center gap-1 text-[10px] text-[#fbbf24]/50 hover:text-[#fbbf24] transition-colors"
                      >
                        <UserIcon /> My address
                      </button>
                    ) : undefined
                  }
                />
                <ShimmerButton onClick={handleGetHistory} disabled={isGettingHistory} shimmerColor="#fbbf24" className="w-full">
                  {isGettingHistory ? <><SpinnerIcon /> Fetching...</> : <><ChartIcon /> Get Full History</>}
                </ShimmerButton>

                {historyData && (
                  <div className="space-y-3 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">All Score Entries</span>
                      <span className="text-[10px] text-white/25 font-mono">{historyData.length} total</span>
                    </div>
                    {historyData.length === 0 ? (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center">
                        <p className="text-sm text-white/25">No scores found for this user</p>
                      </div>
                    ) : (
                      historyData.map((entry, i) => {
                        const cfg = getScoreConfig(entry.score);
                        return (
                          <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
                                <UserIcon />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs text-white/70">{truncate(entry.evaluator)}</span>
                                  <button
                                    onClick={() => copyToClipboard(entry.evaluator)}
                                    className="text-white/20 hover:text-white/60 transition-colors"
                                    title="Copy address"
                                  >
                                    <CopyIcon copied={copiedAddr === entry.evaluator} />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] text-white/25">
                                    {entry.timestamp ? formatTimestamp(entry.timestamp) : `Evaluator #${i + 1}`}
                                  </span>
                                  <a
                                    href={`https://stellar.expert/explorer/testnet/account/${entry.evaluator}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-[#4fc3f7]/40 hover:text-[#4fc3f7]/80 transition-colors underline underline-offset-2"
                                    title="View on Stellar Expert"
                                  >
                                    Stellar Expert →
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn("font-mono text-sm font-bold", cfg.color)}>{entry.score}</span>
                              <div className={cn("h-1.5 w-1.5 rounded-full", cfg.bg)} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Credit Score &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["0-399", "400-599", "600-699", "700-799", "800-1000"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 4 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
