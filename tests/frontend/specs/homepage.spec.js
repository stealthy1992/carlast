const { expect, test } = require('@playwright/test');
const HomePage = require('../page-objects/HomePage');
const { fetchCars, fetchCarsForSale, fetchCarsForRent, refToUrl } = require('../../helpers/sanity-api');

test.describe('This will test the homepage features', () => {

    let homePage;
    let carsForSale, carsForRent;

    test.beforeEach(async ({ request}) => {
        carsForSale = await fetchCarsForSale(request);
        carsForRent = await fetchCarsForRent(request);
    })
    test.beforeEach(async ({page}) => {
        homePage = new HomePage(page);
        await page.goto('https://carlast.vercel.app/');
    })

    test.afterAll(async ({page}) => {
        await page.close();
    })

    test('This will the correct number of for sale/rent cars are displayed on homepage', async () => {
        const forSaleCount = await homePage.forSaleCarsCount();
        const forRentCount = await homePage.forRentCarsCount();
        console.log('cars for sale are: ',carsForSale.length,' and cars for rent are: ',carsForRent.length);
        expect(forSaleCount).toBe(carsForSale.length);
        expect(forRentCount).toBe(carsForRent.length);

    })

    test('THis will test the cars for sale are exactly those that are stored in sanity studio', async () => {
        for(let car of carsForSale){
            const carDetail = await homePage.getCarsForSale(car.name);
            console.log('Car price is: ',car.price);
            expect(carDetail).toBeVisible();
            const rawPrice = await homePage.getSaleCarPrice(car.name);
            const price = Number(rawPrice.replace('$', ''))

            expect(price).toBe(car.price);

        } 
    })

    test('THis will test the cars for rent are exactly those that are stored in sanity studio', async () => {
        for(let car of carsForRent){
            const carDetail = await homePage.getCarsForRent(car.name);
            console.log('Car name is: ',car.name);
            expect(carDetail).toBeVisible();
            const rawRent = await homePage.getRentPrice(car.name);
            const rent = parseInt(rawRent.replace(/[^0-9]/g, ''));
            console.log('Raw rent is: ',rent);
            expect(rent).toBe(car.rent);

        } 
    })

    test('each car on the frontend shows the correct image from Sanity', async ({ page }) => {

        for (const car of carsForSale) {
        //   console.log('Car properties are: ',car);
        //   console.log('Images raw:', JSON.stringify(car?.images, null, 2));
          // 1. Get the Sanity asset IDs for this car
          const sanityImageUrls  = car.images.map(img =>  refToUrl(img.asset._ref));
          const sanityAssetIds  = sanityImageUrls.map(url => homePage.extractAssetId(url));
          console.log(`[${car.name}] Sanity URLs:`, sanityImageUrls);
          console.log(`[${car.name}] Sanity asset IDs:`, sanityAssetIds);
        //   console.log(`Car: ${car.name} | Sanity asset IDs:`, sanityAssetIds);
    
          // 2. Find this car's card on the frontend
          const card = await homePage.getCarsForSale(car.name);
        //   const card = page.locator('.MuiCard-root', { hasText: car.name });
          await expect(card).toBeVisible();
    
          // 3. Get the src of the image inside this card
        //   const imgSrc = await card.locator('img').first().getAttribute('src');
        //   console.log(`Car: ${car.name} | Frontend src:`, imgSrc);
    
          // 4. Extract the asset ID from the frontend src
          const frontendSrc     = await homePage.getFirstImageSrcForCar(car.name)
          const frontendAssetId = homePage.extractAssetId(frontendSrc);
        //   console.log(`Car: ${car.name} | Frontend asset ID:`, frontendAssetId);

          console.log(`[${car.name}] Frontend src:`, frontendSrc);
          console.log(`[${car.name}] Frontend asset ID:`, frontendAssetId);

          expect(sanityAssetIds).toContain(frontendAssetId);
    
          // 5. Assert the frontend asset ID exists in Sanity's asset IDs for this car
        //   expect(sanityAssetIds).toContain(frontendAssetId);
        }
      });

      test('clicking a sale car card navigates to correct detail page', async ({ page }) => {
        // await page.goto('/');
        // await page.waitForLoadState('networkidle');
    
        // Get the first car card's name before clicking
        // const firstCard     = page.locator('.MuiCard-root').first();
        // const carName       = await firstCard.locator('.MuiTypography-h5').textContent();
    
        // Click the card
        // await firstCard.click();
    
        // Assert URL changed to detail page
        const h1 = await homePage.fetchSaleCard('Geely Coolray');
        await expect(page).toHaveURL(/\/car-for-sale\/.+/);
    
        // Assert the detail page shows the same car name
        await expect(page.locator('h1')).toContainText(h1);
      });
    
      test('clicking a rent car card navigates to correct detail page', async ({ page }) => {
        // await page.goto('/');
        // await page.waitForLoadState('networkidle');
    
        // const firstRentCard = page.locator('.MuiCard-root').nth(/* rent section index */);
        // await firstRentCard.click();
        const h1 = await homePage.fetchRentCard('Dayz');
        await expect(page).toHaveURL(/\/car-for-rent\/.+/);
      });
})
