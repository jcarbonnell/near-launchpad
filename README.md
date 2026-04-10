# NEAR Innovation Launchpad

> Autonomous business development & marketing automation for early-stage MVPs — powered by IronClaw, sovereign AI agent on NEAR Protocol.

🌐 **[near-launchpad.com](https://near-launchpad.com)**

---

## What It Does

Most founders build an MVP, ship it, and then spend weeks doing nothing because they don't know who to talk to or how to reach them. The Launchpad runs that BizDev actions for them, while they keep building.

Submit a GitHub repo. In 7 days, a sovereign AI agent contacts 200+ matched leads, logs every signal, and delivers a go/no-go verdict with full metrics — fully automated, running on NEAR.

---

## How It Works

### 1. Submit your repo
Paste your GitHub URL. The agent reads your README, extracts your Ideal Customer Profile, and embeds it as a 768-dimensional vector for semantic lead matching.

### 2. 200+ leads enrolled
Cosine similarity search across 177,370+ indexed contacts finds the people most likely to want your product. Your own contacts (CSV upload) get priority — people who already know you convert better.

### 3. Outreach runs automatically
Personalised emails go out daily. Every touch is logged. Inbound signals — replies, bookings, positive responses — are weighted and aggregated in real time.

### 4. Go/no-go verdict delivered
At campaign end you receive a traction report by email: reply rate, positive signals, bookings, and a clear recommendation.

| Verdict | Criteria |
|---|---|
| **GO** | reply_rate > 5% AND bookings ≥ 1 |
| **INCONCLUSIVE** | reply_rate > 2% OR positive_signals ≥ 2 |
| **NO-GO** | reply_rate < 2% AND bookings = 0 |

---

## Service Tiers

| Tier | Duration | Outreach | Price |
|---|---|---|---|
| **Curious** | 7 days | 1 ICP · 50 leads/day · email | $30 |
| **Confident** | 14 days | 3 ICPs A/B · 100 leads/day · email + X | $200 |
| **Determined** | Monthly | Continuous · unlimited · email + X + social | Contact us |

Payment in NEAR — direct transfer to `near-launchpad.near`, on-chain receipt provided.

---

## Features

**Semantic lead matching** — 177,370+ contacts embedded with `nomic-embed-text` (768 dims). ICP matching is a cosine similarity query, not keyword search. The right people, not just the right keywords.

**Multi-CSV import** — Upload LinkedIn connections, LinkedIn search exports, Google contacts, X followers. Each format auto-detected, normalized, deduplicated, and merged. Your contacts enrolled first.

**NEAR Wallet payment** — Connect with MyNearWallet, HERE Wallet, or Bitte Wallet. Pay in NEAR. Transaction hash linked to nearblocks.io for on-chain verification. No credit card, no subscription.

**X outreach** — Connect your X account via OAuth 2.0. The agent follows ICP-matched leads and sends DMs to mutual followers. Tokens stored encrypted on sovereign hardware.

**Email enrichment** — Hunter.io validates work emails before sending. Invalid addresses filtered out automatically. Deliverability rates stay high without you lifting a finger.

**Live campaign dashboard** — Track your campaign in real time: enrolled, contacted, replied, booked, reply rate. Updates every 30 seconds. Persists across browser sessions. Track multiple campaigns from one page.

**Traction report** — Go/no-go verdict with full signal breakdown emailed to you at campaign end. Objective signal, not gut feel.

**Sovereign infrastructure** — Everything runs on dedicated hardware (Raspberry Pi 5, 320GB). No cloud vendor can change pricing, deprecate an API, or read your data.

---

## Why NEAR

Payment settlement without a payment processor. No chargebacks, no lock-in, no monthly fees beyond the campaign cost. The Launchpad is itself registered on [market.near.ai](https://market.near.ai) — participating in the agentic economy it helps founders reach.

---

## Built With

- **Frontend**: Next.js 14 App Router · TypeScript · CSS Modules · Vercel
- **Backend**: [IronClaw v0.24](https://github.com/nearai/ironclaw) sovereign node · Raspberry Pi 5 · PostgreSQL 17 + pgvector
- **AI**: Claude Sonnet via NEAR AI Cloud · Ollama `nomic-embed-text` (local embeddings)
- **Outreach**: OutLayer TEE · near.email · X API v2
- **Enrichment**: Hunter.io · SearXNG (self-hosted)
- **Payments**: NEAR Wallet Selector · direct transfer to `near-launchpad.near`

---

## Changelog

| Version | Date | What shipped |
|---|---|---|
| v0.3 | 2026-04-10 | Live campaign dashboard · multi-campaign localStorage persistence |
| v0.2 | 2026-04-09 | NEAR Wallet Selector · real payment flow · 4-step onboarding UX |
| v0.1 | 2026-04-01 | Onboarding form · Cloudflare Tunnel · Pi webhook · first live intake |

---

## Contact

**Email**: [near-launchpad@near.email](mailto:near-launchpad@near.email)  
**NEAR**: `near-launchpad.near`  
**Built by**: [Julien Carbonnell](https://github.com/jcarbonnell) · CivicTech OU