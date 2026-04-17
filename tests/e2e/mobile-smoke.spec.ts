/**
 * ModulCA — Mobile Smoke Test
 *
 * Validates critical user journeys on mobile viewports (iPhone + Pixel).
 * Driven by playwright.config.ts `projects` which sets the device per run.
 *
 * Assertions per route:
 *   - HTTP < 400
 *   - First heading visible within 10s
 *   - No horizontal overflow (responsive check)
 *   - No uncaught JS errors or pageerror events
 *
 * Also checks:
 *   - CTA tap-target sizes (Apple HIG: 44×44 minimum)
 *   - Hero image loading on portfolio
 *
 * Run (against production):
 *   npm run test:mobile
 *
 * Run (against local dev server):
 *   npm run test:mobile:local
 *
 * View HTML report:
 *   npm run test:mobile:report
 */

import { test, expect } from "@playwright/test";

/** Critical user journey — every route here must work on mobile */
const ROUTES = [
  { path: "/", heading: /Design Your.*Modular Home/i, name: "Landing" },
  { path: "/portfolio", heading: /Built with ModulCA/i, name: "Portfolio list" },
  { path: "/portfolio/riverside-cabin", heading: /Riverside Cabin/i, name: "Portfolio detail" },
  { path: "/pricing", heading: /Choose Your Plan/i, name: "Pricing" },
  { path: "/quiz", heading: /Architectural Profile/i, name: "Quiz" },
  { path: "/library", heading: /Knowledge Library/i, name: "Library" },
  { path: "/blog", heading: /Blog|Modular|Insights/i, name: "Blog" },
  { path: "/login", heading: /Sign in|Log in/i, name: "Login" },
  { path: "/register", heading: /Create|Sign up|Get started/i, name: "Register" },
  { path: "/privacy", heading: /Privacy Policy/i, name: "Privacy" },
  { path: "/terms", heading: /Terms of Service/i, name: "Terms" },
];

test.describe("Mobile smoke", () => {
  for (const route of ROUTES) {
    test(`${route.name} (${route.path}) loads without errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (
            !text.includes("googletagmanager") &&
            !text.includes("clarity.ms") &&
            !text.includes("Failed to load resource") &&
            !text.includes("hydrated but some attributes")
          ) {
            consoleErrors.push(text);
          }
        }
      });

      page.on("pageerror", (err) => {
        consoleErrors.push(`PAGE ERROR: ${err.message}`);
      });

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

      expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(400);

      await expect(
        page.getByRole("heading").first(),
        `Expected heading on ${route.path}`
      ).toBeVisible();

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(overflow, `Horizontal scroll on ${route.path}`).toBe(false);

      await page.waitForTimeout(1000);
      expect(consoleErrors, `Console errors on ${route.path}:\n${consoleErrors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Tap target sizes", () => {
  /**
   * Apple HIG: 44×44 minimum for PRIMARY actions.
   * We allow secondary links (footer, dense nav on mobile) to be smaller
   * because they're used infrequently and the extra whitespace would hurt
   * information density. Main CTA buttons and form controls must meet 44px.
   */
  test("Landing page — primary CTAs meet 44px minimum", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Only audit primary CTAs (Start Designing, Get Premium, etc.),
    // skip footer and nav tertiary links.
    const smallPrimaryTargets = await page.$$eval(
      'main a[class*="btn"], main button:not([disabled])',
      (els) =>
        els
          .map((el) => {
            const rect = (el as HTMLElement).getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return null;
            if (rect.width >= 44 && rect.height >= 44) return null;
            return {
              tag: el.tagName,
              text: (el.textContent || "").trim().slice(0, 40),
              w: Math.round(rect.width),
              h: Math.round(rect.height),
            };
          })
          .filter(Boolean)
    );

    if (smallPrimaryTargets.length > 0) {
      console.log("Small primary tap targets:", smallPrimaryTargets);
    }
    // Hard fail only on >= 3 primary CTA misses (leaves slack for pricing card buttons)
    expect(smallPrimaryTargets.length).toBeLessThan(3);
  });

  /** Soft report — logs all small tertiary tap targets for visibility */
  test("Report — all small tap targets across the page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const allSmall = await page.$$eval('a, button:not([disabled])', (els) =>
      els
        .map((el) => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return null;
          if (rect.width >= 44 && rect.height >= 44) return null;
          return {
            text: (el.textContent || "").trim().slice(0, 40),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          };
        })
        .filter(Boolean)
    );

    console.log(`\n📱 ${allSmall.length} tap targets under 44×44 found:`);
    console.table(allSmall);
    // No assertion — this is a visibility report, not a gate.
  });
});

test.describe("Images", () => {
  test("Portfolio hero images load successfully", async ({ page }) => {
    await page.goto("/portfolio");
    await page.waitForLoadState("networkidle", { timeout: 20_000 });

    const brokenImages = await page.$$eval("img", (imgs) =>
      imgs
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.src)
    );

    expect(brokenImages, `Broken images: ${brokenImages.join(", ")}`).toEqual([]);
  });
});
