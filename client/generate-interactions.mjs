/**
 * generate-interactions.mjs
 * Run from the client/ directory so it finds node_modules:
 *   cd client && node ../scripts/generate-interactions.mjs
 *
 * Creates 1 target user + 10 evaluator accounts, funds each via Friendbot,
 * submits submit_score() on-chain, and prints a README table.
 */

import {
  Keypair,
  Networks,
  TransactionBuilder,
  Contract,
  Address,
  nativeToScVal,
  rpc,
} from "@stellar/stellar-sdk";

const CONTRACT_ADDRESS =
  "CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";
const FRIENDBOT_URL = "https://friendbot.stellar.org";

const server = new rpc.Server(RPC_URL);

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fundAccount(publicKey) {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
  const text = await res.text();
  if (!res.ok && !text.includes("already")) {
    throw new Error(`Friendbot failed for ${publicKey.slice(0, 8)}: ${text.slice(0, 120)}`);
  }
  console.log(`  Funded ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`);
}

async function submitScore(evaluatorKeypair, userAddress, score) {
  const account = await server.getAccount(evaluatorKeypair.publicKey());
  const contract = new Contract(CONTRACT_ADDRESS);

  const tx = new TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "submit_score",
        new Address(userAddress).toScVal(),
        nativeToScVal(score, { type: "u32" }),
        new Address(evaluatorKeypair.publicKey()).toScVal()
      )
    )
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const prepared = rpc.assembleTransaction(tx, simulated).build();
  prepared.sign(evaluatorKeypair);

  const result = await server.sendTransaction(prepared);
  if (result.status === "ERROR") {
    throw new Error(`Submission error: ${JSON.stringify(result.errorResult)}`);
  }

  // Poll until confirmed
  let attempts = 0;
  let txResult = await server.getTransaction(result.hash);
  while (txResult.status === "NOT_FOUND" && attempts < 20) {
    await sleep(1500);
    txResult = await server.getTransaction(result.hash);
    attempts++;
  }

  if (txResult.status === "FAILED") throw new Error("Transaction failed on-chain");
  return result.hash;
}

async function main() {
  console.log("🚀 Generating 10 self-interactions on Stellar Testnet...\n");

  // One fixed target user (the account being scored by all 10 evaluators)
  const target = Keypair.random();
  console.log(`Target user: ${target.publicKey()}`);
  console.log("Funding target...");
  await fundAccount(target.publicKey());
  await sleep(3000); // wait for ledger to settle

  const scores = [820, 750, 680, 910, 540, 770, 830, 600, 720, 880];
  const rows = [];

  for (let i = 0; i < 10; i++) {
    const evaluator = Keypair.random();
    const score = scores[i];

    console.log(
      `\n[${i + 1}/10] Evaluator ${evaluator.publicKey().slice(0, 8)}... score=${score}`
    );

    console.log("  Funding via Friendbot...");
    await fundAccount(evaluator.publicKey());
    await sleep(3000); // account must exist on-chain before we can load it

    try {
      console.log("  Submitting score...");
      const txHash = await submitScore(evaluator, target.publicKey(), score);
      console.log(`  ✅ ${txHash}`);
      rows.push({
        n: i + 1,
        wallet: evaluator.publicKey().slice(0, 4) + "..." + evaluator.publicKey().slice(-4),
        hash: txHash,
        score,
      });
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
    }

    await sleep(1000);
  }

  console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Paste this into the README Proof of Interactions table:\n");
  console.log("| # | Wallet (truncated) | Transaction Hash | Action |");
  console.log("|---|---|---|---|");
  rows.forEach((r) =>
    console.log(`| ${r.n} | ${r.wallet} | \`${r.hash}\` | submit_score (${r.score}) |`)
  );
  console.log("\nTarget user (scored by all 10 evaluators):");
  console.log(`  ${target.publicKey()}`);
  console.log(`\nVerify on Stellar Expert:`);
  console.log(
    `  https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESS}`
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
