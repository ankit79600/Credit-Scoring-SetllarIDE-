"use client";

import {
  Address,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  scValToNative,
  nativeToScVal,
  xdr,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import {
  NETWORK_PASSPHRASE,
  RPC_URL,
  callContract as baseCallContract,
  readContract,
  toScValAddress,
  toScValI128,
} from "./contract";

// ── Addresses ─────────────────────────────────────────────────────────────
// Replace with actual deployed contract addresses after `stellar contract deploy`

export const LOAN_POOL_ADDRESS =
  "PLACEHOLDER_LOAN_POOL_CONTRACT_ADDRESS";

export const REPUTATION_STAKE_ADDRESS =
  "PLACEHOLDER_REPUTATION_STAKE_CONTRACT_ADDRESS";

const server = new rpc.Server(RPC_URL);

// ── Helpers ───────────────────────────────────────────────────────────────

function toI128ScVal(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: "i128" });
}

async function callLoanPool(
  method: string,
  params: xdr.ScVal[],
  caller: string,
  sign = true
) {
  const contract = new Contract(LOAN_POOL_ADDRESS);
  const account = await server.getAccount(caller);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulated)) {
    const errResp = simulated as rpc.Api.SimulateTransactionErrorResponse;
    throw new Error(`Simulation failed: ${errResp.error}`);
  }

  if (!sign) {
    if (
      rpc.Api.isSimulationSuccess(simulated) &&
      (simulated as rpc.Api.SimulateTransactionSuccessResponse).result
    ) {
      return scValToNative(
        (simulated as rpc.Api.SimulateTransactionSuccessResponse).result!.retval
      );
    }
    return null;
  }

  const prepared = rpc.assembleTransaction(tx, simulated).build();
  const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const txToSubmit = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(txToSubmit);

  if (result.status === "ERROR") {
    throw new Error(`Transaction failed: ${result.status}`);
  }

  let getResult = await server.getTransaction(result.hash);
  while (getResult.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000));
    getResult = await server.getTransaction(result.hash);
  }

  if (getResult.status === "FAILED") {
    throw new Error("Transaction failed on-chain");
  }

  return getResult;
}

// ── Pool query helpers ────────────────────────────────────────────────────

export interface PoolStats {
  total_deposits: bigint;
  total_loans_outstanding: bigint;
  available_liquidity: bigint;
  total_interest_earned: bigint;
  total_shares: bigint;
}

export interface LoanInfo {
  borrower: string;
  amount: bigint;
  interest_amount: bigint;
  due_ledger: number;
  is_active: boolean;
  is_defaulted: boolean;
}

export async function getPoolStats(caller?: string): Promise<PoolStats | null> {
  try {
    const result = await callLoanPool("get_pool_stats", [], caller || new Address(LOAN_POOL_ADDRESS).toString(), false);
    return result as PoolStats;
  } catch {
    return null;
  }
}

export async function getLoan(
  borrower: string,
  caller?: string
): Promise<LoanInfo | null> {
  try {
    const result = await callLoanPool(
      "get_loan",
      [toScValAddress(borrower)],
      caller || borrower,
      false
    );
    return result as LoanInfo | null;
  } catch {
    return null;
  }
}

export async function getLpShares(
  depositor: string,
  caller?: string
): Promise<bigint> {
  try {
    const result = await callLoanPool(
      "get_lp_shares",
      [toScValAddress(depositor)],
      caller || depositor,
      false
    );
    return BigInt(result as string | number);
  } catch {
    return BigInt(0);
  }
}

export async function getMinCreditScore(caller?: string): Promise<number> {
  try {
    const result = await callLoanPool(
      "get_min_credit_score",
      [],
      caller || LOAN_POOL_ADDRESS,
      false
    );
    return result as number;
  } catch {
    return 600;
  }
}

export async function getMaxLoanAmount(caller?: string): Promise<bigint> {
  try {
    const result = await callLoanPool(
      "get_max_loan_amount",
      [],
      caller || LOAN_POOL_ADDRESS,
      false
    );
    return BigInt(result as string | number);
  } catch {
    return BigInt(0);
  }
}

export async function getInterestRateBps(caller?: string): Promise<number> {
  try {
    const result = await callLoanPool(
      "get_interest_rate_bps",
      [],
      caller || LOAN_POOL_ADDRESS,
      false
    );
    return result as number;
  } catch {
    return 1000;
  }
}

// ── Write operations ──────────────────────────────────────────────────────

export async function deposit(caller: string, amount: bigint) {
  return callLoanPool(
    "deposit",
    [toScValAddress(caller), toI128ScVal(amount)],
    caller,
    true
  );
}

export async function withdraw(caller: string, shares: bigint) {
  return callLoanPool(
    "withdraw",
    [toScValAddress(caller), toI128ScVal(shares)],
    caller,
    true
  );
}

export async function borrow(caller: string, amount: bigint) {
  return callLoanPool(
    "borrow",
    [toScValAddress(caller), toI128ScVal(amount)],
    caller,
    true
  );
}

export async function repay(caller: string) {
  return callLoanPool(
    "repay",
    [toScValAddress(caller)],
    caller,
    true
  );
}

export async function liquidate(caller: string, borrower: string) {
  return callLoanPool(
    "liquidate",
    [toScValAddress(borrower)],
    caller,
    true
  );
}

// ── Formatting helpers ────────────────────────────────────────────────────

/** Convert stroops (1e7) to a readable token amount string */
export function stroopsToDisplay(stroops: bigint, decimals = 7): string {
  const divisor = BigInt(10 ** decimals);
  const whole = stroops / divisor;
  const fraction = stroops % divisor;
  if (fraction === BigInt(0)) return whole.toString();
  return `${whole}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}
