# Credit Scoring System — Soroban Smart Contract

A decentralized credit scoring system built on the **Stellar blockchain** using **Soroban smart contracts**. Multiple evaluators can submit credit scores for any user address, and anyone can query the aggregated results on-chain.

---

## How It Works

- Any address can act as an **evaluator** and submit a credit score (0–1000) for any user
- If an evaluator submits again for the same user, their previous score is **updated** (not duplicated)
- Scores from all evaluators are stored on-chain and can be queried at any time
- The contract computes the **average score** across all evaluators

---

## Contract Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `submit_score` | `user: Address, score: u32, evaluator: Address` | — | Submit or update a score. Requires evaluator auth. Score must be 0–1000. |
| `get_scores` | `user: Address` | `Vec<ScoreEntry>` | Return all evaluator score entries for a user |
| `get_evaluator_count` | `user: Address` | `u32` | Return the number of unique evaluators for a user |
| `get_average_score` | `user: Address` | `u32` | Return the average score across all evaluators |

**ScoreEntry** fields: `evaluator: Address`, `score: u32`

---

## Deployed Contract

- **Network:** Stellar Testnet
- **Contract ID:** `CA4NRFVJXYWSNCQ6K7A44C7UJ3HKFDPEPKQ4M6HJYVBZQKX54KWBZGIH`
- **RPC URL:** `https://soroban-testnet.stellar.org`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Stellar (Soroban) |
| Smart Contract | Rust (`soroban-sdk = "25"`) |
| Frontend | Next.js (TypeScript) |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Stellar SDK | `@stellar/stellar-sdk` |

---

## Project Structure

```
├── contract/
│   ├── Cargo.toml                         # Workspace manifest
│   └── contracts/contract/
│       ├── Cargo.toml                     # Contract package
│       ├── Makefile                       # Build & test targets
│       └── src/
│           ├── lib.rs                     # Contract implementation
│           └── test.rs                    # Unit tests (5 tests)
├── client/
│   ├── hooks/
│   │   └── contract.ts                    # Stellar SDK integration layer
│   ├── components/
│   │   ├── Contract.tsx                   # Main UI component
│   │   └── Navbar.tsx
│   └── app/
│       └── page.tsx                       # Entry page
└── README.md
```

---

## Local Setup

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli)
- [Node.js](https://nodejs.org/) (v18+)
- [Freighter browser extension](https://freighter.app/)

### 1. Clone the repository

```bash
git clone https://github.com/ankit79600/Credit-Scoring-SetllarIDE-
cd Credit-Scoring-SetllarIDE-
```

### 2. Build and test the smart contract

```bash
cd contract
make test      # builds the contract and runs all unit tests
make build     # build only (outputs .wasm to target/wasm32v1-none/release/)
```

### 3. Deploy to testnet

```bash
stellar contract deploy \
  --wasm contract/contracts/contract/target/wasm32v1-none/release/contract.wasm \
  --network testnet
```

Copy the returned contract ID into `client/hooks/contract.ts` → `CONTRACT_ADDRESS`.

### 4. Run the frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your Freighter wallet set to **Testnet**.

---

## Frontend Preview

<img width="1904" height="848" alt="Credit Scoring UI" src="https://github.com/user-attachments/assets/0b301c5c-4a0d-4c05-a7c6-812a01654740" />

---

## Deployment Proof

<img width="1482" height="586" alt="Contract deployment" src="https://github.com/user-attachments/assets/0116c524-7ce6-4e28-bd18-ab1ffc99fc42" />

---

## Score Rating Scale

| Range | Rating |
|-------|--------|
| 800 – 1000 | Excellent |
| 700 – 799 | Good |
| 600 – 699 | Fair |
| 400 – 599 | Poor |
| 0 – 399 | Very Poor |

---

## Author

**Ankit Patel**
- Email: ankitpatel79600@gmail.com
- GitHub: [ankit79600](https://github.com/ankit79600)
- LinkedIn: [ankitpatel79600](https://www.linkedin.com/in/ankitpatel79600)

---

## License

MIT
