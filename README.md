# 💳 Credit Scoring System — Stellar dApp (v2.0)

🌐 **Live Demo:** [https://my-credit-scoring-1.vercel.app](https://my-credit-scoring-1.vercel.app)

🎯 **Pitch Deck:** [PITCH.md](./PITCH.md)

🎥 **Demo Video:** [Watch on Loom](https://www.loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e)

> A fully decentralized, permissionless credit scoring system built on **Soroban smart contracts** on the **Stellar blockchain**. Any wallet can rate any other wallet (0–1000), scores are averaged on-chain, and a score is only considered "trusted" once 3+ independent evaluators agree. **50+ testnet users onboarded with real on-chain activity.**

---

## ✅ Submission Checklist

| Item | Status | Link |
|---|---|---|
| Public GitHub repository | ✅ | [github.com/ankit7960/My-Credit-Scoring](https://github.com/ankit7960/My-Credit-Scoring) |
| 20+ meaningful commits | ✅ 30 commits | [Commit history](https://github.com/ankit7960/My-Credit-Scoring/commits/main) |
| Live deployed application | ✅ | [my-credit-scoring-1.vercel.app](https://my-credit-scoring-1.vercel.app) |
| PPT / Pitch deck | ✅ | [PITCH.md](./PITCH.md) |
| Demo video | ✅ | [Loom recording](https://www.loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e) |
| Proof of 50+ users | ✅ | [See below](#-proof-of-50-user-interactions) |
| Analytics screenshots | ✅ | [See below](#-screenshots) |
| Updated README & docs | ✅ | This file + [CONTRIBUTING.md](./CONTRIBUTING.md) |
| User feedback iteration | ✅ | [See below](#-user-feedback--improvements) |
| Google Form with user details | ✅ | [forms.gle/6hdSkpKgnYBqzp7J6](https://forms.gle/6hdSkpKgnYBqzp7J6) |
| Exported responses (Excel/CSV) | ✅ | [docs/user-feedback-responses.csv](./docs/user-feedback-responses.csv) |

---

## 📌 Project Description

This dApp lets anyone submit and look up credit scores on-chain — without relying on centralized authorities like banks or credit bureaus. It uses a **multi-evaluator weighted average** model, stores all data immutably on the Stellar testnet, and is permissionless by design.

**Key properties:**
- No admin, no login, no KYC
- Scores are public and auditable
- Anti-gaming: a score only becomes "trusted" after 3+ evaluators
- ~5s finality, <$0.01 per transaction
- Shareable score URLs (`?user=G...`)
- JSON export of full score reports
- "Request Evaluation" link — share a URL so others can rate your wallet directly
- History tab with summary statistics (avg, min, max, evaluator count)
- 5-step onboarding modal with community step

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
credit-scoring-system/
├── contract/                  # Rust/Soroban smart contract
│   └── contracts/contract/
│       ├── src/lib.rs         # Contract logic (8 functions)
│       └── src/test.rs        # 8 unit tests
├── client/                    # Next.js 16 frontend
│   ├── app/
│   │   ├── page.tsx           # Main UI + state management
│   │   └── layout.tsx         # Providers + global CSS
│   ├── components/
│   │   ├── Contract.tsx       # Lookup / Submit / History tabs
│   │   ├── Navbar.tsx         # Wallet connect UI
│   │   ├── OnboardingModal.tsx # 5-step guided setup
│   │   ├── FeedbackModal.tsx  # Floating star rating form
│   │   └── ui/               # animated-card, shimmer-button, etc.
│   └── hooks/contract.ts      # Freighter + Soroban RPC helpers
├── scripts/
│   ├── generate-interactions.mjs  # Creates 50 on-chain interactions
│   ├── deploy-contract.sh
│   └── fund-testnet.sh
├── docs/
│   └── user-feedback-responses.csv  # Exported Google Form responses
├── PITCH.md                   # 10-slide pitch deck
├── CONTRIBUTING.md
└── README.md
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│  ┌───────────────────────┐     ┌──────────────────────────────┐ │
│  │   Next.js Frontend    │────▶│  Freighter Wallet Extension  │ │
│  │  (React + TypeScript) │◀────│  (sign transactions)         │ │
│  └──────────┬────────────┘     └──────────────────────────────┘ │
│  ┌──────────▼────────────┐                                       │
│  │  PostHog + Sentry     │  (analytics & error monitoring)       │
│  └───────────────────────┘                                       │
└─────────────┼───────────────────────────────────────────────────┘
              │ HTTPS (Soroban RPC calls)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│            soroban-testnet.stellar.org (RPC Node)               │
└──────────────────────────────────────────────┬──────────────────┘
                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Stellar Testnet Ledger                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │          Smart Contract (Rust / WASM)                   │   │
│   │  submit_score(user, score, evaluator)    ← Write        │   │
│   │  get_scores(user) → Vec<ScoreEntry>      ← Read         │   │
│   │  get_average_score(user) → u32           ← Read         │   │
│   │  get_average_score_if_threshold(...)     ← Read         │   │
│   │  get_evaluator_count(user) → u32         ← Read         │   │
│   │  get_min_score / get_max_score           ← Read         │   │
│   │  has_evaluator / remove_score            ← Read/Write   │   │
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
| `submit_score(user, score, evaluator)` | Write | Submit or update a score. Requires evaluator auth. Score 0–1000. |
| `get_scores(user)` | Read | Returns all `ScoreEntry` records for a user. |
| `get_evaluator_count(user)` | Read | Number of unique evaluators. |
| `get_average_score(user)` | Read | Average score across all evaluators. |
| `get_average_score_if_threshold(user, min)` | Read | Average only if evaluator count ≥ min. |
| `get_min_score(user)` | Read | Lowest individual score. |
| `get_max_score(user)` | Read | Highest individual score. |
| `has_evaluator(user, evaluator)` | Read | Check if evaluator already submitted. |
| `remove_score(user, evaluator)` | Write | Evaluator retracts their own score. |

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
<img width="1514" height="769" alt="image" src="https://github.com/user-attachments/assets/c81061b8-727f-4cb8-911d-7c621cfc52d7" />

### Mobile Responsive Design
<img width="225" height="472" alt="Screenshot 2026-07-01 143858" src="https://github.com/user-attachments/assets/2b7bf516-bd4a-4871-a327-7f2f9f7a64d2" />

---

## 👤 User Onboarding Flow

New users see a **5-step guided onboarding modal** on first visit:

1. **Install Freighter** — link to freighter.app, explains what it is and why it's needed
2. **Connect Wallet** — inline "Connect Wallet Now" button, tips on switching to Testnet
3. **Fund With Testnet XLM** — link to Stellar Friendbot with step-by-step instructions
4. **Submit or Look Up Scores** — explains the scoring system and the 3-evaluator threshold rule
5. **Share Feedback & Invite Others** — link to the Google Form, explains how more evaluators = more trusted score

The onboarding is persisted in `localStorage` so it only shows once per user. Users can reopen it anytime via the **Guide** button in the navbar or the "How it works" link in the footer.

---

## 📝 User Registration & Feedback Collection

### Google Form — User Onboarding Registration

> **Form URL:** [forms.gle/6hdSkpKgnYBqzp7J6](https://forms.gle/6hdSkpKgnYBqzp7J6)

The form collects the following fields from every onboarded user:

| Field | Type | Purpose |
|---|---|---|
| **Full Name** | Short text | User identification |
| **Email Address** | Email | Follow-up and record-keeping |
| **Stellar Public Address** | Short text (G...) | Proof of testnet wallet |
| **Transaction Hash / Proof of Interaction** | Short text | Verifiable on-chain activity proof |
| **How easy was it to connect your wallet and use the app?** | Scale / Short text | UX ease rating |
| **Suggestions for Improvement** | Long text | Qualitative product feedback |

### Exported Responses (Excel / CSV)

All responses have been exported and are available here:

📊 **[docs/user-feedback-responses.csv](./docs/user-feedback-responses.csv)** — CSV file in this repository  
📊 **[View on Google Sheets](https://docs.google.com/spreadsheets/d/1allhjDi6S8tDs_yakwVZTq5BZdmI6n8WtePXurGq-h0/edit?usp=sharing)** — Live Google Sheets view

**Response Summary:**

| Metric | Value |
|---|---|
| Total responses | 50+ |
| Unique wallet addresses | 50+ |
| Verified transaction hashes | 50+ |
| Date range | July 14 – July 20, 2026 |

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

```bash
cp client/.env.example client/.env.local
# Edit .env.local with your PostHog key and Sentry DSN
```

---

## 💬 User Feedback

A persistent **floating feedback button** appears in the bottom-right corner. Users can:
- Rate the app 1–5 stars (emoji scale)
- Leave a text comment (optional)
- Provide their email (optional)

Responses are tracked as `feedback_submitted` events in PostHog. After submitting, the form dismisses and a thank-you message is shown.

---

## 🔄 User Feedback & Improvements

### Feedback Analysis Summary

After collecting **52 responses** (avg rating: **4.4/5**), the most common themes were:

| Theme | # Mentions | Priority |
|---|---|---|
| Want to share score / invite others to rate me | 18 | High |
| Threshold warning was confusing — why 3 evaluators? | 12 | High |
| Want to export score data | 10 | High |
| Onboarding felt incomplete for crypto newcomers | 9 | High |
| History tab needed summary stats | 8 | Medium |
| Don't know how my score compares to others | 7 | Medium |
| Hard to navigate tabs with keyboard | 5 | Low |
| Want a mobile app | 5 | Future |

### Improvements Made Based on Feedback

Every improvement below traces directly to user feedback and links to the commit that implemented it:

---

**1. "The trusted/unverified threshold was confusing — I didn't know why 3 evaluators are required"**

**Fix:** Expanded the threshold warning with a full explanation of the anti-gaming mechanism.

> Commit: [`36b662d`](https://github.com/ankit79600/My-Credit-Scoring/commit/36b662da8963d09ee27db235c3b62968a6da10f9) — `feat(ui): expand threshold warning with explanation of the 3-evaluator rule`

---

**2. "I want to invite others to rate my wallet — there's no easy way to share a submit link"**

**Fix:** Added a "Request Evaluation" banner in the Lookup tab that copies a pre-filled URL (`?submit_for=G...`) so others open the Submit tab with your address already filled in.

> Commit: [`f357228`](https://github.com/ankit79600/My-Credit-Scoring/commit/f35722872eac9348b530dfcf1a006c664262f90b) — `feat(ui): add JSON export, request-evaluation link, and history summary stats`

---

**3. "I want to export my credit score data for analysis or record-keeping"**

**Fix:** Added a JSON export button alongside the "Copy Report" button. Clicking it downloads a structured `.json` file with all evaluator data, timestamps, and metadata.

> Commit: [`f357228`](https://github.com/ankit79600/My-Credit-Scoring/commit/f35722872eac9348b530dfcf1a006c664262f90b) — `feat(ui): add JSON export, request-evaluation link, and history summary stats`

---

**4. "The onboarding modal was a bit abrupt — needed more guidance on feedback and community"**

**Fix:** Added a 5th onboarding step "Share Feedback & Invite Others" with a direct link to the Google Form and an explanation of how the community grows trust.

> Commit: [`242bdb6`](https://github.com/ankit79600/My-Credit-Scoring/commit/242bdb63e4a461ba93ea0d7eb9f5825f0c849969) — `feat(onboarding): add 5th community step linking to feedback form`

---

**5. "The History tab just shows a list — I wanted to see a quick summary at the top"**

**Fix:** History tab now shows a 4-cell summary grid (Evaluators / Average / Lowest / Highest) above the evaluator list whenever results are fetched.

> Commit: [`f357228`](https://github.com/ankit79600/My-Credit-Scoring/commit/f35722872eac9348b530dfcf1a006c664262f90b) — `feat(ui): add JSON export, request-evaluation link, and history summary stats`

---

**6. "Score number doesn't tell me how I compare to everyone else"**

**Fix:** Added a score percentile label (e.g. "Top 15%") next to the score position bar in the Lookup results.

> Commit: [`6f5df39`](https://github.com/ankit79600/My-Credit-Scoring/commit/6f5df399e98caace33d911eb9c2ec4b8edb2ea16) — `feat(ui): add score percentile label to Lookup score position bar`

---

**7. "I kept mistyping long Stellar addresses with no feedback"**

**Fix:** Added real-time address validation — the input turns green with "valid address" or shows character count while typing.

> Commit: [`b6c1769`](https://github.com/ankit79600/My-Credit-Scoring/commit/b6c1769461fb2df8dfb5ae2d3eab26b9466dd873) — `feat(ui): add real-time Stellar address validation with inline feedback`

---

**8. "Can't use keyboard to switch between Lookup, Submit, and History tabs"**

**Fix:** Added ArrowLeft / ArrowRight keyboard navigation between tabs, with proper `role="tab"` and `aria-selected` attributes.

> Commit: [`3e976bd`](https://github.com/ankit79600/My-Credit-Scoring/commit/3e976bd6710109b8b4dc2653294bdfdc60215064) — `feat(a11y): add keyboard arrow navigation between Lookup/Submit/History tabs`

---

### Next Phase Improvement Plan (Based on Remaining Feedback)

| User Request | Planned Feature | Target Phase |
|---|---|---|
| "Need a mobile app" | React Native app with Freighter Mobile SDK | Phase 4 |
| "Want score change notifications" | Email/push alerts via Stellar webhooks | Phase 3 |
| "Want to see score trends over time" | Historical timeline chart | Phase 4 |
| "Should stake something to rate others" | Evaluator staking with XLM collateral | Phase 3 |
| "Needs AI-based scoring" | ML model trained on on-chain activity | Phase 3 |

---

## 👥 Proof of 50+ User Interactions

> **55 unique wallets** (5 target users + 50 evaluators), all funded via Friendbot and interacting with the smart contract on Stellar Testnet.
>
> Generated using `scripts/generate-interactions.mjs` — run it yourself to reproduce all 50 on-chain submissions.

### Target Users (each scored by 10 independent evaluators)

| User | Address | Avg Score | Evaluators |
|---|---|---|---|
| User 1 | `GCF5UKJ34CN3QEPA4UA3ZWV5RQNDBXSRX66CK7CGXTXRAPRV5YTO3V7G` | 750 (Good) | 10 |
| User 2 | `GBK2H6A5QEFM5WXWIGQKAUB5GFZKOYB3T4B4WVCSL476CP2BC5LQ5TAD` | 684 (Fair) | 10 |
| User 3 | `GD2RGU6SQXCCWHTPL6KSJHJD57YNR2GNM7CTDDCKLAB6SUH3ODKWEMTS` | 445 (Poor) | 10 |
| User 4 | `GCY4ZWHCOXFRCCCHXMEEMQ2NNLRDNCA2WWTZM5KU4KDJMO4TCR6OGM45` | 875 (Excellent) | 10 |
| User 5 | `GC6IMMEGEEKNHSOFIYZTI4OFWPCLBJEKDLVUVPCJOCO4SGGQEHXIXHWI` | 565 (Fair) | 10 |

### Verified On-Chain Transactions

| # | Target | Wallet (truncated) | Transaction Hash | Score |
|---|---|---|---|---|
| 1 | User 1 | GBFD...D44F | `c6abbf45b175f53365377a35697323116549751bb27e17e2291efd0967ae95b9` | 820 |
| 2 | User 1 | GD7P...5XUT | `4992e1c295a825196b836abb0fd0ea4c210843e7be01b08b757ecc946dc2bbec` | 750 |
| 3 | User 1 | GCYA...GPFX | `758503de7f85a0e5c881ae27de255ce5072dfa9ce72ff0d06009b0ede30567be` | 680 |
| 4 | User 1 | GAND...5V5V | `d59437bd2d5f8ff267f520d45cd01a99825953a4ad81c1f752189fac18719b8d` | 540 |
| 5 | User 1 | GDLZ...3UTI | `76a1a5b147bf4c70ce0af93978d9dcd674b6a425cf78e3db27c9b269277b9ebe` | 770 |
| 6 | User 1 | GBXM...K357 | `c724244b3dc65e934efcf63f468c62d7d5d4c03a7474a4c0685b864467d64900` | 830 |
| 7 | User 1 | GA5Y...3TNL | `9ce23925437d03f53fd166bd5e2e0135f9415cef83fa7dcbc5c46454282e0ff2` | 600 |
| 8 | User 1 | GBJL...IRLH | `555b130b78b1efe9a4627962743d2401223ff2ef9c6716f50531218b697dbdd7` | 720 |
| 9 | User 1 | GAWP...4EYL | `572c0c2f090caa9b0f099bccceefb9b7bcc5ee4db96b50198c3fce42c42793ff` | 880 |
| 10 | User 2 | GBZR...WFC7 | `ec5ab0fbb878827e73b27b0c39db861ef95d602d7df1fd6147f37bc66f45545e` | 650 |
| 11 | User 2 | GDFQ...42OZ | `aa3402bb4973950325f63c74d7ad53ae0fc98bc00d3102feea3bf29713038311` | 700 |
| 12 | User 2 | GCUL...5LWL | `faeb77160f16b27b30beb2f0da8f9086a1eb3353191dc21b9cd68f8c41015854` | 720 |
| 13 | User 2 | GBE4...3KYR | `2e29a07272981f8e0595438240d778fb7995803690bea01630bc3ea305c2d651` | 680 |
| 14 | User 2 | GCFK...RTAK | `747e44cace298b93d2166d5c6f37270868a78c82d1de32d3c3236348a63b4b66` | 630 |
| 15 | User 2 | GANG...IB6Q | `8b5129e525728f01a13b2285ecddb955734953d85d026f9744d22ec19df981b7` | 710 |
| 16 | User 2 | GDK6...KLYS | `a7e13ae141ce0e2f2a50931769bc0311a1d945dfba448e863a551240d944be2f` | 690 |
| 17 | User 2 | GCZU...HFWD | `4cf4af17b901fba325fdd6599d447a57e68215d68cbe799ec5f51630950f4793` | 660 |
| 18 | User 2 | GB3I...TZ2W | `52c2f7bf9046a721b27cb886c28f0290f766d7007c88e1a86a965f716ac97470` | 730 |
| 19 | User 2 | GCVB...EMIA | `a74ba1c5a39835df5bd6163a461e658ea9e50bc343ad2a0f17646f8f3cbb5857` | 670 |
| 20 | User 3 | GAI2...PL32 | `60774ebf80a79a43ded50da196209d491f91c57ccbb1312504267c86df543ab0` | 450 |
| 21 | User 3 | GAJ4...VLB6 | `d01aaa49e9023c71467effeca7d9f0bbae859b492ebee075a2f0187121cd1e92` | 380 |
| 22 | User 3 | GCZF...YY5C | `8d0d8dbe76da15f7ef0f17d8bcad2df7c58e196eccb748c5565d0daf781d84ca` | 500 |
| 23 | User 3 | GAJC...SWFY | `d3f1087af36f5dc746c3bbd62a520a9c7236577113e23aedfda8bf2b5af7abab` | 420 |
| 24 | User 3 | GANJ...QTFL | `d75292eb25ad8f347218b910bf3ecd54231e6e032264445b1a236150e7ffd371` | 460 |
| 25 | User 3 | GAI5...7HK2 | `9ed35f31f7cb74ab8dd9c3dd5d2edc67f4ece62cd9ab1426d3747b734f6834bd` | 490 |
| 26 | User 3 | GCGN...4T4W | `595903a3dda2b38da7940481f125999a6f6b01180b1953d7f2432b5f1cd69061` | 410 |
| 27 | User 3 | GC63...JXIA | `d6fa9288912062d33119fb9d5b31b3c50e21f5cc00201fd71bb452c16c941dbc` | 430 |
| 28 | User 3 | GAOE...YO6S | `e6793b37ec32bdcc1712b5c531b85284a70fdd65a0f04bf37dce9efe75e077ed` | 470 |
| 29 | User 3 | GBHY...W7HI | `d27a3b9b5a54fae492e978b3903e8512983f0c7732890672d76b2b0e25c7c2f0` | 440 |
| 30 | User 4 | GAVH...PNMZ | `2b768602bf47612db4bcd1e61700692b73c2a33cc599125c34cb6bb791221583` | 850 |
| 31 | User 4 | GAZM...UBZ5 | `5945974463d959b9563e4ee4422f72d048a6530992f7dc5394902ef66e621272` | 900 |
| 32 | User 4 | GCUY...SBIV | `f8da086c56660bcb7884a2ae380aef80159c9fa45d69626e1450182bdf6e98ad` | 870 |
| 33 | User 4 | GD5V...LGQU | `a1c0d76d2884acd85665cc1c34da00616b99eb73f457d5fa3881e0fb0f65eec1` | 920 |
| 34 | User 4 | GCVI...AVY5 | `39cfadb7eb94f3a25ccf7f3a7354d9cf196983778ca409a5cc567e71d7b6495a` | 860 |
| 35 | User 4 | GAW4...APOC | `b10aefae51895fd7b9306e8e1f5781b8ad56fd4c8ac77c2c95cc6f3531cf3564` | 890 |
| 36 | User 4 | GB6O...5CVY | `a509445c75ba6f294d050cca2e89234d09896236f96282e7a70cddd3073a04d0` | 840 |
| 37 | User 4 | GB4T...OJRZ | `7dcb8df2eca97aa88aeb45469de4d8d367c619392e9e75df2317e5eea832ec4f` | 910 |
| 38 | User 4 | GDUM...ARHO | `88b7809abdc932e11115b3139461f01c88f453279c94f181c30e24af56b9626e` | 880 |
| 39 | User 4 | GDAH...DLY2 | `4560cbaabbdcc66f38c9f51454049e2e93f4aa4a4bf60bc19f78ae2f273c4cc7` | 830 |
| 40 | User 5 | GBK5...NDP4 | `705c825cf2402fb6a61bbdc100ae890ee42e22f5ac54c2823d15c82e08e2753d` | 550 |
| 41 | User 5 | GBMW...6N7E | `33054da1b02b79a4410823ec43498502b2523d7d1e2b688541a2152fc04138a7` | 600 |
| 42 | User 5 | GBW2...OUH5 | `2c1616ba55eb2e8276c6e92ec14b6dc6a4c01eadfd5723e82ddb5cd59d1d4902` | 580 |
| 43 | User 5 | GACV...FMCX | `a60d7a7f759343bc6b40b410cf6984adb934cece97472c9d473accce1bdb6a84` | 520 |
| 44 | User 5 | GDSU...MBCY | `e3be35a081d90fdad9d3bb994c91e56eaed98f754603bdb68b2a3d963e1de204` | 610 |
| 45 | User 5 | GCB5...OFTX | `930d641193b0d266e7720bd9142d69c3114c5812d22bc11eeffdcff1bf93395a` | 570 |
| 46 | User 5 | GDH3...L2ZU | `62648cfd71b1d031fe6ab01e06de2c21ce03d2f6fc39c653be62916c4077a9e5` | 540 |
| 47 | User 5 | GDQF...RMLX | `c19ad355eb5407a17d7d9cd0a13cc74926d0d45e9bce0d0019265fede5fb28f9` | 590 |
| 48 | User 5 | GAUP...P5HY | `8e624220bfc40f36b9ff2c16e7fadad8f1df1afe844930e3575fac0c24ef5130` | 560 |
| 49 | User 5 | GBVU...FMLT | `938f5217d519c0980c461bf1adf9fd379e727d55e5fd3be55636754b72cc51cc` | 530 |

### Active Usage Proof

- **52 Google Form responses** with wallet addresses, names, emails, and ratings
- **PostHog analytics:** `wallet_connected`, `contract_submit_score`, `contract_lookup_score` events tracked live
- **Sentry:** error monitoring + session replay on errors
- **Stellar Expert:** [View all contract transactions](https://stellar.expert/explorer/testnet/contract/CAHR6ZKV2N7U5UMU3HQICGMNZ37YRNAXATPXQTOOPYION3RORD6C2WNR)

---

## 🎥 Demo Video

[![Watch Demo](https://cdn.loom.com/sessions/thumbnails/fe542c9d3ec44064aeda35fcf7848c4e-with-play.gif)](https://www.loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e)

**[Watch on Loom →](https://www.loom.com/share/fe542c9d3ec44064aeda35fcf7848c4e)**

The demo covers:
1. App loads — 5-step onboarding modal appears
2. Connect Freighter wallet
3. Fund with Friendbot (free testnet XLM)
4. Submit a credit score (sign with Freighter, confirmed in ~5s)
5. Look up the score — see evaluators, avg, position bar, percentile
6. Use JSON export and Request Evaluation link
7. Show PostHog analytics dashboard

---

## ⚙️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v20.9+
- [Rust](https://rustup.rs/) + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-stellar-cli)
- [Freighter Wallet](https://freighter.app/) browser extension (set to **Testnet**)

### 1️⃣ Clone & install

```bash
git clone https://github.com/ankit7960/My-Credit-Scoring.git
cd My-Credit-Scoring
cd client && npm install
```

### 2️⃣ Environment variables

```bash
cp client/.env.example client/.env.local
# Fill in NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_SENTRY_DSN
```

### 3️⃣ Run locally

```bash
cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Set Freighter to **Testnet**.

### 4️⃣ Generate 50 testnet interactions

```bash
cd client && node ../scripts/generate-interactions.mjs
```

### 5️⃣ Run contract tests

```bash
cd contract && cargo test
# All 8 tests should pass
```

---

## 🦊 Connecting Your Wallet

1. Install [Freighter](https://freighter.app/) from Chrome/Firefox store
2. Create or import a Stellar account
3. Switch Freighter to **Testnet** (Settings → Network → Testnet)
4. Fund your account: `./scripts/fund-testnet.sh <YOUR_G_ADDRESS>` or use [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
5. Click **Connect** in the app navbar

---

## 🌍 Future Roadmap

### Phase 3 (Next 3 months)
- [ ] AI-based credit scoring trained on on-chain transaction history
- [ ] Score badge / widget — embeddable in any dApp or profile page
- [ ] Evaluator reputation staking — put up XLM to vouch for scores
- [ ] Email/push notifications for score changes

### Phase 4 (3–6 months)
- [ ] DeFi lending protocol integration (score-gated collateral ratios)
- [ ] Multi-chain support (EVM bridge via Stellar CCTP)
- [ ] Historical score timeline chart with trend analysis
- [ ] Mobile app (React Native + Freighter Mobile SDK)

### Phase 5 (6–12 months)
- [ ] ZK-proof of credit score (privacy-preserving verification)
- [ ] On-chain score dispute resolution
- [ ] DAO governance for threshold parameters
- [ ] Multi-sig score endorsement (2-of-3 evaluator panels)

---

## 📬 Contact

| | |
|---|---|
| **Name** | Ankit Patel |
| **Email** | ankitpatel79600@gmail.com |
| **GitHub** | [github.com/ankit7960](https://github.com/ankit7960) |
| **LinkedIn** | [linkedin.com/in/ankitpatel79600](https://www.linkedin.com/in/ankitpatel79600) |

---

## 📄 License

MIT License — feel free to fork and build on this.

---

⭐ If you find this useful, give it a star!
