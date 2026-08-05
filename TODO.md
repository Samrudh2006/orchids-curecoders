# TODO — Fix Profile Update (PUT /api/profile/update)

## Root Cause

Frontend `components/Header.tsx` sends `PUT /api/profile/update` and `PUT /api/profile/change-password`, but `server.js` only registers **POST** versions. The global 404 handler returns `Route not found: PUT /api/profile/update`. The existing POST update handler also wrongly requires `email` in the body, while the frontend only sends `{ role }`.

## Steps

- [x] Inspect project structure & determine backend framework (Express)
- [x] Locate frontend PUT calls (components/Header.tsx)
- [x] Verify backend routes (server.js uses POST only)
- [x] Add `PUT /api/profile/update` (JWT auth, accept `{ role }`, keep existing POST)
- [x] Add `PUT /api/profile/change-password` (JWT auth, keep existing POST)
- [x] Verify no unrelated code changed
- [x] Syntax-check server.js (node --check passed)
- [x] Verify Vite proxy routes /api to backend
- [ ] Test profile update & password change flow

---

# Fix — Vercel Deploy Crash (pdf-parse loads @napi-rs/canvas at import time)

## Root Cause

`api/index.js` imports `server.js`, which imports `routes/upload.js`, which imports
`services/parserService.js`. That file previously did `const pdfParse = require('pdf-parse')`
at **module load time**.

`pdf-parse` v2.4.5 has **top-level side effects**: when loaded in Node it calls
`require("@napi-rs/canvas")` (a native module not available on Vercel's serverless runtime)
and polyfills `globalThis.DOMMatrix`, `ImageData`, `Path2D`, and touches `navigator`.
Because Vercel loads every module for every function invocation, this crashed **every**
serverless function at startup — including `/api/auth/login` and `/api/auth/register` that
never touch PDFs.

## Fix

Refactored `services/parserService.js`:

- Removed the eager `const pdfParse = require('pdf-parse')` at the top of the module.
- `pdf-parse` is now **lazy-loaded** inside the PDF branch only, wrapped in `try/catch`.
- Added a **pure-JS PDF text extraction fallback** (`extractPdfTextFallback`) that decodes
  PDF content streams (FlateDecode + Tj/TJ/`'`/`"` operators) with no native dependencies,
  so PDF uploads still work even if `pdf-parse`'s native deps are unavailable.
- DOCX/XLSX/CSV/TXT/PPTX handling is unchanged.

## Result

Login and register routes (and all other routes) no longer import `pdf-parse` during startup,
so the module-load crash is eliminated. `pdf-parse` is only required when a PDF is actually
parsed, and even then it degrades gracefully to the pure-JS fallback.

## Steps

- [x] Identify root cause (eager `pdf-parse` import in `parserService.js`)
- [x] Refactor to lazy-load `pdf-parse` inside PDF branch
- [x] Add pure-JS PDF text extraction fallback
- [x] Add explanatory comment documenting why `pdf-parse` is not eagerly imported
- [x] Syntax-check `services/parserService.js` (node --check passed)
- [x] Verify module loads without loading `pdf-parse` at startup
- [ ] Confirm Vercel deployment no longer crashes
