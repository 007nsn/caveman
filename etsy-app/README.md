# Budget Planner & Expense Tracker — Etsy digital product

A self-contained web app built to be sold on Etsy as an instant digital
download.

| File | What it is |
|---|---|
| `BudgetPlanner.html` | The product. One file, zero dependencies, works fully offline. This is what you upload to the Etsy listing. |
| `ETSY-LISTING.md` | Ready-to-paste listing kit: title, description, tags, image plan, buyer message, pricing guidance. |

## Try it

Open `BudgetPlanner.html` in any browser (double-click it). No build step,
no server, no internet required.

## Product features

- Monthly income & expense tracking with month-to-month navigation
- Summary cards: income, expenses, balance, savings rate
- Spending-by-category donut chart
- Per-category monthly budgets with progress bars and overspend warnings
- Custom categories and currency symbol
- Light / dark theme
- CSV export per month (formula-injection-safe), JSON backup & restore
- Print-friendly layout
- All data stays in the buyer's browser (`localStorage`) — fully private

## Why not an iOS app?

Etsy can only deliver files, and Apple only distributes iOS apps through
the App Store — so an installable iOS app cannot be sold on Etsy. A
single-file web app is the standard format for "app" products on Etsy, and
it runs on iPhone/iPad via Safari (Share → Add to Home Screen gives it a
home-screen icon).
