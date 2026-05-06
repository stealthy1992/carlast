const DashboardPage = require('../page-objects/DashboardPage');
const { test, expect } = require('@playwright/test');
const { loadCSV, getCars, getRentCars } = require('../../helpers/csvLoader');
// const { test, expect } = require('../../fixtures');


const SANITY_URL = process.env.SANITY_URL;

test.describe('Sanity Studio — CSV Upload', () => {
  let dashboardPage;
  let carsForSale, carsForRent, category;

  // ✅ Load CSV inside beforeAll — not at module level
  // Module-level loading crashes the whole suite if the path fails at Jenkins startup
  test.beforeAll(async () => {
    const csvData = loadCSV('vehicles.csv');
    const rentData = loadCSV('vehicles_rental.csv');

    carsForSale = getCars(csvData);
    carsForRent = getRentCars(rentData);
    console.log(`✅ Loaded ${carsForSale.length} for-sale and ${carsForRent.length} for-rent vehicles from CSV`);
  });

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await page.goto(SANITY_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="pane-content"]', { state: 'visible' });
    // await dashboardPage.selectCategory();
  });

  // ✅ One test per car — if one fails, others still run and partial failures are visible
  // We use test.describe.configure to run serially (not in parallel)
  // because each upload depends on the studio being in a stable state
  test.describe.configure({ mode: 'serial' });

    test('Upload all cars for sale from CSV', async ({ page }) => {

      category = 'carsforsale';

      await dashboardPage.selectCategory(category);
      
      for (const [index, car] of carsForSale.entries()) {
        console.log(`📤 Uploading car ${index + 1}/${carsForSale.length}: ${car.name}`);
        try {
          await dashboardPage.addingCar(car, category);
          console.log(`  ✅ Uploaded: ${car.name}`);
        } catch (err) {
          console.error(`  ❌ Failed to upload: ${car.name} — ${err.message}`);
          throw err; // re-throw so test fails clearly
        }
      }
      console.log(`✅ All ${cars.length} vehicles uploaded successfully`);
    });

    test('upload all cars for rent from CSV', async () => {

      category = 'carsforrent';

      await dashboardPage.selectCategory(category);

      for (const [index, car] of carsForRent.entries()) {
        console.log(`📤 Uploading car ${index + 1}/${carsForRent.length}: ${car.name}`);
        try {
          await dashboardPage.addingCar(car, category);
          console.log(`  ✅ Uploaded: ${car.name}`);
        } catch (err) {
          console.error(`  ❌ Failed to upload: ${car.name} — ${err.message}`);
          throw err; // re-throw so test fails clearly
        }
      }
      console.log(`✅ All ${cars.length} vehicles uploaded successfully`);

    })
});