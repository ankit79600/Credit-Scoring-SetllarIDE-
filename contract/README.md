# Credit Scoring Smart Contract

A Soroban smart contract on the Stellar network that enables decentralized, multi-evaluator credit scoring.

## Project Structure

```text
contract/
├── contracts/
│   └── contract/
│       ├── src/
│       │   ├── lib.rs      # Contract implementation
│       │   └── test.rs     # Unit tests
│       ├── Cargo.toml
│       └── Makefile
├── Cargo.toml              # Workspace root
├── Cargo.lock
└── README.md
```

## Contract Functions

| Function | Description |
|---|---|
| `submit_score(user, score, evaluator)` | Submit a credit score (0–1000) for a user. Requires evaluator auth. Updates existing score if same evaluator re-submits. |
| `get_scores(user)` | Returns all `ScoreEntry` records (evaluator, score, timestamp) for a user. |
| `get_evaluator_count(user)` | Returns the number of unique evaluators who have scored a user. |
| `get_average_score(user)` | Returns the average score across all evaluators. Returns 0 if no scores. |
| `get_average_score_if_threshold(user, min_evaluators)` | Returns the average only if at least `min_evaluators` have submitted. Guards against single-evaluator manipulation. |

## Build & Test

```bash
# Build WASM
make build

# Run unit tests
make test

# Or directly:
cargo build --target wasm32v1-none --release
cargo test
```

## Deploy to Testnet

```bash
# Fund a testnet account first
stellar keys generate --global deployer --network testnet --fund

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/contract.wasm \
  --network testnet \
  --source deployer
```

Or use the convenience script from the repo root:

```bash
./scripts/deploy-contract.sh --secret <YOUR_SECRET_KEY>
```

## Network

- **Network:** Stellar Testnet
- **RPC:** https://soroban-testnet.stellar.org
- **Horizon:** https://horizon-testnet.stellar.org
