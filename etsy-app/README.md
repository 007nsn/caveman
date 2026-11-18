# Budget Planner & Expense Tracker — Etsy digital product

A self-contained web app built to be sold on Etsy as an instant digital
download.

| File | What it is |
|---|---|
| `BudgetPlanner.html` | The product. One file, no dependencies, works fully offline. |
| `HOW-TO-OPEN.html` | Source for the buyer's one-page `How-To-Open.pdf` guide (print it to PDF at US Letter size). |
| `ETSY-LISTING.md` | Ready-to-paste listing kit: payment and delivery setup, title, description with AI disclosure, tags, image plan, buyer message, pricing. |

## What gets uploaded to Etsy

`BudgetPlanner.zip`, containing `BudgetPlanner.html` and `How-To-Open.pdf`.
Build the ZIP locally and upload it only to the Etsy listing. Never commit
it to this repository: if the repository is public, anyone could download
the product for free.

## Try it

Open `BudgetPlanner.html` in a computer browser (double-click it). There's
no build step and no server, and no internet connection is needed.

## Product features

- Monthly income & expense tracking with month-to-month navigation
- Summary cards: income, expenses, balance, savings rate
- Spending-by-category donut chart
- Per-category monthly budgets with progress bars and overspend warnings
- Custom categories and currency symbol
- Light / dark theme
- CSV export per month (formula-injection-safe), JSON backup & restore
- Print-friendly layout
- All data stays in the buyer's browser (`localStorage`), fully private

## Why not an iOS app?

Etsy can only deliver files, and Apple only distributes iOS apps through
the App Store, so an installable iOS app can't be sold on Etsy. A
single-file web app is the standard format for "app" products on Etsy.

As a downloaded file, it's a **computer** product. On iPhone, iPad and
Android, a downloaded HTML file opens in a preview mode that may not run
the planner. Supporting phones would mean hosting the planner at a private
link that buyers open in mobile Safari or Chrome.
