# Testing Strategy & Validation Guide — Celebrato 🎉

Celebrato is built with high reliability and maintainability in mind, backed by an extensive dual-tier automated testing suite covering unit, component integration, and end-to-end user journeys.

---

## 📊 1. Test Suite Architecture

Celebrato maintains **17 test suites and 101+ passing automated tests** with zero flaky tests:

| Test Suite | File | Focus Area |
| :--- | :--- | :--- |
| **Budget Planning & Math** | `src/test/budget.test.tsx` | Allocation sums, real-time recalculations, category addition/deletion |
| **Budget Rescue Mode** | `src/test/budgetRescue.test.tsx` | Algorithmic rebalancing, protected category locking, slider responsiveness |
| **AI Studio & Deterministic Fallback** | `src/test/aiStudio.test.tsx` | AI prompt output validation, 5-tab concept views, milestone and vendor generation |
| **Event Creation Wizard** | `src/test/eventCreation.test.tsx` | 6-step wizard progression, form validation, occasion selection |
| **Guest & RSVP Management** | `src/test/guestManager.test.tsx` | Headcount aggregations, RSVP filtering, attendee additions, CSV export |
| **Vendor Directory** | `src/test/vendorDirectory.test.tsx` | Vendor search, category filters, procurement checklist pipeline |
| **Theme & Aesthetic Studio** | `src/test/themeGallery.test.tsx` | Swatch rendering, theme application, budget tags |
| **Notification Center** | `src/test/notifications.test.tsx` | Unread badges, mark-all-as-read, deadline triggers, tab routing |
| **Settings & API Configuration** | `src/test/settings.test.tsx` | BYOK storage, currency toggling, sample data reset |
| **Storage & Persistence** | `src/test/storage.test.ts` | LocalStorage schema safety, corruption recovery, state migrations |
| **AI Engine Edge Cases** | `src/test/aiGenerator.test.ts` | Offline fallback, HTTP 500 recovery, malformed JSON recovery |
| **Accessibility Verification** | `src/test/accessibility.test.tsx` | ARIA roles, skip navigation, screen reader landmarks |
| **Custom React Hooks** | `src/test/hooks.test.ts` | `useBudgetCalculation`, `useNotifications`, `useEventPlan` reactivity |
| **Utility Logic & Formatting** | `src/test/helpers.test.ts` | Unique ID generation, rapid generation, currency formatting |
| **Sample Data & Domain Schemas** | `src/test/sampleData.test.ts` | Pre-loaded events, vendor ratings, theme color arrays, notification types |
| **Overview Dashboard** | `src/test/overviewDashboard.test.tsx` | Metric cards, burn velocity chart, activity feed navigation |
| **E2E User Journey (Playwright)** | `e2e/userJourney.spec.ts` | Complete multi-step user journey, budget modification, browser refresh persistence |

---

## 🚀 2. Running Automated Tests

```bash
# Run full Vitest test suite once
npm test

# Run Vitest in interactive watch mode
npm run test:watch

# Run Playwright End-to-End tests
npm run test:e2e

# Run all test pipelines
npm run test:all
```

---

## 🛡️ 3. Maintainability & Reliability Guarantees

- **Zero Test Flakiness:** All tests execute against isolated DOM and simulated local storage environments (`beforeEach(() => localStorage.clear())`).
- **Defensive Mocking:** External network dependencies (`fetch` to Gemini API) are deterministically mocked in unit suites to eliminate network dependencies.
- **Strict Accessibility Testing:** UI elements are queried via accessible roles (`getByRole`, `getByLabelText`) rather than brittle CSS class selectors, ensuring tests mirror real assistive technology interactions.
