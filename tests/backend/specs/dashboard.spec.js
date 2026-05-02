const DashboardPage = require('../page-objects/DashboardPage');
const { test, expect } = require('@playwright/test');
const { loadCSV, getCars } = require('../../helpers/csvLoader')

const SANITY_URL = process.env.SANITY_URL;


test.describe('This will test the sanity dashboard', () => {

    let dashboardPage;
    const csvData  = loadCSV('vehicles.csv');
    const cars = getCars(csvData);
    
    test.beforeEach(async ({page}) => {
        dashboardPage = new DashboardPage(page);
    })

    test('This will access left side bar items', async ({page}) => {
        console.log(SANITY_URL);
        await page.goto(SANITY_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-testid="pane-content"]', { state: 'visible' });
        await dashboardPage.selectCategory();
        // await dashboardPage.addingCar(cars[0]);
        for(let car of cars){
            await dashboardPage.addingCar(car);
        }
        
    })
})