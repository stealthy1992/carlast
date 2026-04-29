const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

(async () => {
  // Ensure .auth directory exists
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(process.env.SANITY_URL);

  // Click "Continue with email"
  await page.click('text=E-mail / password');

  // Fill in email and password
  await page.fill('input[name="email"]', process.env.SANITY_EMAIL);
  // await page.click('text=Continue');

  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', process.env.SANITY_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait until fully logged in
  // await page.goto(process.env.SANITY_URL, { 
  //   waitUntil: 'domcontentloaded',
  //   timeout: 60000  // also bump timeout as a safety net
  // });
  // await page.waitForLoadState('networkidle');

  await page.waitForURL('**/desk**', { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 });

  // Save session
  await context.storageState({ path: AUTH_FILE });
  console.log('✅ Auth state saved to .auth/user.json');

  await browser.close();
  process.exit(0);
})();