# Contributing to Celebrato 🎉

Thank you for your interest in contributing to Celebrato! We welcome community contributions to help make celebration planning accessible, intuitive, and stress-free.

---

## 🛠️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shahin-glitch/celebrato.git
   cd celebrato
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Quality Standards & Verification

Before submitting changes, ensure all verification checks pass:

- **Typecheck:**
  ```bash
  npm run typecheck
  ```
- **Linting:**
  ```bash
  npm run lint
  ```
- **Automated Tests:**
  ```bash
  npm test
  ```
- **Production Build:**
  ```bash
  npm run build
  ```

---

## 📐 Guidelines

- **Zero `any` Policy:** All TypeScript code must be strictly typed without unsafe type assertions.
- **Accessibility:** Ensure all interactive elements retain accessible names (`aria-label`), visible focus rings, and screen-reader semantics.
- **Mathematical Integrity:** Any additions to budget calculations must adhere to the Budget Conservation Law ($\sum C_i = B_{total}$).
- **Security:** Never commit API keys, secrets, or credential tokens.
