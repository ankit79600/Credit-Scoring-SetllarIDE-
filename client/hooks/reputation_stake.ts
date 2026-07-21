"use client";

import {
  Contract,
  TransactionBuilder,
  rpc,
  scValToNative,
  xdr,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { NETWORK_PASSPHRASE, RPC_URL, toScValAddress } from "./contract";
import { REPUTATION_STAKE_ADDRESS } from "./loan_pool";

const server = new rpc.Server(RPC_URL);

function toI128ScVal(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: "i128" });
}

async function callStakeContract(
  method: string,
  params: xdr.ScVal[],
  caller: string,
  sign = true
) {
  const contract = new Contract(REPUTATION_STAKE_ADDRESS);
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

  if (getResult.status === "FAILED") throw new Error("Transaction failed on-chain");

  return getResult;
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface StakeInfo {
  evaluator: string;
  borrower: string;
  amount: bigint;
  is_slashed: boolean;
  reward_claimed: boolean;
}

// ── Reads ─────────────────────────────────────────────────────────────────

export async function getStake(
  evaluator: string,
  borrower: string
): Promise<StakeInfo | null> {
  try {
    return (await callStakeContract(
      "get_stake",
      [toScValAddress(evaluator), toScValAddress(borrower)],
      evaluator,
      false
    )) as StakeInfo | null;
  } catch {
    return null;
  }
}

export async function getTotalStaked(evaluator: string): Promise<bigint> {
  try {
    const result = await callStakeContract(
      "get_total_staked",
      [toScValAddress(evaluator)],
      evaluator,
      false
    );
    return BigInt(result as string | number);
  } catch {
    return BigInt(0);
  }
}

export async function getRewardsEarned(evaluator: string): Promise<bigint> {
  try {
    const result = await callStakeContract(
      "get_rewards_earned",
      [toScValAddress(evaluator)],
      evaluator,
      false
    );
    return BigInt(result as string | number);
  } catch {
    return BigInt(0);
  }
}

export async function getSlashPool(caller: string): Promise<bigint> {
  try {
    const result = await callStakeContract("get_slash_pool", [], caller, false);
    return BigInt(result as string | number);
  } catch {
    return BigInt(0);
  }
}

// ── Writes ────────────────────────────────────────────────────────────────

export async function stakeForBorrower(
  evaluator: string,
  borrower: string,
  amount: bigint
) {
  return callStakeContract(
    "stake",
    [toScValAddress(evaluator), toScValAddress(borrower), toI128ScVal(amount)],
    evaluator,
    true
  );
}

export async function claimReward(evaluator: string, borrower: string) {
  return callStakeContract(
    "claim_reward",
    [toScValAddress(evaluator), toScValAddress(borrower)],
    evaluator,
    true
  );
}

export async function slashStake(caller: string, evaluator: string, borrower: string) {
  return callStakeContract(
    "slash",
    [toScValAddress(evaluator), toScValAddress(borrower)],
    caller,
    true
  );
}
