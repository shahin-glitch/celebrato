# Celebrato 🎉
### GenAI Celebration & Event Planner — PromptWars Virtual Hackathon Submission

> **"Make moments memorable. We'll handle the planning."**

A polished, production-quality event-planning web application powered by AI — built with React, Vite, TypeScript, and TailwindCSS v4. Designed with a distinctive retro-modern neo-brutalist aesthetic.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Optional — add your Gemini API key
cp .env.example .env
# Edit .env and set VITE_GEMINI_API_KEY=AIzaSy...

# 3. Start development server
npm run dev
# → opens at http://localhost:5173

# 4. Production build
npm run build
```

---

## ✨ Features

| Feature | Status |
|---|---|
| 🎨 Retro-modern editorial dashboard (mint sidebar, cream workspace, lemon cards) | ✅ |
| 📋 Guided 6-step event creation wizard | ✅ |
| 🤖 AI Event Studio (Gemini 1.5 Flash live + deterministic fallback) | ✅ |
| 💰 Intelligent budget allocation that always sums to total | ✅ |
| 🆘 **Budget Rescue Mode** — signature live-demo feature | ✅ |
| 📅 Timeline & Milestone checklist with filter/sort | ✅ |
| 🏪 Vendor discovery directory with Add-to-Event | ✅ |
| 👥 Guest Manager + RSVP tracking + CSV export | ✅ |
| 🎨 Theme & Inspiration gallery with palette swatches | ✅ |
| 🔔 In-app notification center with read state | ✅ |
| 🔍 Global search (events, tasks, vendors, guests, themes) | ✅ |
| 💾 LocalStorage persistence (events survive browser refresh) | ✅ |
| 📱 Responsive desktop + tablet + mobile layouts | ✅ |
| 🌐 Works 100% offline without any API key | ✅ |

---

## 🆘 Budget Rescue Mode (Signature Feature)

The standout demo feature for hackathon judges:

1. Open any event → click **"Rescue Budget"** in the top bar
2. Set a reduced target (e.g. ₹70,000 from ₹1,00,000)
3. Lock your non-negotiable categories (Venue, Sound, etc.)
4. Review auto-generated smart substitutions
5. Accept/reject individual suggestions
6. Confirm → budget is rebalanced and saved instantly

---

## 🤖 AI Integration

**With Google Gemini API key:**
- Calls `gemini-1.5-flash` with structured JSON output schema
- Validates and mathematically normalises response (budget always sums to total)
- Falls back gracefully to deterministic engine on any failure

**Without API key (default for demo):**
- High-precision deterministic engine produces realistic plans
- Uses occasion-specific budget weight tables, milestone calendars, and vendor templates
- Clearly labelled "Celebrato Engine" (never pretends to be live AI)

Set key in `.env` as `VITE_GEMINI_API_KEY=` or enter it in the app **Settings → AI Key** panel.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript 6 |
| Styling | TailwindCSS v4 (`@tailwindcss/vite`) |
| Icons | Lucide React |
| Confetti | canvas-confetti |
| Fonts | Space Mono (headings) + Plus Jakarta Sans (body) |
| AI | Google Gemini 1.5 Flash (optional) + Celebrato Engine |
| Persistence | `localStorage` (versioned, safe-parsed) |

---

## 🎨 Design System

- **Page background:** Soft lavender `#F0E5FD`
- **Sidebar:** Mint green `#C2F2B0`
- **Primary cards:** Butter yellow `#FDF189`
- **Right panel:** Lemon `#E3FFA8`
- **Accent pink:** `#F4BCE8`
- **Cream workspace:** `#FCFBF7`
- **Borders + text:** Near-black `#171717`
- **Typography:** Space Mono display + Plus Jakarta Sans body

---

## 📁 Project Structure

```
src/
├── types/              # Shared TypeScript interfaces
├── services/
│   ├── sampleData.ts   # Realistic demo events, vendors, themes
│   ├── storage.ts      # Versioned localStorage service
│   └── aiGenerator.ts  # Gemini API + deterministic fallback
├── components/
│   ├── layout/         # Sidebar, TopHeader, RightPlannerPanel
│   ├── dashboard/      # OverviewDashboard (main first impression)
│   ├── aiStudio/       # AiEventStudio (5-tab plan viewer)
│   ├── budget/         # BudgetPlanner + BudgetRescueModal
│   ├── timeline/       # TimelineTasks
│   ├── vendors/        # VendorDirectory
│   ├── guests/         # GuestManager
│   ├── themes/         # ThemeGallery
│   ├── events/         # CreateEventWizard, MyEventsList
│   ├── settings/       # SettingsModal
│   └── notifications/  # NotificationDrawer
└── App.tsx             # Root component with view routing
```

---

## 🎭 Demo Events (Pre-loaded)

Three richly populated demo events are pre-loaded automatically:

1. **Campus Cultural Night** — Mangalore, 250 guests, ₹1,00,000 — fully planned
2. **Ananya & Rahul's Royal Wedding** — Udaipur, 350 guests, ₹15,00,000
3. **Mom's 50th Golden Jubilee Birthday** — Bengaluru, 60 guests, ₹85,000

Use the **"Reset Demo Events"** button in My Events or Settings to restore them anytime.

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | No | Google AI Studio key for live Gemini generation |

---

*Built for PromptWars Virtual GenAI Challenge — Celebrato 2026*
