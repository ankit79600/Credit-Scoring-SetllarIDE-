"use client";

import { useState, useCallback } from "react";
import {
  submitScore,
  getScores,
  getEvaluatorCount,
  getAverageScore,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
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

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
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

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
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

// ── Score Badge ──────────────────────────────────────────────

function getScoreConfig(score: number): { color: string; bg: string; label: string } {
  if (score >= 800) return { color: "text-[#34d399]", bg: "bg-[#34d399]", label: "Excellent" };
  if (score >= 700) return { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]", label: "Good" };
  if (score >= 600) return { color: "text-[#fbbf24]", bg: "bg-[#fbbf24]", label: "Fair" };
  if (score >= 400) return { color: "text-[#fb923c]", bg: "bg-[#fb923c]", label: "Poor" };
  return { color: "text-[#f87171]", bg: "bg-[#f87171]", label: "Very Poor" };
}

// ── Main Component ───────────────────────────────────────────

type Tab = "lookup" | "submit" | "history";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("lookup");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Submit form state
  const [submitUser, setSubmitUser] = useState("");
  const [submitScoreValue, setSubmitScoreValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lookup state
  const [lookupUser, setLookupUser] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupData, setLookupData] = useState<{
    evaluatorCount: number;
    averageScore: number;
    scores: Array<{ evaluator: string; score: number }>;
  } | null>(null);

  // History state
  const [historyUser, setHistoryUser] = useState("");
  const [isGettingHistory, setIsGettingHistory] = useState(false);
  const [historyData, setHistoryData] = useState<Array<{ evaluator: string; score: number }> | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Handle submit score
  const handleSubmitScore = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!submitUser.trim() || !submitScoreValue.trim()) return setError("Fill in all fields");
    const scoreNum = parseInt(submitScoreValue, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 1000) {
      return setError("Score must be between 0 and 1000");
    }
    setError(null);
    setIsSubmitting(true);
    setTxStatus("Awaiting signature...");
    try {
      await submitScore(walletAddress, submitUser.trim(), scoreNum, walletAddress);
      setTxStatus("Score submitted on-chain!");
      setSubmitUser("");
      setSubmitScoreValue("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [walletAddress, submitUser, submitScoreValue]);

  // Handle lookup
  const handleLookup = useCallback(async () => {
    if (!lookupUser.trim()) return setError("Enter a user address");
    setError(null);
    setIsLookingUp(true);
    setLookupData(null);
    try {
      const [countResult, avgResult, scoresResult] = await Promise.all([
        getEvaluatorCount(lookupUser.trim(), walletAddress || undefined),
        getAverageScore(lookupUser.trim(), walletAddress || undefined),
        getScores(lookupUser.trim(), walletAddress || undefined),
      ]);
      setLookupData({
        evaluatorCount: countResult ?? 0,
        averageScore: avgResult ?? 0,
        scores: (scoresResult ?? []) as Array<{ evaluator: string; score: number }>,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsLookingUp(false);
    }
  }, [lookupUser, walletAddress]);

  // Handle history
  const handleGetHistory = useCallback(async () => {
    if (!historyUser.trim()) return setError("Enter a user address");
    setError(null);
    setIsGettingHistory(true);
    setHistoryData(null);
    try {
      const result = await getScores(historyUser.trim(), walletAddress || undefined);
      setHistoryData((result ?? []) as Array<{ evaluator: string; score: number }>);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsGettingHistory(false);
    }
  }, [historyUser, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "lookup", label: "Lookup", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "submit", label: "Submit", icon: <StarIcon />, color: "#7c6cf0" },
    { key: "history", label: "History", icon: <ChartIcon />, color: "#fbbf24" },
  ];

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
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
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
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
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
            {/* Lookup */}
            {activeTab === "lookup" && (
              <div className="space-y-5">
                <MethodSignature name="get_evaluator_count / get_average_score" params="(user: Address)" returns="-> u32" color="#4fc3f7" />
                <Input label="User Address" value={lookupUser} onChange={(e) => setLookupUser(e.target.value)} placeholder="G..." />
                <ShimmerButton onClick={handleLookup} disabled={isLookingUp} shimmerColor="#4fc3f7" className="w-full">
                  {isLookingUp ? <><SpinnerIcon /> Looking up...</> : <><SearchIcon /> Look Up Score</>}
                </ShimmerButton>

                {lookupData && (
                  <div className="space-y-4 animate-fade-in-up">
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
                              <div className={cn("text-2xl font-bold", cfg.color)}>{lookupData.averageScore}</div>
                              <div className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">{cfg.label}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

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
                                <span className="font-mono text-xs text-white/50">{truncate(entry.evaluator)}</span>
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

            {/* Submit */}
            {activeTab === "submit" && (
              <div className="space-y-5">
                <MethodSignature name="submit_score" params="(user: Address, score: u32, evaluator: Address)" color="#7c6cf0" />
                <div className="rounded-xl border border-[#7c6cf0]/15 bg-[#7c6cf0]/[0.03] px-4 py-3 text-xs text-white/40">
                  <span className="font-semibold text-[#7c6cf0]/70">Note:</span> Scores must be 0–1000. You are the evaluator.
                </div>
                <Input label="User Address" value={submitUser} onChange={(e) => setSubmitUser(e.target.value)} placeholder="G... (the person being rated)" />
                <Input label="Score (0-1000)" type="number" min="0" max="1000" value={submitScoreValue} onChange={(e) => setSubmitScoreValue(e.target.value)} placeholder="e.g. 750" />

                {walletAddress ? (
                  <ShimmerButton onClick={handleSubmitScore} disabled={isSubmitting} shimmerColor="#7c6cf0" className="w-full">
                    {isSubmitting ? <><SpinnerIcon /> Submitting...</> : <><StarIcon /> Submit Score</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to submit scores
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

            {/* History */}
            {activeTab === "history" && (
              <div className="space-y-5">
                <MethodSignature name="get_scores" params="(user: Address)" returns="-> Vec<ScoreEntry>" color="#fbbf24" />
                <Input label="User Address" value={historyUser} onChange={(e) => setHistoryUser(e.target.value)} placeholder="G..." />
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
                                <div className="font-mono text-xs text-white/70">{truncate(entry.evaluator)}</div>
                                <div className="text-[9px] text-white/25">Evaluator #{i + 1}</div>
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
      </Spotlight>
    </div>
  );
}
