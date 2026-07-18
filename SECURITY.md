# 🔒 Security Policy

## 📌 Supported Versions

| Version | Supported |
|---------|-----------|
| `1.x` (latest) | ✅ Yes |
| `< 1.0` | ❌ No |

The **CureCoders** demo at [orchids-curecoders-beige.vercel.app](https://orchids-curecoders-beige.vercel.app/) always tracks the latest `main` build. Older deployments are not patched.

---

## 🚨 Reporting a Vulnerability

We take security seriously at **CureCoders — Pharmaceutical Intelligence Platform**. If you discover a security vulnerability, please report it **responsibly**.

> [!CAUTION]
> **DO NOT open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is ready puts our infrastructure and users at risk.

### 🔒 How to Report

Please report via one of the following methods:

1. **Preferred:** Open a [private security advisory on GitHub](https://github.com/Samrudh2006/orchids-curecoders/security/advisories/new).
2. **Direct Contact:** Email the Project Lead, **D VENKATA SATYA SAMRUDH**, directly at **[samrudhdwivedula12@gmail.com](mailto:samrudhdwivedula12@gmail.com)**.

### 📝 What to Include in Your Report

- **Description** of the vulnerability.
- **Steps to reproduce** the issue.
- **Impact assessment** — what could an attacker do?
- **Affected URLs / routes / endpoints**.
- **Suggested fix** (if you have one).
- Any **proof-of-concept** code or screenshots (please redact PII).

### ⏳ Response Timeline

| Action | Timeline |
|---|---|
| Acknowledgment | Within **48 hours** |
| Initial assessment | Within **5 business days** |
| Fix deployed (critical) | Within **14 business days** |
| Public disclosure | After fix is deployed and verified |

---

## 🛡️ Security Measures in Place

### Application Layer
- ✅ **Server Functions** with strict input validation.
- ✅ **Zod Schemas** enforced on every server-function input.
- ✅ **Type-safe Routing** (no string-injection routes).
- ✅ **No Client-side Secrets** — all sensitive keys live strictly in environment variables.
- ✅ **Sandboxed File Parsing** for uploaded documents (PDF / Word / Excel / PPT).

### AI & Agent Safety
- ✅ Each AI agent runs with a **system prompt forbidding medical advice**.
- ✅ Agent outputs are explicitly **labeled as AI-generated** in the UI.
- ✅ **Source citations are required** for factual outputs.
- ✅ Prompts are **stored server-side**, isolated from the client.
- ✅ Mock data is clearly marked as **illustrative, not clinical evidence**.

### Data Handling
- ✅ The Demo mode **does not persist** user-uploaded documents.
- ✅ No Personally Identifiable Information (PII) is collected, stored, or transmitted to third parties (beyond the configured AI provider).
- ✅ No real patient data, EHR data, or confidential pharma data is shipped with the repository.

### Infrastructure
- ✅ **HTTPS is enforced** on all deployed routes.
- ✅ Stateless server design — no long-lived stateful server processes where appropriate.
- ✅ Immutable asset caching with versioned URLs.
- ✅ **Dependabot** alerts are enabled for continuous dependency vulnerability monitoring.

---

## 🎯 Scope

**The following are IN SCOPE for vulnerability reports:**
- Authentication / authorization bypass.
- Server-function input validation bypass.
- Server-side request forgery (SSRF) via mock API or upload handlers.
- Cross-site scripting (XSS) — stored or reflected.
- Cross-site request forgery (CSRF) on state-changing endpoints.
- Sensitive data exposure (API keys, tokens, environment variables).
- Prompt injection that successfully exfiltrates server-side prompts or secrets.
- Path traversal or arbitrary file read via the upload pipeline.
- Dependency vulnerabilities with a viable exploit path in this application.

**The following are OUT OF SCOPE:**
- Social engineering of maintainers or users.
- Denial of Service (DoS) attacks.
- Issues requiring physical access to a user's device.
- Issues within third-party services (FDA, USPTO, OpenAI, Vercel, Cloudflare, etc.).
- Self-XSS or issues requiring an attacker-controlled browser extension.
- Best-practice findings without a demonstrable security impact.
- Reports that "the AI said something wrong" (model output quality is a product issue, not a security issue, unless it leaks server-side secrets).

---

## 🤝 Safe Harbor

We fully support coordinated disclosure. If you make a good-faith effort to:
- Avoid privacy violations and disruption to others.
- Only interact with accounts you own or have explicit permission to test.
- Stop testing once a vulnerability is identified and report it promptly.
- Not publicly disclose the issue before a fix is deployed.

… then we will **not pursue legal action** against you for your research.

---

## 🏆 Recognition (Hall of Fame)

We gratefully acknowledge security researchers who report vulnerabilities responsibly. With your permission, we will list your name or handle below.

_No reports yet. Be the first!_

---
*Thank you for helping keep CureCoders and its users safe. 🔒🧬*
