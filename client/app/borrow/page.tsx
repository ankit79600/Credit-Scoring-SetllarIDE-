"use client";

import { useState, useEffect, useCallback } from "react";
import { Meteors } from "@/components/ui/meteors";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { cn } from "@/lib/utils";
import {
  connectWallet,
  getWalletAddress,
  checkConnection,
  getAverageScore,
  getEvaluatorCount,
} from "@/hooks/contract";
import {
  getLoan,
  getPoolStats,
  borrow,
  repay,
  LOAN_POOL_ADDRESS,
  stroopsToDisplay,
  type LoanInfo,
  type PoolStats,
} from "@/hooks/loan_pool";

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function getScoreColor(score: number) {
  if (score >= 800) return { text: "text-[#34d399]", label: "Excellent", bg: "bg-[#34d399]" };
  if (score >= 700) return { text: "text-[#4fc3f7]", label: "Good", bg: "bg-[#4fc3f7]" };
  if (score >= 600) return { text: "text-[#fbbf24]", label: "Fair", bg: "bg-[#fbbf24]" };
  if (score >= 400) return { text: "text-[#fb923c]", label: "Poor", bg: "bg-[#fb923c]" };
  return { text: "text-[#f87171]", label: "Very Poor", bg: "bg-[#f87171]" };
}

const MIN_SCORE = 600;
const LOAN_POOL_DEPLOYED = LOAN_POOL_ADDRESS !== "PLACEHOLDER_LOAN_POOL_CONTRACT_ADDRESS";

