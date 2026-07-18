# 🤝 Contributing to CureCoders — Pharmaceutical Intelligence Platform

[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](https://github.com/Samrudh2006/orchids-curecoders/pulls)
[![First Timers Friendly](https://img.shields.io/badge/First%20Timers-Friendly-blueviolet.svg?style=for-the-badge)](https://www.firsttimersonly.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)](./LICENSE)

## 🎉 Welcome!

Thank you for your interest in contributing to **CureCoders**! Whether you're a developer, data scientist, life-sciences researcher, or pharma analyst — every thoughtful contribution helps make CureCoders better.

> [!NOTE]
> **What is this project?**  
> CureCoders is an AI-powered, multi-agent pharmaceutical intelligence platform. It turns natural-language research queries into structured insights — market sizing, competitor maps, patent cliffs, clinical-trial filters, and shareable PDF / Excel / PPT reports.
>
> 🌐 **Live demo:** [orchids-curecoders-beige.vercel.app](https://orchids-curecoders-beige.vercel.app/)

---

## 📋 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [🐛 Report a Bug](#-found-a-bug-report-it)
- [💡 Suggest a Feature](#-have-an-idea-suggest-it)
- [💻 Writing Code](#-writing-code)
- [📝 Commit Rules](#-commit-message-rules)
- [🎨 Code Style](#-code-style-guide)
- [🗄️ Mock Data Rules](#️-mock-data--api-rules)
- [🤖 AI Agent Rules](#-ai-agent--prompt-rules)
- [🔒 Security Rules](#-security-rules)
- [✅ PR Checklist](#-pull-request-checklist)

---

## 🚀 Getting Started

### 📦 What You Need

- 🟢 **Node.js** 18 or newer
- 📦 **npm** (or bun)
- 🔀 **Git**

### Step-by-Step Setup

```bash
# 1. Fork the repo on GitHub (click "Fork" top-right)

# 2. Clone YOUR fork
git clone https://github.com/<YOUR_USERNAME>/orchids-curecoders.git

# 3. Enter the project
cd orchids-curecoders

# 4. Install dependencies
npm install

# 5. Create your env file (if testing external APIs)
cp .env.example .env 2>/dev/null || true

# 6. Start the dev server
npm run dev
```

🎉 Open **http://localhost:3000** and start exploring.

---

## 🐛 Found a Bug? Report It!

1. Go to **[Issues → New Issue](https://github.com/Samrudh2006/orchids-curecoders/issues/new)**.
2. Describe what happened vs. what you expected.
3. Share browser, OS, and reproduction steps.
4. Add screenshots or short screen recordings 📸.

> [!TIP]
> Include the specific query you ran, the AI agent involved, and any console errors to help us debug faster!

---

## 💡 Have an Idea? Suggest It!

1. Go to **[Issues → New Issue](https://github.com/Samrudh2006/orchids-curecoders/issues/new)**.
2. Explain the feature and who benefits.
3. **Bonus:** Link to a real-world pharma workflow it improves 🧬.

---

## 💻 Writing Code

### The 6-Step Contribution Flow

```text
🍴 Fork  →  🌿 Branch  →  ✏️ Code  →  🧪 Test  →  💾 Commit  →  🔄 PR
```

```bash
# 1. Sync main
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes in your editor

# 4. Lint & build locally to ensure code quality
npm run lint
npm run build

# 5. Commit using Conventional Commits
git add .
git commit -m "feat: add patent cliff heatmap to market view"

# 6. Push to your fork and open a Pull Request
git push origin feature/your-feature-name
```

---

## 📝 Commit Message Rules

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**.

| Prefix       | When to Use          | Example                                        |
|--------------|----------------------|------------------------------------------------|
| `feat:`      | ✨ New feature        | `feat: add competitor share-of-voice chart`    |
| `fix:`       | 🐛 Bug fix           | `fix: PDF export drops the second page`        |
| `docs:`      | 📖 Documentation      | `docs: document the 7-agent architecture`      |
| `style:`     | 🎨 Formatting only    | `style: align query suggestion chips`          |
| `refactor:`  | ♻️ Code cleanup      | `refactor: extract agent runner hook`          |
| `test:`      | 🧪 Adding tests       | `test: cover patent expiry filter logic`       |
| `chore:`     | 🔧 Build / CI         | `chore: bump dependencies`                     |

---

## 🎨 Code Style Guide

- 📘 **Language:** TypeScript strict mode — no `any`.
- ⚛️ **Components:** React 19 functional components with hooks.
- 🧭 **Routing:** React Router DOM for client-side routing in `routes/`.
- 🎨 **Styling:** Tailwind CSS + semantic tokens from `src/styles.css`.
- 📁 **Naming:** PascalCase for components, camelCase for functions and variables.
- 📦 **Imports:** Use `@/` path aliases.
- 🚫 **Colors:** Avoid raw utility colors like `text-white` — rely on tokens like `text-foreground`.
- 🧩 **Modularity:** Keep components small, focused, and highly reusable.

---

## 🗄️ Mock Data & API Rules

CureCoders ships with **mock pharmaceutical data** for the demo. When adding or editing mock endpoints:

- ✅ **Validate** every payload with **Zod** to catch schema drift early.
- ✅ Keep mock data **clearly labeled** as illustrative to avoid being mistaken for real clinical evidence.
- ✅ **Cite** the public source format you mirror (FDA, USPTO, etc.).
- ✅ Keep response shapes **stable** across versions to avoid breaking downstream AI agents.
- ❌ **Never** include real patient data, PII, or confidential pharma info.
- ❌ **Never** claim mock outputs are clinically validated.

---

## 🤖 AI Agent & Prompt Rules

- ✅ Each agent must have a **single, well-scoped role**.
- ✅ Store prompts in **dedicated files**, rather than inline strings.
- ✅ Always include a **system instruction** that explicitly forbids giving professional medical advice.
- ✅ Require agents to **cite sources** when emitting factual claims.
- ❌ **Don't hardcode** model API keys (use server-side `.env` secrets).
- ❌ **Don't merge** prompts that produce unverifiable claims.

---

## 🔒 Security Rules

> [!IMPORTANT]
> **SECURITY IS A FIRST-CLASS PRIORITY**

- Use environment variables for all secrets.
- Validate all server-function inputs using Zod.
- Sandbox file parsing on uploads.
- Report vulnerabilities responsibly via [SECURITY.md](./SECURITY.md).

> [!CAUTION]
> **Found a security issue?** Do NOT disclose it publicly. Please read [SECURITY.md](./SECURITY.md) for our responsible disclosure policy.

---

## ✅ Pull Request Checklist

Before submitting your PR, ensure:
- [ ] My code strictly follows the project's code style.
- [ ] I tested my changes locally (`npm run dev`).
- [ ] Linter passes (`npm run lint`).
- [ ] Build passes (`npm run build`).
- [ ] No API keys, secrets, or real PII are hardcoded.
- [ ] New mock data is clearly labeled as illustrative.
- [ ] New AI agents include a safety system prompt.
- [ ] I updated documentation (README / inline comments) if behavior changed.
- [ ] Screenshots or GIFs are attached for any UI changes.

---

## ❓ Need Help?

Reach out to the Project Lead, **D VENKATA SATYA SAMRUDH**, or interact with the community:

| Channel | Link |
|---|---|
| 💬 **Discussions** | [GitHub Discussions](https://github.com/Samrudh2006/orchids-curecoders/discussions) |
| 🐛 **Bug Reports** | [Create Issue](https://github.com/Samrudh2006/orchids-curecoders/issues/new) |
| 📧 **Direct Contact** | [samrudhdwivedula12@gmail.com](mailto:samrudhdwivedula12@gmail.com) |

**Every contribution helps researchers move faster. Thank you! 🧬**
