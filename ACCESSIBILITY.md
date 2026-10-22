# Accessibility Statement & Compliance Guide — Celebrato 🎉

Celebrato is dedicated to providing an inclusive, universally accessible celebration planning experience compliant with the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**.

---

## ♿ 1. Semantic HTML & ARIA Structure

- **Landmark Regions:** Logical structure utilizing `<header>`, `<main id="main-content">`, `<nav>`, and `<aside>`.
- **Skip Navigation:** A dedicated `Skip to main content` anchor is available as the first focusable element for keyboard and screen-reader users.
- **Dialogs & Modals:** All interactive overlays (`CreateEventWizard`, `BudgetRescueModal`, `SettingsModal`, `NotificationDrawer`) implement:
  - `role="dialog"` and `aria-modal="true"`.
  - `aria-labelledby` referencing their respective dialog headers.
  - Active keyboard dismissal via the `Escape` key.
- **Data Visualizations:** All progress meters and velocity charts are augmented with `role="progressbar"` (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) and descriptive SVG `role="img"` labels.

---

## ⌨️ 2. Keyboard Navigation & Focus Management

- **Full Keyboard Operability:** All forms, filters, drawers, and modal dismissals are operable using only a keyboard.
- **Visible Focus States:** Prominent, high-contrast `:focus-visible` outline rings (2px solid `#171717`, offset 2px) ensure clear navigation tracking.
- **Custom Interactive Elements:** Timeline milestone checkboxes and activity feed cards feature `tabIndex={0}` and respond to standard `Enter` and `Space` key actions.

---

## 👁️ 3. Visual Ergonomics & Color Contrast

- **Contrast Compliance:** All core textual elements adhere to WCAG AA minimum contrast ratio (4.5:1 for normal text, 3:1 for large display headers) against their backgrounds.
- **Color Independence:** Information is never conveyed by color alone. Every budget category, theme preview, and task state includes text labels and icon signifiers.
- **Motion Sensitivity:** Respects user operating system preferences for reduced motion via `@media (prefers-reduced-motion: reduce)`.
