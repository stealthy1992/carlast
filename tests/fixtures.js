const { test: base, expect } = require('@playwright/test');

const HomePage = require('./frontend/page-objects/HomePage');
const DetailPage = require('./frontend/page-objects/DetailPage');
const DashboardPage = require('./backend/page-objects/DashboardPage');

const test = base.extend({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await page.goto(process.env.NEXT_PUBLIC_BASE_URL || 'https://carlast.vercel.app/');
    await use(homePage);
  },

  detailPage: async ({ page }, use) => {
    const detailPage = new DetailPage(page);
    await use(detailPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

module.exports = {
  test,
  expect,
};
