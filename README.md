<div align="center">

# 🧬 CureCoders — Pharmaceutical Intelligence Platform

### AI-Powered Multi-Agent Research for Drug Discovery, Competitive Intelligence & Market Analysis

[![Live Demo](https://img.shields.io/badge/Live-Demo-22c55e?style=for-the-badge&logo=vercel)](https://orchids-curecoders.vercel.app/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)
[![Built with TanStack](https://img.shields.io/badge/TanStack-Start-FF4154?style=for-the-badge&logo=react)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-blueviolet?style=for-the-badge)](./CONTRIBUTING.md)

**🌐 Live App:** [orchids-curecoders.vercel.app](https://orchids-curecoders.vercel.app/)

</div>

---

## 📋 Quick Navigation

| Section | Description |
|---|---|
| [🎯 Problem & Solution](#-the-problem-we-solve) | Why CureCoders exists |
| [✨ Features](#-features) | What you can do |
| [🏗️ Architecture](#️-architecture) | 7 AI agents under the hood |
| [🛠️ Tech Stack](#️-tech-stack) | Technologies used |
| [🚀 Getting Started](#-getting-started) | Run it yourself |
| [🔌 Mock APIs & Data](#-mock-apis--data-sources) | Where insights come from |
| [📄 Reports](#-reports--outputs) | PDF / Excel / PPT exports |
| [🔒 Security](#-security) | How we protect data |
| [🗺️ Roadmap](#️-roadmap) | What's coming next |

---

## 🎯 The Problem We Solve

```
┌─────────────────────────────────────────────────────────────────┐
│           💊 PHARMA STRATEGY TEAMS' DAILY STRUGGLES             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ❌ Market sizing takes weeks   →  Manual spreadsheet hell    │
│   ❌ Competitor data scattered   →  10+ paid databases         │
│   ❌ Patent cliffs unclear       →  Static IP reports          │
│   ❌ Clinical trial overload     →  Hard to filter signal      │
│   ❌ Pipelines move daily        →  Reports stale on arrival   │
│   ❌ Internal docs siloed        →  No unified search          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────────┐
│              ✅ CURECODERS DELIVERS IN MINUTES                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🤖 7 Specialized AI Agents  →  Orchestrated research         │
│   📊 Live Market Sizing       →  CAGR, share, forecasts        │
│   ⚖️  Patent Cliff Tracker    →  Expiry timelines              │
│   🧪 Clinical Trial Filter    →  Phase, geo, sponsor           │
│   🏭 Pipeline Visualizer      →  Side-by-side competitors      │
│   📁 Internal Doc Ingest      →  PDF / Word / Excel / PPT      │
│   📄 One-Click Reports        →  PDF, Excel, 5-slide PPT       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🧠 Multi-Agent AI Workspace

| Feature | Description |
|---|---|
| 💬 **Master Agent Workspace** | Enter a research query and deploy autonomous agents |
| 🤖 **7 Specialized Agents** | Market, Competitor, Patent, Clinical, Pipeline, Doc-Intel, Reporter |
| 📁 **Internal Doc Upload** | PDF, Word, Excel, PowerPoint, Text — RAG over your data |
| ⚡ **Real-time Streaming** | Watch agents work; results render as they arrive |
| 💡 **30+ Instant Queries** | One-click examples for common pharma questions |

### 📊 Intelligence & Reporting

| Feature | Description |
|---|---|
| 📈 **Market Size & Trends** | CAGR, segmentation, geo splits |
| 🆚 **Competitor Comparison** | Share-of-voice, revenue, R&D spend |
| ⚖️ **Patent Expiry Map** | Cliffs over the next 1 / 3 / 5 / 10 years |
| 🧪 **Clinical Trial Filters** | Phase, status, sponsor, geography, indication |
| 🚀 **Pipeline Visualization** | Molecule-by-molecule competitor pipelines |
| 📄 **Export Anywhere** | PDF reports, Excel models, 5-slide PPT decks |

### 🔌 Data Sources (Mock APIs)

Connectors for FDA, ClinicalTrials.gov, USPTO, EMA, PubMed, EvaluatePharma-style endpoints — see [/apis](https://orchids-curecoders.vercel.app/apis).

---

## 🏗️ Architecture

```
                    ┌────────────────────────┐
                    │   Master Agent (LLM)   │
                    │  Plans · Routes · QA   │
                    └───────────┬────────────┘
                                │
   ┌────────┬────────┬──────────┼──────────┬────────┬────────┐
   ▼        ▼        ▼          ▼          ▼        ▼        ▼
┌──────┐┌──────┐┌────────┐┌────────┐┌─────────┐┌──────┐┌─────────┐
│Market││Compet││ Patent ││Clinical││ Pipeline││ Doc  ││Reporter │
│Agent ││ Agent││  Agent ││ Trials ││  Agent  ││Intel ││  Agent  │
└──┬───┘└──┬───┘└───┬────┘└───┬────┘└────┬────┘└──┬───┘└────┬────┘
   │       │        │         │          │        │         │
   └───────┴────────┴─────────┼──────────┴────────┴─────────┘
                              ▼
                    ┌────────────────────┐
                    │  Unified Insight   │
                    │  Layer (UI + PDF/  │
                    │  Excel/PPT export) │
                    └────────────────────┘
```

Frontend: **TanStack Start (React 19 + Vite 7)** · Edge runtime: **Cloudflare Workers** · Styling: **Tailwind v4 + shadcn/ui**

See the live diagram at [/architecture](https://orchids-curecoders.vercel.app/architecture).

---

## 🛠️ Tech Stack

<div align="center">

**Frontend**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TanStack](https://img.shields.io/badge/TanStack_Start-1.x-FF4154?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000)

**Infrastructure**

![Vercel](https://img.shields.io/badge/Vercel-Hosting-000000?logo=vercel)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack-Query-FF4154?logo=react)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1)

</div>

---

## 🚀 Getting Started

### ⚡ Quick Start (2 minutes)

```bash
# Clone the repository
git clone https://github.com/Samrudh2006/orchids-curecoders.git

# Navigate to project
cd orchids-curecoders

# Install dependencies
npm install

# Start the dev server
npm run dev
```

🎉 Open **http://localhost:3000** in your browser.

### 📦 Production Build

```bash
npm run build      # bundles for Cloudflare Workers
npm run preview    # preview the production build
```

---

## 🔌 Mock APIs & Data Sources

| Source | Purpose | Endpoint |
|---|---|---|
| 🏛️ **FDA Drugs@FDA** | Approved drugs, labels | `/api/mock/fda` |
| 🧪 **ClinicalTrials.gov** | Trial phase, status, sponsor | `/api/mock/trials` |
| ⚖️ **USPTO** | Patent filings & expiry | `/api/mock/patents` |
| 📚 **PubMed** | Literature signals | `/api/mock/pubmed` |
| 📈 **Market (Evaluate-style)** | Sizing, share, forecasts | `/api/mock/market` |
| 💊 **EMA** | EU approvals & pipelines | `/api/mock/ema` |

Browse the interactive catalog at [/apis](https://orchids-curecoders.vercel.app/apis).

---

## 📄 Reports & Outputs

| Format | Use case | Where |
|---|---|---|
| 📄 **PDF** | Executive briefings | [/reports](https://orchids-curecoders.vercel.app/reports) |
| 📊 **Excel** | Models & raw tables | [/reports](https://orchids-curecoders.vercel.app/reports) |
| 🎬 **5-Slide PPT** | Product journey deck | [/journey](https://orchids-curecoders.vercel.app/journey) |
| 📊 **Sample Outputs** | Live demos | [/samples](https://orchids-curecoders.vercel.app/samples) |

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| 🔐 **Transport** | HTTPS enforced on all routes |
| 🛡️ **Input Validation** | Zod schemas on every server function |
| 🔑 **Secrets** | Environment-only; never bundled |
| 📁 **Uploads** | Type/size validated; sandboxed parsing |
| 🚫 **No PII Persistence** | Demo mode does not store user uploads |

See [SECURITY.md](./SECURITY.md) for responsible-disclosure details.

---

## 🗺️ Roadmap

| Status | Feature |
|---|---|
| ✅ | Master Agent Workspace |
| ✅ | 7 specialized agents (mock) |
| ✅ | Document upload & ingest UI |
| ✅ | PDF / Excel / PPT export demos |
| ✅ | 30+ instant query catalog |
| 🔜 | Live LLM provider integration |
| 🔜 | Persistent project workspaces |
| 🔜 | Real FDA / ClinicalTrials.gov connectors |
| 🔜 | Team collaboration & comments |
| 🔜 | Citation graph & source provenance |
| 🔜 | Custom agent builder (no-code) |

---

## ⭐ Support This Project

If CureCoders saves you time, **drop a ⭐** — it helps other researchers discover the project and motivates continued development.

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

```
🍴 Fork  →  🌿 Branch  →  ✏️ Code  →  🧪 Test  →  💾 Commit  →  🔄 PR
```

---

## 📜 Code of Conduct

Read our [Code of Conduct](./CODE_OF_CONDUCT.md). We're committed to a welcoming, harassment-free community.

---

## 📄 License

© 2025 **Samrudh**. All Rights Reserved. See [LICENSE](./LICENSE).

This project is made publicly visible for **demonstration and portfolio purposes only**. Unauthorized copying, modification, or distribution is prohibited.

---

<div align="center">

**Built with ❤️ for pharmaceutical researchers worldwide 🧬**

[🌐 Live Demo](https://orchids-curecoders.vercel.app/) · [🐛 Report Bug](https://github.com/Samrudh2006/orchids-curecoders/issues) · [💡 Request Feature](https://github.com/Samrudh2006/orchids-curecoders/issues)

</div>

