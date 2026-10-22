# Security Policy & Architecture — Celebrato 🎉

Celebrato is engineered with a strict **Privacy-First, Zero-Secret-Leakage** architecture designed to safeguard user events, budget data, and credentials.

---

## 🔒 1. Credential Isolation & API Key Security

- **Client-Side Key Isolation:** Gemini API keys are never bundled, hardcoded, or transmitted to any third-party intermediary backend.
- **Optional BYOK (Bring Your Own Key):** Celebrato operates 100% offline using its deterministic calculation engine without requiring an API key. If the user provides a Gemini API key via Settings or environment variables (`VITE_GEMINI_API_KEY`), it is stored locally in client-side `localStorage` and dispatched solely via direct HTTPS POST requests to Google's official Gemini endpoint (`generativelanguage.googleapis.com`).
- **Secret Scanner Compliance:** No real or simulated active production keys are committed to source control or test suites.

---

## 🛡️ 2. Data Persistence & Input Sanitization

- **Storage Sandboxing:** Event data, guest lists, and notes reside solely in the browser's `localStorage` sandbox.
- **Strict Schema Parsing:** Data retrieved from storage is defensively deserialized and type-validated against TypeScript interfaces (`EventPlan`, `BudgetCategory`, `Guest`, `TimelineTask`).
- **Malformed JSON Resilience:** Corrupted or tampered records trigger graceful deterministic fallback states rather than application crashes.
- **XSS Prevention:** All user inputs (guest names, dietary requests, budget titles) are rendered via React's virtual DOM escaping mechanism, preventing cross-site scripting vulnerabilities.

---

## 📦 3. Dependency Integrity

- Dependencies are strictly locked via `package-lock.json`.
- Continuous vulnerability audits can be validated at any time using:
  ```bash
  npm audit
  ```

---

## 🚨 4. Reporting Security Concerns

If you discover a potential vulnerability or security concern, please submit a responsible disclosure report directly via GitHub Issues or contact the maintainers. Reports are acknowledged within 24 hours with remediation patches prioritized immediately.
