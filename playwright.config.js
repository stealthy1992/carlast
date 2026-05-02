// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, 'sanity_carlast', '.env')
});

module.exports = defineConfig({

  // ✅ globalSetup runs global-setup.js once before all tests
  // This is the correct mechanism — NOT a 'sanity-setup' project with testMatch
  globalSetup: require.resolve('./global-setup.js'),

  timeout: 120_000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [

    // ── Backend (Sanity Studio) tests ──────────────────────────────
    // Uses .auth/user.json produced by globalSetup (global-setup.js)
    {
      name: 'backend-chromium',
      testDir: './tests/backend/specs',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },
    {
      name: 'backend-firefox',
      testDir: './tests/backend/specs',
      use: {
        ...devices['Desktop Firefox'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },
    {
      name: 'backend-webkit',
      testDir: './tests/backend/specs',
      use: {
        ...devices['Desktop Safari'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },
    {
      name: 'backend-mobile-chrome',
      testDir: './tests/backend/specs',
      use: {
        ...devices['Pixel 5'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },

    // ── Frontend (NextJS) tests ─────────────────────────────────────
    // Clean context — no Sanity auth needed
    {
      name: 'frontend-chromium',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'frontend-firefox',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'frontend-webkit',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'frontend-mobile-chrome',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // ✅ always spins up a fresh server on CI
    timeout: 120_000,
  },

});