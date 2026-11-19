#!/usr/bin/env node
// Builds the Etsy upload kit into etsy-app/dist/ (git-ignored):
//   upload/BudgetPlanner.zip          the product: planner + PDF guide
//   upload/listing-photos/*.jpg       8 listing photos, 3000x2250 (4:3)
//   upload/listing-photos-preview.png contact sheet of all 8
//   upload/ETSY-LISTING.md            listing text and setup steps (copied)
//   shots/                            raw app screenshots used by the photos
//
// Usage:  npm install --prefix etsy-app/build playwright-core
//         node etsy-app/build/build.js
// Needs a Chromium binary: set CHROME_PATH, or have one in /opt/pw-browsers.
// Needs the `zip` command-line tool.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright-core");

const APP_DIR = path.resolve(__dirname, "..");
const DIST = path.join(APP_DIR, "dist");
const SHOTS = path.join(DIST, "shots");
const UPLOAD = path.join(DIST, "upload");
const PKG = path.join(DIST, "pkg");
const PHOTOS = path.join(UPLOAD, "listing-photos");
const url = (p) => "file://" + p;

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const root = "/opt/pw-browsers";
  if (fs.existsSync(root)) {
    for (const d of fs.readdirSync(root).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
      for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
        const p = path.join(root, d, sub);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return undefined; // fall back to playwright's own browser lookup
}

// A realistic, internally consistent month of sample data for the screenshots.
function sampleState() {
  const now = new Date();
  const key = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = Math.min(now.getDate(), 28);
  const d = (day) => key + "-" + String(Math.min(day, lastDay)).padStart(2, "0");
  let n = 0;
  const t = (type, desc, amount, category, day) => ({ id: "s" + n++, type, desc, amount, category, date: d(day) });
  return {
    months: {
      [key]: {
        tx: [
          t("income", "Salary", 4200, "Other", 1),
          t("expense", "Rent", 1450, "Housing", 1),
          t("expense", "Savings transfer", 500, "Savings", 2),
          t("expense", "Weekly groceries", 112.37, "Groceries", 3),
          t("expense", "Electric bill", 92.4, "Utilities", 4),
          t("expense", "Monthly bus pass", 35, "Transport", 5),
          t("expense", "Dinner with friends", 64.8, "Dining", 6),
          t("expense", "Internet", 60, "Utilities", 7),
          t("income", "Freelance project", 650, "Other", 8),
          t("expense", "Streaming", 15.99, "Entertainment", 9),
          t("expense", "Weekly groceries", 86.4, "Groceries", 10),
          t("expense", "Lunch out", 42.5, "Dining", 11),
          t("expense", "Gas", 48.25, "Transport", 12),
          t("expense", "Pharmacy", 23.1, "Health", 13),
          t("expense", "New running shoes", 87.5, "Shopping", 14),
          t("expense", "Takeout", 38.9, "Dining", 15),
          t("expense", "Weekly groceries", 94.15, "Groceries", 16),
          t("expense", "Movie night", 28, "Entertainment", 17),
          t("expense", "Brunch", 26.3, "Dining", 18),
        ],
      },
    },
    settings: { currency: "$", theme: "light" },
    budgets: { Groceries: 450, Dining: 150, Transport: 120, Utilities: 200, Shopping: 100, Entertainment: 60 },
  };
}

async function main() {
  for (const dir of [SHOTS, PKG, PHOTOS]) fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: findChrome() });

  // 1. App screenshots with sample data
  // 1100px wide: the app's 1060px layout fills the frame with no empty gutters
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: 2, locale: "en-US" });
  const app = await ctx.newPage();
  const errors = [];
  app.on("pageerror", (e) => errors.push(e.message));
  await app.goto(url(path.join(APP_DIR, "BudgetPlanner.html")));
  await app.evaluate((s) => localStorage.setItem("budgetplanner.v1", JSON.stringify(s)), sampleState());
  await app.reload();
  await app.waitForTimeout(500);
  await app.screenshot({ path: path.join(SHOTS, "app-light.png") });
  // summary: the app header plus the four summary cards
  const cards = await app.locator(".cards").boundingBox();
  await app.screenshot({ path: path.join(SHOTS, "summary.png"),
    clip: { x: cards.x - 14, y: 10, width: cards.width + 28, height: cards.y + cards.height + 14 - 10 } });
  await app.locator("section.panel:has(#donut)").screenshot({ path: path.join(SHOTS, "chart.png") });
  await app.locator("section.panel:has(#budgetList)").screenshot({ path: path.join(SHOTS, "budgets.png") });
  await app.click("#themeBtn");
  await app.waitForTimeout(800); // let the theme transition finish
  await app.screenshot({ path: path.join(SHOTS, "app-dark.png") });
  if (errors.length) throw new Error("App errors: " + errors.join("; "));
  await ctx.close();

  // 2. Buyer guide: PDF for the ZIP, PNG for the "what you get" photo
  const guidePage = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
  await guidePage.goto(url(path.join(APP_DIR, "HOW-TO-OPEN.html")));
  await guidePage.pdf({ path: path.join(PKG, "How-To-Open.pdf"), format: "Letter", printBackground: true, preferCSSPageSize: true });
  await guidePage.addStyleTag({ content: "body{padding:58px 67px}" }); // mimic print margins for the thumbnail
  await guidePage.screenshot({ path: path.join(SHOTS, "guide.png") });
  await guidePage.close();

  // 3. Listing photos, 1500x1125 CSS px at 2x = 3000x2250
  const names = ["01-hero", "02-dark-mode", "03-summary", "04-chart-budgets", "05-whats-included", "06-how-it-works", "07-features", "08-privacy"];
  const photos = await browser.newPage({ viewport: { width: 1500, height: 1125 }, deviceScaleFactor: 2 });
  await photos.goto(url(path.join(__dirname, "listing-photos.html")));
  await photos.evaluate(() => document.fonts.ready);
  for (let i = 0; i < names.length; i++) {
    await photos.locator("#p" + (i + 1)).screenshot({ path: path.join(PHOTOS, names[i] + ".jpg"), type: "jpeg", quality: 90 });
  }
  await photos.close();

  // 4. Contact sheet for a quick review
  // (written to a file so the page may load file:// images; setContent's about:blank can't)
  const tiles = names.map((n) => `<figure><img src="upload/listing-photos/${n}.jpg"><figcaption>${n}</figcaption></figure>`).join("");
  const sheetFile = path.join(DIST, "contact-sheet.html");
  fs.writeFileSync(sheetFile, `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:20px;background:#2b2a27;font:14px sans-serif;color:#ddd;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    figure{margin:0}img{width:100%;display:block;border-radius:4px}figcaption{margin-top:6px}</style>${tiles}`);
  const sheet = await browser.newPage({ viewport: { width: 1640, height: 640 } });
  await sheet.goto(url(sheetFile));
  await sheet.screenshot({ path: path.join(UPLOAD, "listing-photos-preview.png"), fullPage: true });
  await browser.close();

  // 5. Product ZIP: planner + guide
  fs.copyFileSync(path.join(APP_DIR, "BudgetPlanner.html"), path.join(PKG, "BudgetPlanner.html"));
  const zipPath = path.join(UPLOAD, "BudgetPlanner.zip");
  fs.rmSync(zipPath, { force: true });
  execFileSync("zip", ["-X", "-q", zipPath, "BudgetPlanner.html", "How-To-Open.pdf"], { cwd: PKG });

  // 6. Listing text alongside, so the upload folder is self-contained
  fs.copyFileSync(path.join(APP_DIR, "ETSY-LISTING.md"), path.join(UPLOAD, "ETSY-LISTING.md"));

  console.log("Built:", path.relative(process.cwd(), UPLOAD));
  for (const f of fs.readdirSync(UPLOAD)) console.log("  " + f);
}

main().catch((e) => { console.error(e); process.exit(1); });
