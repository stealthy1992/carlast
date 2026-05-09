const { expect, test } = require('@playwright/test');
const HomePage = require('../page-objects/HomePage');
const { urlFor, client } = require('../../../lib/client');
const { testClient } = require('../../helpers/sanityTestClient');
const { fetchCars, fetchCarsForSale, fetchCarsForRent, refToUrl } = require('../../helpers/sanity-api');
const { waitForSubmission } = require('../../helpers/sanityTestClient');
const { interceptEmailRoute } = require('../../helpers/email-interceptor');

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
  
          const sanityImageUrls  = car.images.map(img =>  refToUrl(img.asset._ref));
          const sanityAssetIds  = sanityImageUrls.map(url => homePage.extractAssetId(url));
          console.log(`[${car.name}] Sanity URLs:`, sanityImageUrls);
          console.log(`[${car.name}] Sanity asset IDs:`, sanityAssetIds);
          const card = await homePage.getCarsForSale(car.name);
          await expect(card).toBeVisible();
    
          // 4. Extract the asset ID from the frontend src
          const frontendSrc     = await homePage.getFirstImageSrcForCar(car.name)
          const frontendAssetId = homePage.extractAssetId(frontendSrc);
        //   console.log(`Car: ${car.name} | Frontend asset ID:`, frontendAssetId);

          console.log(`[${car.name}] Frontend src:`, frontendSrc);
          console.log(`[${car.name}] Frontend asset ID:`, frontendAssetId);
          expect(sanityAssetIds).toContain(frontendAssetId);
        }

        for (const car of carsForRent) {
  
          const sanityImageUrls  = car.images.map(img =>  refToUrl(img.asset._ref));
          const sanityAssetIds  = sanityImageUrls.map(url => homePage.extractAssetId(url));
          console.log(`[${car.name}] Sanity URLs:`, sanityImageUrls);
          console.log(`[${car.name}] Sanity asset IDs:`, sanityAssetIds);
          const card = await homePage.getCarsForSale(car.name);
          await expect(card).toBeVisible();
    
          // 4. Extract the asset ID from the frontend src
          const frontendSrc     = await homePage.getFirstImageSrcForCar(car.name)
          const frontendAssetId = homePage.extractAssetId(frontendSrc);
        //   console.log(`Car: ${car.name} | Frontend asset ID:`, frontendAssetId);

          console.log(`[${car.name}] Frontend src:`, frontendSrc);
          console.log(`[${car.name}] Frontend asset ID:`, frontendAssetId);
          expect(sanityAssetIds).toContain(frontendAssetId);
        }
      });

      test('clicking a sale car card navigates to correct detail page', async ({ page }) => {
    
        // Assert URL changed to detail page
        const h1 = await homePage.fetchSaleCard('Geely Coolray');
        await expect(page).toHaveURL(/\/car-for-sale\/.+/);
    
        // Assert the detail page shows the same car name
        await expect(page.locator('h1')).toContainText(h1);
      });
    
      test('clicking a rent car card navigates to correct detail page', async ({ page }) => {

        // ✅ STEP 1 — Interceptor first
        const getEmailPayload = await interceptEmailRoute(page, '**/api/submit-rent');

        // ✅ STEP 2 — Fill form
        await page.goto('/contact');
        await homePage.fetchRentCard('Dayz');
        await expect(page).toHaveURL(/\/car-for-rent\/.+/);
        await homePage.applyForRent();

        // ✅ STEP 3 — Submit and capture response atomically
        const [response] = await Promise.all([
          page.waitForResponse(res =>
            res.url().includes('/api/submit-rent') && res.request().method() === 'POST'
          ),
          homePage.clickSubmit(),
        ]);

        // ✅ STEP 4 — Parse API response
        const responseBody = await response.json();
        expect(responseBody.success).toBe(true);
        const documentId = responseBody.documentId ?? null;

        // ✅ STEP 5 — UI assertion (modal closed, alert visible)
        await homePage.postSubmitProcess();

        // ✅ STEP 6 — Email payload assertions (synchronous — already captured)
        const emailPayload = getEmailPayload();
        expect(emailPayload).not.toBeNull();
        expect(emailPayload.to).toBe('rehman.1992@hotmail.com');
        expect(emailPayload.subject).toContain('Application Received');

        // ✅ STEP 7 — GROQ validation last (async polling — slowest operation)
        const sanityDoc = documentId
          ? await waitForSubmission(querySubmissionById, documentId)
          : await waitForSubmission(querySubmissionByToken, submissionToken);

        expect(sanityDoc).toMatchObject({
          _type: 'userForms',
          customerName: 'John',
          carName: 'Dayz',
          email: 'rehman.1992@hotmail.com',
          rentDays: 3,
          status: 'pending',
        });
        expect(sanityDoc._createdAt).toBeDefined();

      });

      test('all cars from sanity appear on listings page', async ({ page }) => {

        const saleCars = [];
        const rentCars = [];
        // Step 1: Fetch all valid cars from Sanity
        const queryForSale = `*[_type == "carsforsale" && defined(slug.current)]{
            name,
            "slug": slug.current
        }`
        const cars4sale = await testClient.fetch(queryForSale);

        const queryForRent = `*[_type == "carsforrent" && defined(slug.current)]{
            name,
            "slug": slug.current
        }`
        const cars4rent = await testClient.fetch(queryForRent);
    
        for(let car of carsForSale){
          saleCars.push(car.name);
        }

        for(let item of cars4sale){
          expect(saleCars).toContain(item.name);

        }
        
        await expect(saleCars).toHaveLength(cars4sale.length)

        for(let car of carsForRent){
          rentCars.push(car.name);
        }

        for(let item of cars4rent){
          expect(rentCars).toContain(item.name);

        }
        
        await expect(rentCars).toHaveLength(cars4rent.length)

    })
})
