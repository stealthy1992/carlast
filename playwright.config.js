// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, 'sanity_carlast', '.env')
});

module.exports = defineConfig({

  globalSetup: require.resolve('./global-setup.js'),

  timeout: 280_000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // ✅ Locally: localhost. Jenkins: Vercel URL from environment block
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },

  projects: [
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
    {
      name: 'frontend-chromium',
      testDir: './tests/frontend/specs',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'frontend-firefox',
      testDir: './tests/frontend/specs',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'frontend-webkit',
      testDir: './tests/frontend/specs',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'frontend-mobile-chrome',
      testDir: './tests/frontend/specs',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // ✅ Locally: spins up Next.js dev server
  // ✅ Jenkins: CI=true so webServer is skipped entirely,
  //             tests hit Vercel via baseURL above
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },

});