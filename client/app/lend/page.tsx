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
} from "@/hooks/contract";
import {
  getPoolStats,
  getLpShares,
  getInterestRateBps,
  deposit,
  withdraw,
  LOAN_POOL_ADDRESS,
  stroopsToDisplay,
  type PoolStats,
} from "@/hooks/loan_pool";

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

const LOAN_POOL_DEPLOYED = LOAN_POOL_ADDRESS !== "PLACEHOLDER_LOAN_POOL_CONTRACT_ADDRESS";

export default function LendPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [lpShares, setLpShares] = useState<bigint>(BigInt(0));
  const [interestRateBps, setInterestRateBps] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawShares, setWithdrawShares] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

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
    loadData(walletAddress ?? undefined);
  }, [walletAddress]);

  async function loadData(address?: string) {
    setIsLoading(true);
    setError(null);
    try {
      const [stats, rate] = await Promise.all([
        LOAN_POOL_DEPLOYED ? getPoolStats(address) : null,
        LOAN_POOL_DEPLOYED ? getInterestRateBps(address) : 1000,
      ]);
      setPoolStats(stats);
      setInterestRateBps(rate);

      if (address && LOAN_POOL_DEPLOYED) {
        const shares = await getLpShares(address, address);
        setLpShares(shares);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pool data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch { /* handled */ }
    finally { setIsConnecting(false); }
  }, []);

  const handleDeposit = useCallback(async () => {
    if (!walletAddress || !depositAmount) return;
    const amountStroops = BigInt(Math.round(parseFloat(depositAmount) * 1e7));
    setError(null);
    setIsDepositing(true);
    setSuccess(null);
    try {
      await deposit(walletAddress, amountStroops);
      setSuccess("Deposit successful! LP shares minted.");
      setDepositAmount("");
      await loadData(walletAddress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deposit failed");
    } finally {
      setIsDepositing(false);
    }
  }, [walletAddress, depositAmount]);

  const handleWithdraw = useCallback(async () => {
    if (!walletAddress || !withdrawShares) return;
    const sharesAmt = BigInt(Math.round(parseFloat(withdrawShares) * 1e7));
    setError(null);
    setIsWithdrawing(true);
    setSuccess(null);
    try {
      await withdraw(walletAddress, sharesAmt);
      setSuccess("Withdrawal successful!");
      setWithdrawShares("");
      await loadData(walletAddress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  }, [walletAddress, withdrawShares]);

  // Pool utilization %
  const utilization =
    poolStats && poolStats.total_deposits > BigInt(0)
      ? Number((poolStats.total_loans_outstanding * BigInt(100)) / poolStats.total_deposits)
      : 0;

  // Estimated APY from interest rate
  const estimatedApy = (interestRateBps / 100).toFixed(1);

  // LP share value if pool exists
  const shareValue =
    poolStats && poolStats.total_shares > BigInt(0) && lpShares > BigInt(0)
      ? (lpShares * poolStats.total_deposits) / poolStats.total_shares
      : BigInt(0);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#050510] overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Meteors number={8} />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#34d399]/10 blur-[120px] animate-float" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#34d399]/20 bg-[#34d399]/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white/90 sm:text-2xl">Liquidity Pool</h1>
                <p className="text-xs text-white/35">Deposit tokens and earn yield from borrower interest</p>
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

          {!LOAN_POOL_DEPLOYED && (
            <div className="mb-6 rounded-xl border border-[#fbbf24]/15 bg-[#fbbf24]/[0.05] px-4 py-4">
              <p className="text-sm font-medium text-[#fbbf24]/80 mb-1">LoanPool Contract Not Yet Deployed</p>
              <p className="text-xs text-[#fbbf24]/50">
                Deploy the LoanPool contract with stellar CLI, then update <code className="font-mono">LOAN_POOL_ADDRESS</code> in <code className="font-mono">hooks/loan_pool.ts</code> to activate this dashboard.
              </p>
            </div>
          )}

          {/* Pool overview cards */}
          <div className="mb-4 grid grid-cols-2 gap-3 animate-fade-in-up sm:grid-cols-4 sm:gap-4">
            {[
              {
                label: "Total Deposits",
                value: poolStats ? stroopsToDisplay(poolStats.total_deposits) : "—",
                color: "text-[#34d399]",
              },
              {
                label: "Available",
                value: poolStats ? stroopsToDisplay(poolStats.available_liquidity) : "—",
                color: "text-[#4fc3f7]",
              },
              {
                label: "Est. APY",
                value: `${estimatedApy}%`,
                color: "text-[#fbbf24]",
              },
              {
                label: "Utilization",
                value: `${utilization}%`,
                color: utilization > 80 ? "text-[#f87171]" : "text-white/90",
              },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <div className={cn("text-xl font-bold font-mono", s.color)}>{s.value}</div>
                <div className="mt-1 text-[10px] text-white/25 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Utilization bar */}
          {poolStats && (
            <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-white/40">Pool Utilization</span>
                <span className="font-mono text-white/60">{utilization}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    utilization > 80 ? "bg-[#f87171]" : utilization > 60 ? "bg-[#fbbf24]" : "bg-[#34d399]"
                  )}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Your position */}
          {walletAddress && lpShares > BigInt(0) && (
            <AnimatedCard className="mb-4 p-5 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-white/70">Your Position</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <div className="font-mono text-lg font-bold text-[#34d399]">{stroopsToDisplay(lpShares)}</div>
                  <div className="text-[10px] text-white/25 mt-1">LP Shares</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <div className="font-mono text-lg font-bold text-white/90">{stroopsToDisplay(shareValue)}</div>
                  <div className="text-[10px] text-white/25 mt-1">Est. Value</div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Deposit / Withdraw form */}
          <AnimatedCard className="p-5 sm:p-6 animate-fade-in-up-delayed">
            {/* Tabs */}
            <div className="mb-5 flex border-b border-white/[0.06]">
              {(["deposit", "withdraw"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-5 py-3 text-sm font-medium capitalize transition-all",
                    activeTab === tab ? "text-white/90" : "text-white/35 hover:text-white/55"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#34d399]" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "deposit" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                    Amount to Deposit (tokens)
                  </label>
                  <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#34d399]/30">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-white/25">You receive LP shares proportional to your deposit</p>
                </div>

                {walletAddress ? (
                  <ShimmerButton
                    onClick={handleDeposit}
                    disabled={isDepositing || !depositAmount || !LOAN_POOL_DEPLOYED}
                    shimmerColor="#34d399"
                    className="w-full"
                  >
                    {isDepositing ? <><SpinnerIcon /> Depositing...</> : !LOAN_POOL_DEPLOYED ? "Contract Not Deployed" : "Deposit"}
                  </ShimmerButton>
                ) : (
                  <ShimmerButton onClick={handleConnect} disabled={isConnecting} shimmerColor="#34d399" className="w-full">
                    {isConnecting ? <><SpinnerIcon /> Connecting...</> : "Connect Wallet to Deposit"}
                  </ShimmerButton>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/30">
                    Shares to Burn
                  </label>
                  <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#34d399]/30">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={withdrawShares}
                      onChange={(e) => setWithdrawShares(e.target.value)}
                      placeholder={`Max: ${stroopsToDisplay(lpShares)} shares`}
                      className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-white/25">Burn your LP shares to receive proportional token value</p>
                </div>

                {walletAddress ? (
                  <ShimmerButton
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawShares || lpShares === BigInt(0) || !LOAN_POOL_DEPLOYED}
                    shimmerColor="#34d399"
                    className="w-full"
                  >
                    {isWithdrawing ? <><SpinnerIcon /> Withdrawing...</> : !LOAN_POOL_DEPLOYED ? "Contract Not Deployed" : "Withdraw"}
                  </ShimmerButton>
                ) : (
                  <ShimmerButton onClick={handleConnect} disabled={isConnecting} shimmerColor="#34d399" className="w-full">
                    {isConnecting ? <><SpinnerIcon /> Connecting...</> : "Connect Wallet"}
                  </ShimmerButton>
                )}
              </div>
            )}
          </AnimatedCard>

          {/* How yield works */}
          <div className="mt-4 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-xs text-white/30 leading-relaxed">
            <strong className="text-white/50">Yield mechanics: </strong>
            When borrowers repay, interest accrues to <code className="font-mono">total_deposits</code>.
            Your LP shares represent a pro-rata claim on the pool. As more interest accrues, the same number
            of shares is worth more tokens — automatic compounding without rebase mechanics.
          </div>
        </div>
      </main>
    </div>
  );
}
