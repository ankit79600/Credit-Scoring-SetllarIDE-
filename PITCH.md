# Credit Scoring System — Pitch Deck

**Decentralized Credit Scoring on Stellar Soroban**
Built by Ankit Patel · [Live Demo](https://my-credit-scoring-1.vercel.app)

---

## Slide 1 — Problem Statement

### The Credit System Is Broken

**1.7 billion people worldwide are "credit invisible"** — no formal credit history, no access to loans, no financial safety net.

Traditional credit bureaus (Equifax, Experian, TransUnion) have three core problems:

| Problem | Impact |
|---|---|
| **Centralized control** | Single point of failure; Equifax breach exposed 147M records |
| **Opaque algorithms** | Consumers can't see or dispute the scoring logic |
| **Geographic exclusion** | Non-US residents, DeFi natives, and unbanked populations are ignored |
| **Permissioned access** | Only banks and institutions can read scores — not individuals or smart contracts |

> **DeFi lends billions with zero credit checks** — because there's no trust layer. Liquidations and over-collateralization are the only safeguards.

---

## Slide 2 — Solution

### Permissionless, On-Chain Credit Scoring

A **smart contract on Stellar Soroban** that lets anyone rate any wallet address (0–1000), with scores stored immutably on-chain and averaged across independent evaluators.

```
Anyone can submit → Scores average on-chain → 3+ evaluators = "Trusted" score
```

**What makes it different:**

- **No admin, no gatekeeper** — fully permissionless
- **Anti-gaming built in** — scores only become trusted with 3+ independent evaluators
- **Public and auditable** — every score is on-chain, verifiable by anyone
- **Composable** — any DeFi protocol can call `get_average_score_if_threshold()` on-chain
- **~5s finality, <$0.01 per transaction** — Stellar's speed makes real-time scoring viable

---

## Slide 3 — Market Opportunity

### The DeFi Credit Gap

| Metric | Value |
|---|---|
| DeFi Total Value Locked | ~$100 billion |
| Over-collateralization waste | ~$50 billion locked as unnecessary collateral |
| Potential market unlocked by credit scoring | **$20–50 billion** |
| Addressable unbanked population | 1.7 billion people |
| Stellar network active accounts | 8+ million |

**Adjacent markets:**
- Micro-lending in emerging markets (Southeast Asia, Africa, Latin America)
- On-chain identity and reputation systems
- Institutional DeFi with regulatory compliance requirements
- Cross-border credit portability

---

## Slide 4 — Architecture

### How It Works

```
┌─────────────────────────────────────────────────────┐
│                   Browser / dApp                     │
│  Next.js 16 + React 19 + Freighter Wallet           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (Soroban RPC)
                       ▼
┌─────────────────────────────────────────────────────┐
│        soroban-testnet.stellar.org (RPC Node)        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│         Smart Contract (Rust / WASM)                 │
│                                                      │
│  submit_score(user, score, evaluator)  ← Write       │
│  get_scores(user) → Vec<ScoreEntry>    ← Read        │
│  get_average_score(user) → u32         ← Read        │
│  get_average_score_if_threshold(...)   ← Read        │
│  get_evaluator_count(user) → u32       ← Read        │
│  remove_score(user, evaluator)         ← Write       │
│  has_evaluator(user, evaluator) → bool ← Read        │
└─────────────────────────────────────────────────────┘
```

**Security model:**
- `evaluator.require_auth()` — only the wallet signing the tx is recorded as evaluator
- Score updates are idempotent — same evaluator can revise their rating
- TTL extension: data persists 30–90 days, re-extended on interaction

---

## Slide 5 — Product Screenshots

### Live Application at [my-credit-scoring-1.vercel.app](https://my-credit-scoring-1.vercel.app)

**Key UI Features:**
- **Lookup Tab** — query any Stellar address, see all evaluators, avg score, score position bar, rating breakdown, JSON export
- **Submit Tab** — visual score slider (0–1000) with real-time rating label, Freighter wallet signing
- **History Tab** — full evaluator list with timestamps, summary stats (avg/min/max)
- **Onboarding Modal** — 5-step guided setup (Freighter → connect → fund → score → community)
- **Feedback System** — floating 1–5 star feedback form, tracked in PostHog
- **Request Evaluation** — shareable link that pre-fills the Submit tab with your address

**Analytics & Monitoring:**
- PostHog: page views, wallet events, contract interactions, onboarding steps
- Sentry: client + server error tracking, session replay on errors

---

## Slide 6 — Growth Strategy

### How We Reach 50 → 500 → 5000 Users

**Phase 1 — Testnet Bootstrap (Done)**
- 55 unique testnet wallets created and funded programmatically
- 50 on-chain score submissions across 5 target users
- 10+ user feedback responses collected
- PostHog analytics live, tracking real user behavior

**Phase 2 — Community Growth (Next 30 days)**
- Share in Stellar Developer Discord and Soroban forums
- "Rate a friend" campaign — invite link generates pre-filled submit URLs
- Leaderboard of most-evaluated addresses
- Twitter/X thread showing the anti-gaming threshold mechanism

**Phase 3 — Protocol Integration (60–90 days)**
- Pitch to Stellar lending protocols as a credit oracle
- Submit to Stellar Community Fund for grant funding
- Open source evaluator staking module
- SEO landing pages for "Stellar credit score" and "on-chain reputation"

---

## Slide 7 — Demo Walkthrough

### User Flow (recorded at [loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e](https://www.loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e))

1. **First visit** → 5-step onboarding modal appears
2. **Install Freighter** → link to extension store
3. **Connect wallet** → Freighter permission popup
4. **Fund with Friendbot** → testnet XLM obtained for free
5. **Submit a score** → pick address + slider → sign in Freighter → on-chain in ~5s
6. **Look up a score** → see evaluators, avg, bar chart, export JSON
7. **Share** → copy URL or "Request Evaluation" link
8. **Feedback** → floating button, 1–5 stars, optional comment

**Real transaction example:**
- Contract: `CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR`
- [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR)

---

## Slide 8 — Technical Standards

### Development Quality

| Metric | Status |
|---|---|
| Meaningful commits | 25+ (conventional commits: feat/fix/docs/refactor) |
| Smart contract tests | 8 unit tests, all passing |
| TypeScript | Strict mode, no `any` |
| Mobile responsive | ✅ Tested on 375px viewport |
| Error monitoring | Sentry (client + server + edge) |
| Analytics | PostHog (8 custom events) |
| Accessibility | Keyboard navigation between tabs (ArrowLeft/ArrowRight) |
| SEO | OpenGraph + Twitter Card metadata |
| Documentation | README.md, CONTRIBUTING.md, PITCH.md |

**Smart contract test coverage:**
- `test_submit_and_get_score` — basic write + read
- `test_empty_scores` — empty state returns 0
- `test_update_score_same_evaluator` — idempotent updates
- `test_multiple_evaluators_same_user` — averaging across evaluators
- `test_threshold_met` / `test_threshold_not_met` — 3-evaluator rule
- `test_timestamp_recorded` — ledger timestamp stored
- `test_single_evaluator_score` — edge case

---

## Slide 9 — Future Roadmap

### Building Toward the DeFi Credit Layer

```
Q3 2026  →  Score badge widget + evaluator staking
Q4 2026  →  DeFi lending protocol integration (score-gated collateral)
Q1 2027  →  Multi-chain support (EVM bridge)
Q2 2027  →  ZK-proof of credit score (privacy-preserving)
Q3 2027  →  DAO governance for threshold parameters
```

**Revenue model:**
- Protocol fee: 0.1% of loans unlocked by credit scores
- Premium API: institutional access to aggregated score data
- Evaluator staking: earn yield for accurate, long-term evaluations
- White-label: license the scoring contract to other DeFi protocols

---

## Slide 10 — Contact & Links

| | |
|---|---|
| **Builder** | Ankit Patel |
| **Email** | ankitpatel79600@gmail.com |
| **GitHub** | [github.com/ankit7960](https://github.com/ankit7960) |
| **LinkedIn** | [linkedin.com/in/ankitpatel79600](https://www.linkedin.com/in/ankitpatel79600) |
| **Live App** | [my-credit-scoring-1.vercel.app](https://my-credit-scoring-1.vercel.app) |
| **Contract** | `CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR` |
| **Demo Video** | [loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e](https://www.loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e) |
| **Feedback Form** | [forms.gle/6hdSkpKgnYBqzp7J6](https://forms.gle/6hdSkpKgnYBqzp7J6) |

---

*Built with Stellar Soroban · Next.js 16 · Rust · PostHog · Sentry*
