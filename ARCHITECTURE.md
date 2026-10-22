# Architecture & Code Quality Guide — Celebrato 🎉

Celebrato is architected as a modular, responsive single-page web application engineered with strict type safety, predictable unidirectional data flow, and zero runtime dependencies on server infrastructure.

---

## 🏛️ 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Celebrato UI                          │
│  (React 19 + TailwindCSS v4 + Neo-Brutalist Design Tokens)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │   Custom Hooks    │           │ UI View Layer     │
     │  useEventPlan     │           │ OverviewDashboard │
     │  useBudgetCalc    │           │ AiEventStudio     │
     │  useNotifications │           │ BudgetRescueModal │
     └─────────┬─────────┘           │ GuestManager      │
               │                     └───────────────────┘
               ▼
     ┌───────────────────────────────────────────────────┐
     │                 Services Layer                    │
     │  StorageService       │  AIGeneratorService       │
     │  (Versioned Storage)  │  (Gemini + Engine Fallback│
     │  BudgetRescueService  │  SampleData Repository    │
     └───────────────────────────────────────────────────┘
```

---

## 📐 2. Core Architectural Patterns

### A. Unidirectional Data Flow
- **Single Source of Truth:** Event state is maintained at the root application layer and synchronized reactively through dedicated custom hooks (`useEventPlan`).
- **Defensive Persistence:** All mutations trigger atomic commits to `localStorage` wrapped in defensive `try/catch` handlers with schema migration support.

### B. Mathematical Conservation Invariant
In event budgeting, rounding errors and uneven percentage distributions can cause allocation drift. Celebrato enforces the **Budget Conservation Law**:
$$\sum_{i=1}^{n} \text{Category}_i.\text{amount} = \text{Total Planned Budget}$$
- In `aiGenerator.ts`, whenever dynamic budgets are generated, an exact balancing step calculates any discrepancy caused by integer rounding and adjusts the largest non-protected category to guarantee exact zero-remainder sums.

### C. Resilient Dual-Engine AI Integration
- **Primary:** Direct integration with Google Gemini 1.5 Flash using structured JSON response schemas.
- **Contingency:** A deterministic planning engine equipped with occasion-tailored budget weights, milestone schedules, and vendor procurement rules. If network timeouts, HTTP 500s, or rate limits occur, fallback is instantaneous with zero user disruption.

---

## 💎 3. Code Cleanliness & Quality Standards

- **Strict TypeScript Compliance:** Configured with `"strict": true`, `"noUnusedLocals": true`, and `"noUnusedParameters": true` in `tsconfig.app.json`.
- **Zero Loose Types:** Complete elimination of `any` across the entire codebase. All domain objects, priorities, and statuses are governed by strict union types (`types/index.ts`).
- **Linter Cleanliness:** Passes `oxlint` with **0 errors and 0 warnings**.
- **Pure Utility Layer:** Stateless helper functions in `src/utils/helpers.ts` guarantee idempotent, side-effect-free data transformations.
