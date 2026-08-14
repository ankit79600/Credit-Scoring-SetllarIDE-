# Contributing to Credit Scoring System

Thanks for your interest in contributing! This project is a decentralized credit scoring system built on Stellar Soroban.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.9+ |
| Rust | stable (see `rust-toolchain.toml`) |
| [Freighter](https://freighter.app/) | latest |
| Stellar CLI | 21+ |

## Local development

### Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3000`. Set Freighter to **Testnet**.

### Smart contract

```bash
cd contract/contracts/contract
cargo test                # run unit tests
make build                # compile to .wasm
```

## Project structure

```
client/         Next.js 16 frontend
  app/          Pages and layout
  components/   React components (Contract.tsx is the main UI)
  hooks/        contract.ts — Soroban RPC helpers
contract/       Rust Soroban smart contract
  src/lib.rs    Contract logic
  src/test.rs   Unit tests
```

## Making changes

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. For contract changes, add or update tests in `src/test.rs` and run `cargo test`
3. For frontend changes, verify locally with `npm run dev`
4. Open a pull request with a clear description of what changed and why

## Contract functions

| Function | Description |
|----------|-------------|
| `submit_score(user, score, evaluator)` | Submit or update a credit score |
| `get_scores(user)` | Return all score entries |
| `get_average_score(user)` | Average of all evaluator scores |
| `get_min_score(user)` | Lowest individual score |
| `get_max_score(user)` | Highest individual score |
| `get_evaluator_count(user)` | Number of unique evaluators |
| `get_average_score_if_threshold(user, min)` | Average only if threshold met |
| `has_evaluator(user, evaluator)` | Check if evaluator already submitted |
| `remove_score(user, evaluator)` | Evaluator retracts their own score |

## Code style

- TypeScript: no `any`, prefer `unknown` at catch sites
- Rust: `no_std`, standard Soroban patterns
- Commits: `type(scope): description` — e.g. `feat(ui): add X`, `fix(contract): Y`
