# 💳 Credit Scoring System — Stellar dApp

🌐 **Live Demo:** [https://my-credit-scoring-1.vercel.app](https://my-credit-scoring-1.vercel.app)

> A fully decentralized, permissionless credit scoring system built on **Soroban smart contracts** on the **Stellar blockchain**. Any wallet can rate any other wallet (0–1000), scores are averaged on-chain, and a score is only considered "trusted" once 3+ independent evaluators agree.

---

## 📌 Project Description

This dApp lets anyone submit and look up credit scores on-chain — without relying on centralized authorities like banks or credit bureaus. It uses a **multi-evaluator weighted average** model, stores all data immutably on the Stellar testnet, and is permissionless by design.

**Key properties:**
- No admin, no login, no KYC
- Scores are public and auditable
- Anti-gaming: a score only becomes "trusted" after 3+ evaluators
- ~5s finality, <$0.01 per transaction
- Shareable score URLs (`?user=G...`)

---

## 🚀 Live Demo

| | |
|---|---|
| **Live URL** | [https://my-credit-scoring-1.vercel.app](https://my-credit-scoring-1.vercel.app) |
| **Network** | Stellar Testnet |
| **Contract Address** | `CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR` |
| **RPC Endpoint** | `https://soroban-testnet.stellar.org` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Stellar (Soroban) — Testnet |
| Smart Contract | Rust (`soroban-sdk`) |
| Frontend | Next.js 16 (Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4 (mobile responsive) |
| Wallet | Freighter (`@stellar/freighter-api` v6) |
| Stellar SDK | `@stellar/stellar-sdk` v14 |
| Analytics | PostHog (page views, wallet connects, contract interactions) |
| Error Monitoring | Sentry (error tracking, session replay) |
| Deployment | Vercel (frontend), Stellar Testnet (contract) |
| RPC | `https://soroban-testnet.stellar.org` |

---

## 📂 Project Structure

```
├── contract/
│   └── contracts/contract/
│       ├── src/
│       │   ├── lib.rs        # Contract logic (submit, get, average, threshold)
│       │   └── test.rs       # 8 unit tests
│       └── Cargo.toml
├── client/
│   ├── app/
│   │   ├── page.tsx          # Root page — wallet + onboarding + feedback state
│   │   └── layout.tsx        # PostHogProvider, Sentry, global CSS
│   ├── components/
│   │   ├── Navbar.tsx         # Wallet connect/disconnect, Guide button
│   │   ├── Contract.tsx       # 3-tab UI: Lookup / Submit / History
│   │   ├── OnboardingModal.tsx  # Step-by-step new user guide
│   │   ├── FeedbackModal.tsx    # Star rating + comment feedback form
│   │   ├── PostHogProvider.tsx  # Analytics provider + page view tracker
│   │   ├── ErrorBoundary.tsx    # Sentry-wired error boundary
│   │   └── ui/
│   │       ├── animated-card.tsx
│   │       ├── meteors.tsx
│   │       ├── spotlight.tsx
│   │       ├── shimmer-button.tsx
│   │       └── badge.tsx
│   ├── hooks/
│   │   └── contract.ts        # Freighter wallet + Soroban RPC integration
│   ├── lib/
│   │   ├── posthog.ts         # PostHog init + tracking helpers
│   │   └── utils.ts
│   ├── sentry.client.config.ts
│   ├── sentry.server.config.ts
│   ├── sentry.edge.config.ts
│   └── .env.example
├── scripts/
│   ├── deploy-contract.sh     # Build + deploy Soroban contract
│   ├── fund-testnet.sh        # Fund address via Friendbot
│   └── run-tests.sh           # Run contract unit tests
└── README.md
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│                                                                  │
│  ┌───────────────────────┐     ┌──────────────────────────────┐ │
│  │   Next.js Frontend    │────▶│  Freighter Wallet Extension  │ │
│  │  (React + TypeScript) │◀────│  (sign transactions)         │ │
│  └──────────┬────────────┘     └──────────────────────────────┘ │
│             │                                                    │
│  ┌──────────▼────────────┐                                       │
│  │  PostHog + Sentry     │  (analytics & error monitoring)       │
│  └───────────────────────┘                                       │
└─────────────┼────────────────────────────────────────────────────┘
              │ HTTPS (Soroban RPC calls)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│            soroban-testnet.stellar.org (RPC Node)               │
└────────────────────────────────────────────────────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Stellar Testnet Ledger                          │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │          Smart Contract (Rust / WASM)                   │   │
│   │  submit_score(user, score, evaluator)                   │   │
│   │  get_scores(user) → Vec<ScoreEntry>                     │   │
│   │  get_average_score(user) → u32                          │   │
│   │  get_average_score_if_threshold(user, min) → u32        │   │
│   │  get_evaluator_count(user) → u32                        │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Smart Contract — Deep Dive

### Data Model

```rust
pub struct ScoreEntry {
    pub evaluator: Address,   // who submitted the score
    pub score: u32,           // 0–1000
    pub timestamp: u64,       // ledger timestamp at submission
}
```

### Contract Methods

| Method | Type | Description |
|---|---|---|
| `submit_score(user, score, evaluator)` | Write | Submit or update a score. Requires evaluator auth. Score must be 0–1000. |
| `get_scores(user)` | Read | Returns all `ScoreEntry` records for a user. |
| `get_evaluator_count(user)` | Read | Number of unique evaluators who have rated the user. |
| `get_average_score(user)` | Read | Average score across all evaluators. |
| `get_average_score_if_threshold(user, min)` | Read | Average score only if evaluator count ≥ min. Returns 0 otherwise. |

### Score Rating Scale

| Range | Label |
|---|---|
| 800–1000 | Excellent |
| 700–799 | Good |
| 600–699 | Fair |
| 400–599 | Poor |
| 0–399 | Very Poor |

---

## 🔗 Deployed Smart Contract

| | |
|---|---|
| **Network** | Stellar Testnet |
| **Contract Address** | `CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR` |
| **RPC Endpoint** | `https://soroban-testnet.stellar.org` |
| **Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR) |

---

## 🖥️ Screenshots

### Product UI
<img width="1904" height="848" alt="Credit Scoring dApp UI" src="https://github.com/user-attachments/assets/0b301c5c-4a0d-4c05-a7c6-812a01654740" />

### Smart Contract Deployment
<img width="1482" height="586" alt="Contract Deployment Address" src="https://github.com/user-attachments/assets/0116c524-7ce6-4e28-bd18-ab1ffc99fc42" />

### Analytics & Monitoring
> PostHog dashboard screenshot — add yours after deploying and capturing real events at [app.posthog.com](https://app.posthog.com)

### Mobile Responsive Design
> The app uses Tailwind CSS responsive prefixes (`sm:`, `md:`) throughout — it's fully usable on mobile. Screenshot: visit the live URL on a phone or use Chrome DevTools mobile view.

---

## 👤 User Onboarding Flow

New users see a **4-step guided onboarding modal** on first visit:

1. **Install Freighter** — link to freighter.app, explains what it is
2. **Connect Wallet** — inline "Connect Wallet Now" button, tips on switching to Testnet
3. **Fund With Testnet XLM** — link to Stellar Friendbot, step-by-step instructions
4. **Submit or Look Up Scores** — explains the scoring system and threshold rule

The onboarding is persisted in `localStorage` so it only shows once. Users can reopen it via the **Guide** button in the navbar or the "How it works" link in the footer.

---

## 📊 Analytics & Monitoring

### PostHog Events Tracked

| Event | When |
|---|---|
| `$pageview` | Every page load / navigation |
| `wallet_connected` | When user connects Freighter |
| `wallet_disconnected` | When user disconnects |
| `contract_lookup_score` | When user looks up a credit score |
| `contract_submit_score` | When user submits a score on-chain |
| `contract_get_history` | When user fetches full history |
| `onboarding_step` | Each step of the onboarding flow |
| `feedback_submitted` | When user submits the feedback form |

### Sentry Integration

- Client-side error boundary catches React rendering errors
- Server and edge configs for full-stack coverage
- Session replay enabled on errors (`replaysOnErrorSampleRate: 1.0`)

### Setup

Copy `.env.example` to `.env.local` and fill in your PostHog key and Sentry DSN:

```bash
cp client/.env.example client/.env.local
# Edit .env.local with your keys
```

---

## 💬 User Feedback

A persistent **floating feedback button** appears in the bottom-right corner. Users can:
- Rate the app 1–5 stars (emoji scale)
- Leave a text comment (optional)
- Provide their email (optional)

Responses are tracked as `feedback_submitted` events in PostHog. After submitting, the form dismisses and a thank-you message is shown. The form only appears once per browser session (persisted in `localStorage`).

### Sample Feedback Summary

| Rating | Count | Common Themes |
|---|---|---|
| ⭐⭐⭐⭐⭐ Excellent | — | Fast, easy to use, clean UI |
| ⭐⭐⭐⭐ Great | — | Would love mobile app |
| ⭐⭐⭐ Good | — | Need more documentation |

> *Update with real feedback after collecting from users*

---

## ⚙️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v20.9+
- [Rust](https://rustup.rs/) + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-stellar-cli) (`stellar`)
- [Freighter Wallet](https://freighter.app/) browser extension (set to **Testnet**)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/ankit7960/credit-scoring-system.git
cd credit-scoring-system
```

### 2️⃣ Set up environment variables

```bash
cp client/.env.example client/.env.local
# Edit .env.local with your PostHog and Sentry keys
```

### 3️⃣ Run the frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4️⃣ (Optional) Deploy the contract

```bash
./scripts/deploy-contract.sh --secret <YOUR_SECRET_KEY>
```

Then update `CONTRACT_ADDRESS` in `client/hooks/contract.ts`.

### 5️⃣ Run contract tests

```bash
./scripts/run-tests.sh
# or: cd contract && cargo test
```

All 8 unit tests should pass.

---

## 🦊 Connecting Your Wallet

1. Install [Freighter](https://freighter.app/) from the Chrome/Firefox extension store
2. Create or import a Stellar account
3. Switch Freighter to **Testnet** (Settings → Network → Testnet)
4. Fund your testnet account:
   - Via script: `./scripts/fund-testnet.sh <YOUR_G...ADDRESS>`
   - Or visit: [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
5. Click **Connect** in the app navbar — Freighter will prompt for access

---

## 🎥 Demo Video

> Record a Loom video showing the full flow:
> 1. Open the app — onboarding modal appears
> 2. Connect Freighter wallet
> 3. Fund with Friendbot
> 4. Submit a credit score (sign with Freighter)
> 5. Look up the score
> 6. Show mobile view
> 7. Show PostHog dashboard with events
>
> **Loom Link:** _[Add your Loom URL here after recording]_

---

## 👥 Proof of 10+ User Interactions

> After sharing the live link and collecting wallet interactions, add transaction hashes here.
> You can find them on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet).

| # | Wallet (truncated) | Transaction Hash | Action |
|---|---|---|---|
| 1 | G...xxxx | — | submit_score |
| 2 | G...yyyy | — | lookup_score |
| … | … | … | … |

> *Update this table with real data from the Stellar testnet explorer*

---

## 🌍 Future Improvements

- AI-based credit scoring trained on on-chain activity
- Integration with DeFi lending protocols (gated by score threshold)
- Multi-chain support (EVM + Stellar bridge)
- Historical score timeline / charts
- Mobile app (React Native + Freighter mobile)
- Reputation staking — evaluators put up collateral
- Email/push notifications for score changes

---

## 📬 Contact

| | |
|---|---|
| **Name** | Ankit Patel |
| **Email** | ankitpatel79600@gmail.com |
| **GitHub** | [github.com/ankit7960](https://github.com/ankit79600) |
| **LinkedIn** | [linkedin.com/in/ankitpatel79600](https://www.linkedin.com/in/ankitpatel79600) |

---

## 📄 License

MIT License — feel free to fork and build on this.

---

⭐ If you find this useful, give it a star!
