// @ts-check
import { defineConfig, devices } from '@playwright/test';
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, 'sanity_carlast', '.env')
});

export default defineConfig({
  // ❌ Removed globalSetup from top level
  
  timeout: 120_000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  
  use: {
    // ❌ Removed storageState from top level
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── Sanity auth setup (runs once before Sanity tests) ──
    {
      name: 'sanity-setup',
      testMatch: '**/global-setup.js',
    },

    // ── Sanity backend tests ──
    {
      name: 'chromium',
      testDir: './tests/backend/specs',
      dependencies: ['sanity-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },
    {
      name: 'firefox',
      testDir: './tests/backend/specs',
      dependencies: ['sanity-setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },
    {
      name: 'webkit',
      testDir: './tests/backend/specs',
      dependencies: ['sanity-setup'],
      use: {
        ...devices['Desktop Safari'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/backend/specs',
      dependencies: ['sanity-setup'],
      use: {
        ...devices['Pixel 5'],
        storageState: path.join(__dirname, '.auth/user.json'),
      },
    },

    // ── Frontend tests — clean context, no Sanity auth ──
    {
      name: 'chromium',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/frontend/specs',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});