export default function BorrowPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Credit score state
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [evaluatorCount, setEvaluatorCount] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Loan state
  const [loanInfo, setLoanInfo] = useState<LoanInfo | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [isLoadingLoan, setIsLoadingLoan] = useState(false);

  // Borrow form
  const [borrowAmount, setBorrowAmount] = useState("");
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (await checkConnection()) {
          const addr = await getWalletAddress();
          if (addr) setWalletAddress(addr);
        }
      } catch { /* no wallet */ }
    })();
  }, []);

  useEffect(() => {
    if (!walletAddress) return;
    loadUserData(walletAddress);
  }, [walletAddress]);

  async function loadUserData(address: string) {
    setIsLoadingScore(true);
    setIsLoadingLoan(true);
    setError(null);

    try {
      const [score, count, stats] = await Promise.all([
        getAverageScore(address, address),
        getEvaluatorCount(address, address),
        LOAN_POOL_DEPLOYED ? getPoolStats(address) : null,
      ]);
      setAvgScore(score ?? 0);
      setEvaluatorCount(count ?? 0);
      setPoolStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setIsLoadingScore(false);
    }

    if (LOAN_POOL_DEPLOYED) {
      try {
        const loan = await getLoan(address, address);
        setLoanInfo(loan);
      } catch { /* no active loan */ }
    }
    setIsLoadingLoan(false);
  }

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch { /* handled */ }
    finally { setIsConnecting(false); }
  }, []);

  const handleBorrow = useCallback(async () => {
    if (!walletAddress || !borrowAmount) return;
    const amountStroops = BigInt(Math.round(parseFloat(borrowAmount) * 1e7));
    if (amountStroops <= BigInt(0)) return setError("Enter a valid amount");
    setError(null);
    setIsBorrowing(true);
    setSuccess(null);
    try {
      await borrow(walletAddress, amountStroops);
      setSuccess("Loan disbursed! Funds sent to your wallet.");
      setBorrowAmount("");
      await loadUserData(walletAddress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Borrow failed");
    } finally {
      setIsBorrowing(false);
    }
  }, [walletAddress, borrowAmount]);

  const handleRepay = useCallback(async () => {
    if (!walletAddress) return;
    setError(null);
    setIsRepaying(true);
    setSuccess(null);
    try {
      await repay(walletAddress);
      setSuccess("Loan repaid successfully!");
      setLoanInfo(null);
      await loadUserData(walletAddress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Repayment failed");
    } finally {
      setIsRepaying(false);
    }
  }, [walletAddress]);

  const scoreEligible = (avgScore ?? 0) >= MIN_SCORE && (evaluatorCount ?? 0) >= 1;

  return (
    <div className="relative flex flex-col min-h-screen bg-[#050510] overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Meteors number={8} />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#4fc3f7]/15 blur-[120px] animate-float" />
      </div>

      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={() => setWalletAddress(null)}
        isConnecting={isConnecting}
      />

      <main className="relative z-10 flex flex-1 w-full flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4fc3f7]/20 bg-[#4fc3f7]/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white/90 sm:text-2xl">Borrow</h1>
                <p className="text-xs text-white/35">Access capital using your on-chain reputation</p>
              </div>
            </div>
          </div>

          {/* Toasts */}
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 animate-slide-down">
              <span className="text-[#f87171] mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
              <p className="flex-1 text-sm text-[#f87171]/90 break-all">{error}</p>
              <button onClick={() => setError(null)} className="text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 animate-slide-down">
              <span className="text-[#34d399]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <p className="text-sm text-[#34d399]/90">{success}</p>
            </div>
          )}

          {/* Connect prompt */}
          {!walletAddress && (
            <AnimatedCard className="mb-6 p-8 text-center">
              <p className="mb-4 text-white/50">Connect your Freighter wallet to check eligibility and apply for loans</p>
              <ShimmerButton onClick={handleConnect} disabled={isConnecting} shimmerColor="#4fc3f7" className="mx-auto">
                {isConnecting ? <><SpinnerIcon /> Connecting...</> : "Connect Wallet"}
              </ShimmerButton>
            </AnimatedCard>
          )}

          {walletAddress && (
            <div className="space-y-4 animate-fade-in-up-delayed">

              {/* Credit eligibility card */}
              <AnimatedCard className="p-5 sm:p-6">
                <h2 className="mb-4 text-sm font-semibold text-white/70">Your Credit Eligibility</h2>
                {isLoadingScore ? (
                  <div className="flex items-center gap-2 text-white/40">
                    <SpinnerIcon /> Loading your score...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <div className={cn("text-2xl font-bold", getScoreColor(avgScore ?? 0).text)}>
                        {avgScore ?? 0}
                      </div>
                      <div className="text-[10px] text-white/25 mt-1">Avg Score</div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <div className="text-2xl font-bold text-white/90">{evaluatorCount ?? 0}</div>
                      <div className="text-[10px] text-white/25 mt-1">Evaluators</div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <div className={cn("text-2xl font-bold", scoreEligible ? "text-[#34d399]" : "text-[#f87171]")}>
                        {scoreEligible ? "✓" : "✗"}
                      </div>
                      <div className="text-[10px] text-white/25 mt-1">Eligible</div>
                    </div>
                  </div>
                )}

                {!isLoadingScore && !scoreEligible && (
                  <div className="mt-4 rounded-xl border border-[#fbbf24]/15 bg-[#fbbf24]/[0.05] px-4 py-3">
                    <p className="text-xs text-[#fbbf24]/80">
                      {(evaluatorCount ?? 0) === 0
                        ? "You need at least 1 evaluator to vouch for you before borrowing."
                        : `Your score (${avgScore}) is below the minimum (${MIN_SCORE}). Get more evaluators to raise it.`}
                    </p>
                  </div>
                )}
              </AnimatedCard>

              {/* Pool stats */}
              {poolStats && (
                <AnimatedCard className="p-5 sm:p-6">
                  <h2 className="mb-4 text-sm font-semibold text-white/70">Pool Liquidity</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Total Deposits", value: stroopsToDisplay(poolStats.total_deposits) },
                      { label: "Available", value: stroopsToDisplay(poolStats.available_liquidity) },
                      { label: "Active Loans", value: stroopsToDisplay(poolStats.total_loans_outstanding) },
                      { label: "Interest Earned", value: stroopsToDisplay(poolStats.total_interest_earned) },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                        <div className="font-mono text-sm font-bold text-white/90">{s.value}</div>
                        <div className="text-[10px] text-white/25 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              )}

              {/* Active loan */}
              {loanInfo?.is_active && (
                <AnimatedCard className="p-5 sm:p-6 border-[#fbbf24]/15">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white/70">Active Loan</h2>
                    <Badge variant="warning">Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <div className="font-mono text-sm font-bold text-white/90">{stroopsToDisplay(loanInfo.amount)}</div>
                      <div className="text-[10px] text-white/25 mt-1">Principal</div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <div className="font-mono text-sm font-bold text-[#fbbf24]">{stroopsToDisplay(loanInfo.interest_amount)}</div>
                      <div className="text-[10px] text-white/25 mt-1">Interest</div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center col-span-2 sm:col-span-1">
                      <div className="font-mono text-sm font-bold text-white/90">{stroopsToDisplay(loanInfo.amount + loanInfo.interest_amount)}</div>
                      <div className="text-[10px] text-white/25 mt-1">Total Owed</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ShimmerButton
                      onClick={handleRepay}
                      disabled={isRepaying || !LOAN_POOL_DEPLOYED}
                      shimmerColor="#34d399"
                      className="w-full"
                    >
                      {isRepaying ? <><SpinnerIcon /> Processing repayment...</> : "Repay Loan"}
                    </ShimmerButton>
                  </div>
                </AnimatedCard>
              )}

              {/* Borrow form */}
              {!loanInfo?.is_active && (
                <AnimatedCard className="p-5 sm:p-6">
                  <h2 className="mb-4 text-sm font-semibold text-white/70">Apply for a Loan</h2>

                  {!LOAN_POOL_DEPLOYED ? (
                    <div className="rounded-xl border border-[#fbbf24]/15 bg-[#fbbf24]/[0.05] px-4 py-4 text-center">
                      <p className="text-sm text-[#fbbf24]/80 font-medium mb-1">LoanPool Contract Not Deployed</p>
                      <p className="text-xs text-[#fbbf24]/50">
                        Deploy the LoanPool contract and update <code className="font-mono">LOAN_POOL_ADDRESS</code> in <code className="font-mono">hooks/loan_pool.ts</code>
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 space-y-2">
                        <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
                          Loan Amount (tokens)
                        </label>
                        <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#4fc3f7]/30">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={borrowAmount}
                            onChange={(e) => setBorrowAmount(e.target.value)}
                            placeholder="e.g. 50 (= 50 tokens)"
                            className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-white/25">Interest is pre-computed and fixed at loan creation</p>
                      </div>

                      <ShimmerButton
                        onClick={handleBorrow}
                        disabled={isBorrowing || !scoreEligible || !borrowAmount}
                        shimmerColor="#4fc3f7"
                        className="w-full"
                      >
                        {isBorrowing
                          ? <><SpinnerIcon /> Processing...</>
                          : !scoreEligible
                            ? "Score Too Low to Borrow"
                            : "Apply for Loan"}
                      </ShimmerButton>
                    </>
                  )}
                </AnimatedCard>
              )}

              {/* Info callout */}
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-xs text-white/30 leading-relaxed">
                <strong className="text-white/50">How it works: </strong>
                The LoanPool contract calls the CreditScore contract cross-contract to verify your eligibility.
                Your evaluators&apos; vouches are your collateral. Loan duration is ~1 week (120,960 ledgers at 5s each).
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
