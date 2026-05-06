const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const AUTH_FILE = path.join(__dirname, '.auth/user.json');
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 hours
const isCI = !!process.env.CI;


async function globalSetup() {
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const authExists = fs.existsSync(AUTH_FILE);
  const authAge = authExists
    ? Date.now() - fs.statSync(AUTH_FILE).mtimeMs
    : Infinity;

  // If session is still fresh, skip re-authentication
  if (!isCI && authExists && authAge < SESSION_TTL) {
    console.log('✅ Reusing existing Sanity session.');
    return;
  }

  console.log('🔄 Session expired or missing. Re-authenticating...');

  const browser = await chromium.launch({ 
    headless: true,
    args: isCI
      ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      : [], 
  });
  const contextOptions = authExists ? {     
    storageState: AUTH_FILE
  } : {};

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  await page.goto(process.env.SANITY_URL, { waitUntil: 'domcontentloaded' });


  const resolvedElement = await page.waitForSelector('a[href="/desk/carsforsale"]' , 'button:has-text("E-mail / password")', { state: 'visible'});
  const elementText = await resolvedElement.innerText();
  console.log(elementText);

  if (elementText == 'Cars For Sale') {
    console.log('✅ Already authenticated. Saving current session state.');
    await context.storageState({ path: AUTH_FILE });
    await browser.close();
    return;
  }


  // Click "Continue with email"
//  await page.click('button[text=E-mail / password]');
 await page.click('button', { name: 'E-mail / password' });


 // Fill in email and password
 await page.fill('input[name="email"]', process.env.SANITY_EMAIL);
 // await page.click('text=Continue');

 await page.waitForSelector('input[type="password"]', { state: 'visible' });
 await page.fill('input[type="password"]', process.env.SANITY_PASSWORD);
 await page.click('button[type="submit"]');

 // Wait until fully logged in
 await page.goto(process.env.SANITY_URL, { 
  waitUntil: 'domcontentloaded',
  timeout: 60000  // also bump timeout as a safety net
});
 await page.waitForLoadState('networkidle');

  await context.storageState({ path: AUTH_FILE });
  console.log('✅ Session refreshed and saved.');

  await browser.close();
}

module.exports = globalSetup;