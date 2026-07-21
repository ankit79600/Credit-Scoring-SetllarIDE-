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
  submitScore,
  getAverageScore,
  getEvaluatorCount,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import {
  getTotalStaked,
  getRewardsEarned,
  getStake,
  stakeForBorrower,
  claimReward,
  type StakeInfo,
} from "@/hooks/reputation_stake";
import { REPUTATION_STAKE_ADDRESS } from "@/hooks/loan_pool";

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

const STAKE_DEPLOYED = REPUTATION_STAKE_ADDRESS !== "PLACEHOLDER_REPUTATION_STAKE_CONTRACT_ADDRESS";

function getScoreLabel(score: number) {
  if (score >= 800) return { color: "text-[#34d399]", label: "Excellent" };
  if (score >= 700) return { color: "text-[#4fc3f7]", label: "Good" };
  if (score >= 600) return { color: "text-[#fbbf24]", label: "Fair" };
  if (score >= 400) return { color: "text-[#fb923c]", label: "Poor" };
  return { color: "text-[#f87171]", label: "Very Poor" };
}

export default function EvaluatePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Evaluator stats
  const [totalStaked, setTotalStaked] = useState<bigint>(BigInt(0));
  const [rewardsEarned, setRewardsEarned] = useState<bigint>(BigInt(0));
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Score submission form
  const [scoreTarget, setScoreTarget] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  // Stake form
  const [stakeTarget, setStakeTarget] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [currentStake, setCurrentStake] = useState<StakeInfo | null>(null);
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Target address lookup
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [targetEvalCount, setTargetEvalCount] = useState<number | null>(null);
  const [isLookingUpTarget, setIsLookingUpTarget] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "stake">("score");

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
    if (!walletAddress || !STAKE_DEPLOYED) return;
    loadEvaluatorStats(walletAddress);
  }, [walletAddress]);

  async function loadEvaluatorStats(address: string) {
    setIsLoadingStats(true);
    try {
      const [staked, rewards] = await Promise.all([
        getTotalStaked(address),
        getRewardsEarned(address),
      ]);
      setTotalStaked(staked);
      setRewardsEarned(rewards);
    } catch { /* ignore */ }
    finally { setIsLoadingStats(false); }
  }

  async function lookupTarget(addr: string) {
    if (!addr.trim() || addr.length < 10) return;
    setIsLookingUpTarget(true);
    try {
      const [score, count] = await Promise.all([
        getAverageScore(addr.trim(), walletAddress ?? undefined),
        getEvaluatorCount(addr.trim(), walletAddress ?? undefined),
      ]);
      setTargetScore(score ?? 0);
      setTargetEvalCount(count ?? 0);

      if (walletAddress && STAKE_DEPLOYED) {
        const stake = await getStake(walletAddress, addr.trim());
        setCurrentStake(stake);
      }
    } catch { /* ignore */ }
    finally { setIsLookingUpTarget(false); }
  }

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch { /* handled */ }
    finally { setIsConnecting(false); }
  }, []);

  const handleSubmitScore = useCallback(async () => {
    if (!walletAddress || !scoreTarget.trim() || !scoreValue) return;
    const score = parseInt(scoreValue, 10);
    if (isNaN(score) || score < 0 || score > 1000) return setError("Score must be 0–1000");
    setError(null);
    setIsSubmittingScore(true);
    setSuccess(null);
    try {
      await submitScore(walletAddress, scoreTarget.trim(), score, walletAddress);
      setSuccess(`Score ${score} submitted for ${scoreTarget.slice(0, 8)}...`);
      setScoreValue("");
      await lookupTarget(scoreTarget.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setIsSubmittingScore(false);
    }
  }, [walletAddress, scoreTarget, scoreValue]);

  const handleStake = useCallback(async () => {
    if (!walletAddress || !stakeTarget.trim() || !stakeAmount) return;
    const amountStroops = BigInt(Math.round(parseFloat(stakeAmount) * 1e7));
    setError(null);
    setIsStaking(true);
    setSuccess(null);
    try {
      await stakeForBorrower(walletAddress, stakeTarget.trim(), amountStroops);
      setSuccess("Stake placed! You are now accountable for this borrower.");
      setStakeAmount("");
      await loadEvaluatorStats(walletAddress);
      await lookupTarget(stakeTarget.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Staking failed");
    } finally {
      setIsStaking(false);
    }
  }, [walletAddress, stakeTarget, stakeAmount]);

  const handleClaim = useCallback(async () => {
    if (!walletAddress || !stakeTarget.trim()) return;
    setError(null);
    setIsClaiming(true);
    setSuccess(null);
    try {
      await claimReward(walletAddress, stakeTarget.trim());
      setSuccess("Reward claimed! Principal + 5% bonus returned.");
      await loadEvaluatorStats(walletAddress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setIsClaiming(false);
    }
  }, [walletAddress, stakeTarget]);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="relative flex flex-col min-h-screen bg-[#050510] overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Meteors number={8} />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#7c6cf0]/15 blur-[120px] animate-float-delayed" />
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
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7c6cf0]/20 bg-[#7c6cf0]/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c6cf0" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white/90 sm:text-2xl">Evaluator Portal</h1>
                <p className="text-xs text-white/35">Submit scores and stake reputation to vouch for borrowers</p>
              </div>
            </div>
          </div>

          {/* Toasts */}
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 animate-slide-down">
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

          {/* Evaluator stats (if stake contract deployed) */}
          {walletAddress && STAKE_DEPLOYED && (
            <div className="mb-4 grid grid-cols-2 gap-3 animate-fade-in-up">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <div className="font-mono text-lg font-bold text-[#7c6cf0]">
                  {isLoadingStats ? "…" : `${(Number(totalStaked) / 1e7).toFixed(2)}`}
                </div>
                <div className="mt-1 text-[10px] text-white/25 uppercase tracking-wider">Total Staked</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <div className="font-mono text-lg font-bold text-[#34d399]">
                  {isLoadingStats ? "…" : `${(Number(rewardsEarned) / 1e7).toFixed(4)}`}
                </div>
                <div className="mt-1 text-[10px] text-white/25 uppercase tracking-wider">Rewards Earned</div>
              </div>
            </div>
          )}

          {/* Connect prompt */}
          {!walletAddress ? (
            <AnimatedCard className="mb-6 p-8 text-center">
              <p className="mb-4 text-white/50">Connect wallet to submit scores and manage reputation stakes</p>
              <ShimmerButton onClick={handleConnect} disabled={isConnecting} shimmerColor="#7c6cf0" className="mx-auto">
                {isConnecting ? <><SpinnerIcon /> Connecting...</> : "Connect Wallet"}
              </ShimmerButton>
            </AnimatedCard>
          ) : (
            <AnimatedCard className="animate-fade-in-up-delayed">
              {/* Tabs */}
              <div className="flex border-b border-white/[0.06] px-2">
                {([
                  { key: "score" as const, label: "Submit Score", color: "#7c6cf0" },
                  { key: "stake" as const, label: "Reputation Stake", color: "#fbbf24" },
                ]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={cn(
                      "relative px-5 py-3.5 text-sm font-medium transition-all",
                      activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                    )}
                  >
                    {t.label}
                    {activeTab === t.key && (
                      <span
                        className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                        style={{ background: t.color }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">
                {activeTab === "score" ? (
                  <div className="space-y-4">
                    {/* Contract info */}
                    <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-2">
                      <span className="text-[10px] text-white/25 uppercase tracking-wider">Contract</span>
                      <span className="font-mono text-[10px] text-white/40">{truncate(CONTRACT_ADDRESS)}</span>
                    </div>

                    {/* Target address */}
                    <div>
                      <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                        Borrower Address
                      </label>
                      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30">
                        <input
                          value={scoreTarget}
                          onChange={(e) => {
                            setScoreTarget(e.target.value);
                            if (e.target.value.length > 10) lookupTarget(e.target.value);
                          }}
                          placeholder="G... (address to evaluate)"
                          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                        />
                      </div>
                    </div>

                    {/* Target score preview */}
                    {targetScore !== null && (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center justify-between">
                        <span className="text-xs text-white/40">Current avg score</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono text-sm font-bold", getScoreLabel(targetScore).color)}>
                            {targetScore}
                          </span>
                          <span className="text-[10px] text-white/25">({targetEvalCount} evaluators)</span>
                        </div>
                      </div>
                    )}

                    {/* Score input */}
                    <div>
                      <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                        Score (0–1000)
                      </label>
                      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30">
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={scoreValue}
                          onChange={(e) => setScoreValue(e.target.value)}
                          placeholder="e.g. 750"
                          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                        />
                      </div>
                    </div>

                    {/* Score guide */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { range: "800+", label: "Excellent", color: "bg-[#34d399]" },
                        { range: "700+", label: "Good", color: "bg-[#4fc3f7]" },
                        { range: "600+", label: "Fair", color: "bg-[#fbbf24]" },
                        { range: "400+", label: "Poor", color: "bg-[#fb923c]" },
                        { range: "0+", label: "V.Poor", color: "bg-[#f87171]" },
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center gap-1 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2">
                          <div className={cn("h-1.5 w-1.5 rounded-full", s.color)} />
                          <div className="text-[8px] font-mono text-white/30">{s.range}</div>
                          <div className="text-[8px] text-white/20 text-center">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <ShimmerButton
                      onClick={handleSubmitScore}
                      disabled={isSubmittingScore || !scoreTarget.trim() || !scoreValue}
                      shimmerColor="#7c6cf0"
                      className="w-full"
                    >
                      {isSubmittingScore ? <><SpinnerIcon /> Submitting...</> : "Submit Score On-Chain"}
                    </ShimmerButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!STAKE_DEPLOYED && (
                      <div className="rounded-xl border border-[#fbbf24]/15 bg-[#fbbf24]/[0.05] px-4 py-3 text-xs text-[#fbbf24]/80">
                        ReputationStake contract not yet deployed. Update <code className="font-mono">REPUTATION_STAKE_ADDRESS</code> in <code className="font-mono">hooks/loan_pool.ts</code>.
                      </div>
                    )}

                    <div className="rounded-xl border border-[#fbbf24]/10 bg-[#fbbf24]/[0.03] px-4 py-3 text-xs text-white/40 leading-relaxed">
                      <strong className="text-[#fbbf24]/70">Skin in the game:</strong>{" "}
                      Staking tokens when vouching for a borrower makes your evaluation credible.
                      If the borrower defaults, your stake is slashed. If they repay, you earn +5%.
                    </div>

                    {/* Target address for stake */}
                    <div>
                      <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                        Borrower Address
                      </label>
                      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#fbbf24]/30">
                        <input
                          value={stakeTarget}
                          onChange={(e) => {
                            setStakeTarget(e.target.value);
                            if (e.target.value.length > 10) lookupTarget(e.target.value);
                          }}
                          placeholder="G... (borrower to vouch for)"
                          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                        />
                      </div>
                    </div>

                    {/* Current stake status */}
                    {currentStake && (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/40">Your stake for this borrower</span>
                          <Badge variant={currentStake.is_slashed ? "warning" : currentStake.reward_claimed ? "success" : "info"}>
                            {currentStake.is_slashed ? "Slashed" : currentStake.reward_claimed ? "Claimed" : "Active"}
                          </Badge>
                        </div>
                        <div className="font-mono text-sm font-bold text-white/80">
                          {(Number(currentStake.amount) / 1e7).toFixed(4)} tokens
                        </div>
                        {!currentStake.is_slashed && !currentStake.reward_claimed && (
                          <button
                            onClick={handleClaim}
                            disabled={isClaiming || !STAKE_DEPLOYED}
                            className="mt-3 w-full rounded-lg border border-[#34d399]/20 bg-[#34d399]/[0.05] py-2 text-xs font-medium text-[#34d399]/70 hover:bg-[#34d399]/[0.1] transition-all disabled:opacity-40"
                          >
                            {isClaiming ? "Claiming..." : "Claim Reward (+5%)"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Stake amount */}
                    {!currentStake && (
                      <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                          Stake Amount (tokens)
                        </label>
                        <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#fbbf24]/30">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder="e.g. 10"
                            className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {!currentStake && (
                      <ShimmerButton
                        onClick={handleStake}
                        disabled={isStaking || !stakeTarget.trim() || !stakeAmount || !STAKE_DEPLOYED}
                        shimmerColor="#fbbf24"
                        className="w-full"
                      >
                        {isStaking
                          ? <><SpinnerIcon /> Staking...</>
                          : !STAKE_DEPLOYED
                            ? "Contract Not Deployed"
                            : "Stake Reputation"}
                      </ShimmerButton>
                    )}
                  </div>
                )}
              </div>
            </AnimatedCard>
          )}
        </div>
      </main>
    </div>
  );
}
