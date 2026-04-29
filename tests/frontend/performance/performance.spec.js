// tests/specs/performance/homepage-performance.spec.js
const { test, expect } = require('@playwright/test');

// Hardcoded Vercel URL — performance tests always run against production
const VERCEL_URL = 'https://carlast.vercel.app';

test.describe('Homepage performance — Vercel production', () => {

  test('Core Web Vitals are within acceptable thresholds', async ({ page }) => {

    await page.addInitScript(() => {
      window.__perfMetrics = {
        lcp: null,
        fcp: null,
        cls: 0,
      };

      new PerformanceObserver(list => {
        const entries = list.getEntries();
        window.__perfMetrics.lcp = entries[entries.length - 1].startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver(list => {
        const entries = list.getEntriesByName('first-contentful-paint');
        if (entries.length) window.__perfMetrics.fcp = entries[0].startTime;
      }).observe({ type: 'paint', buffered: true });

      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__perfMetrics.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    // ✅ Always hits Vercel — ignores baseURL in playwright.config.js
    const start = Date.now();
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    const totalLoadTime = Date.now() - start;

    await page.waitForTimeout(1000);

    const ttfb = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return nav ? nav.responseStart - nav.requestStart : null;
    });

    const metrics = await page.evaluate(() => window.__perfMetrics);

    console.log('─────── Performance Results (Vercel) ───────');
    console.log(`LCP:         ${metrics.lcp?.toFixed(0)}ms   (target: < 2500ms)`);
    console.log(`FCP:         ${metrics.fcp?.toFixed(0)}ms   (target: < 1800ms)`);
    console.log(`CLS:         ${metrics.cls?.toFixed(4)}     (target: < 0.1)`);
    console.log(`TTFB:        ${ttfb?.toFixed(0)}ms          (target: < 800ms)`);
    console.log(`Total load:  ${totalLoadTime}ms             (target: < 5000ms)`);
    console.log('────────────────────────────────────────────');

    expect(metrics.lcp,   'LCP should be under 2500ms').toBeLessThan(2500);
    expect(metrics.fcp,   'FCP should be under 1800ms').toBeLessThan(1800);
    expect(metrics.cls,   'CLS should be under 0.1').toBeLessThan(0.1);
    expect(ttfb,          'TTFB should be under 800ms').toBeLessThan(800);
    expect(totalLoadTime, 'Total load should be under 5000ms').toBeLessThan(5000);
  });

  test('all images load within networkidle on Vercel', async ({ page }) => {
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');

    const allLoaded = await page.evaluate(() =>
      Array.from(document.images)
        .every(img => img.complete && img.naturalWidth > 0)
    );

    expect(allLoaded).toBe(true);
  });

  test('page makes no excessive network requests on Vercel', async ({ page }) => {
    const requests = [];
    page.on('request', req => requests.push(req.url()));

    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');

    console.log(`Total requests: ${requests.length}`);
    expect(requests.length).toBeLessThan(50);
  });

});