const DetailPage = require('../page-objects/DetailPage');
const { expect, test } = require('@playwright/test');
const { fetchCars, fetchCarsForSale, fetchCarsForRent, refToUrl } = require('../../helpers/sanity-api');
const { urlFor, client } = require('../../../lib/client');
const { testClient } = require('../../helpers/sanityTestClient');
const HomePage = require('../page-objects/HomePage');


test.describe('This will test all the features of the detail page', () => {

    let detailPage, carsForRent, carsForSale, homePage;

    test.beforeAll( async ({request}) => {
         carsForSale = await fetchCarsForSale(request);
         carsForRent = await fetchCarsForRent(request);
    })

    test.beforeEach(async ({page}) => {
        homePage = new HomePage(page)
        detailPage = new DetailPage(page);
        await page.goto('https://carlast.vercel.app/');
    })

    // test.afterAll(async ({page}) => {
    //     await page.close();
    // })

    test.skip('This will test all text is rendering correctly', async ({page}) => {

        for( let car of carsForSale){
            await detailPage.fetchCarData(car.name);
            await page.waitForTimeout(1000);
            const { name, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color, transmission, price, description } = await detailPage.verifyCarData();
            const finalPrice = Number(price.replace('$',''));
            expect(name).toBe(car.name);
            expect(Number(modelyear)).toBe(car.modelyear);
            expect(manufacturer).toBe(car.manufacturer);
            expect(Number(registrationyear)).toBe(car.registrationyear);
            expect(Number(mileage)).toBe(car.mileage);
            expect(Number(sittingcapacity)).toBe(car.sittingcapacity);
            expect(color).toBe(car.color);
            expect(transmission).toBe(car.transmission);
            expect(finalPrice).toBe(car.price);
            console.log('price is: ',finalPrice);
            expect(description).toBe(car.description);

            




            await page.goto('https://carlast.vercel.app/');
            await page.waitForTimeout(1000);
        }
        // const carName = await detailPage.fetchCarData('Geely Coolray');
        // expect(carName).toBe('Geely Coolray');
    })


    test('This is the master test, testing add to cart and checkout mechanism', async ({page}) => {
        
            let qty, checkout;
            let itemsPrice = [];
            await page.goto('https://carlast.vercel.app/car-for-sale/geely-coolray');
            const button = await page.locator('button', { hasText: 'Place Order'});
            await button.click();
            await page.locator('.MuiAlert-message').waitFor({ state: 'visible'});
            const message = await page.locator('.MuiAlert-message').innerText();
            console.log(message);
            expect(message).toContain('has been submitted');
            await page.waitForSelector('.cart-item-qty', { state: 'visible'});
            qty = await page.locator('.cart-item-qty').innerText();
            expect(Number(qty)).toBe(1);
            await page.waitForTimeout(1000);
            const closeBtn = await page.locator('button[aria-label="close"]');
            await closeBtn.click();
            await page.waitForTimeout(1000);
            await button.click();
            await page.waitForSelector('svg[data-testid="ErrorOutlineIcon"]', { state: 'visible'});
            await page.waitForTimeout(1000);
            qty = await page.locator('.cart-item-qty').innerText();
            const errAlertClose = await page.locator('div', { hasText: 'This vehicle already exists in the cart.'});
            // expect.skip(Number(qty)).toBe(1);
            if(await errAlertClose.first().isVisible()){
                await errAlertClose.first().click();
                const alertBar = await page.locator('div[role="alert"]');
                // expect(alertBar).toBeHidden();
            }
            const cart = await page.locator('button[aria-label="Cart"]');
            await cart.click();
            await page.waitForTimeout(1000);
            await page.locator('div').filter( { has: page.locator('div', { hasText: 'Geely Coolray'})}).locator('button', { hasText: 'Checkout!'}).waitFor({ state: 'visible'});
            const drawer = await page.locator('div').filter( { has: page.locator('div', { hasText: 'Geely Coolray'})}).locator('button', { hasText: 'Checkout!'});
            await page.locator('.MuiBackdrop-root').waitFor({state: 'visible'});
            const backDrop = await page.locator('.MuiBackdrop-root');
            await page.waitForTimeout(1000);
            await backDrop.click();
            await backDrop.waitFor({ state: 'hidden'});
            expect(drawer).toBeHidden();
            await cart.click();
    
            const carImageCount = await page.locator('.MuiGrid-item', { has: page.locator('img[class="cart-image"]')}).count();
            const carNameCount = await page.locator('.MuiGrid-item', { has: page.locator('h5', { hasText: 'Car Name:'})}).count();
            const carColorCount = await page.locator('.MuiGrid-item',{ has: page.locator('h5', { hasText: 'Color:'})}).count();
            const carPriceCount = await page.locator('.MuiGrid-item',{ has: page.locator('h5', { hasText: 'Price:'})}).count();
    
            await page.waitForTimeout(1000);
            checkout = await page.locator('button', { hasText: 'Checkout!'});
            await checkout.click();
            // await page.pause();  //
            // ✅ Fix — explicitly extend the timeout
            await page.waitForURL('https://carlast.vercel.app/cart');

            await page.locator('.MuiTable-root').waitFor({state: 'visible'});
    
            const subtotal = await page.locator('.MuiTableRow-root', { has: page.locator('td', { hasText: 'Subtotal'})});
            const subtotalValue = await subtotal.locator('.MuiTableCell-alignRight').innerText();
            // const actualValue = await subtotalValue.innerText();
            console.log('Subtotal is: ',subtotalValue);
    
            const cartItems = await page.locator('.MuiTableRow-root', { has: page.locator('img[class="cart-image"]')});
            const itemsCount = await page.locator('.MuiTableRow-root', { has: page.locator('img[class="cart-image"]')}).count();
            // const price = await cartItems.locator('td').last().innerText();
            // console.log(price);
            for(let i=0; i < itemsCount; i++){
                const priceData = await cartItems.nth(i).locator('td').last();
                const price = await priceData.innerText();
                // console.log('Price is: ',price);
                itemsPrice.push(parseFloat(price));
            }
    
            const priceTotal = itemsPrice.reduce((sum, current) => sum + current, 0);
            const totalPrice = parseFloat(priceTotal).toFixed(2)
            console.log(totalPrice); 
            // expect(totalPrice).toBe(subtotalValue);
    
            const emptyCart = await page.locator('button', { hasText: 'Empty Cart'});
            checkout = await page.locator('button', { hasText: 'Checkout'}).first();
            // if(emptyCart.isVisible()){
            //     await emptyCart.click();
            //     const emptyMessage = await page.locator('table', {has: page.locator('h5', { hasText: 'No Product Found'})});
            //     expect(emptyMessage).toBeVisible();
            // }

            if(checkout.isVisible()){
                await checkout.click();
            }
            
            await page.waitForURL('https://carlast.vercel.app/billingandshipping');
            
      
    })

    test('This will test the car detail page based on a pre-defined slug', async () => {

        const slug = 'geely-coolray';
        const carName = await detailPage.testSlug(slug);
        await expect(carName).toContain("Geely Coolray");
    })

    test('missing slug returns 404 not 500', async ({ page }) => {
        const response = await page.goto('https://carlast.vercel.app/car-for-sale/non-existent-slug-xyz')
        expect(response.status()).toBe(404)
    })

    test('fetches cars with valid slugs only', async () => {
        const query = `*[_type == "carsforsale" && defined(slug.current)]{slug{ current }}`
        const cars = await client.fetch(query)
    
        cars.forEach(car => {
            expect(car.slug).not.toBeNull()
            expect(car.slug.current).toBeTruthy()
            expect(typeof car.slug.current).toBe('string')
        })
    })
    
    test('fetches a specific car by slug', async () => {
        const slug = 'geely-coolray'
        const query = `*[_type == "carsforsale" && slug.current == '${slug}'][0]`
        const car = await client.fetch(query)
    
        expect(car).not.toBeNull()
        expect(car.slug.current).toBe(slug)
    })

    test('single car page matches sanity document', async ({ page }) => {

        // Step 1: Fetch the document directly from Sanity via GROQ
        const query = `*[_type == "carsforsale" && slug.current == "geely-coolray"][0]{
            name,
            price,
            modelyear,
            mileage,
            manufacturer,
            registrationyear,
            sittingcapacity,
            color,
            transmission,
            description,
            "slug": slug.current,
            "imageUrl": image.asset->url
        }`
        const car = await testClient.fetch(query)
    
        // Step 2: Visit that car's page on the frontend
        await page.goto(`https://carlast.vercel.app/car-for-sale/${car.slug}`)
        
        // Step 3: Compare each field visually
        const { name, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color, transmission, price, description } = await detailPage.verifyCarData();

        const finalPrice = Number(price.replace('$',''));
        expect(name).toBe(car.name);
        expect(Number(modelyear)).toBe(car.modelyear);
        expect(manufacturer).toBe(car.manufacturer);
        expect(Number(registrationyear)).toBe(car.registrationyear);
        expect(Number(mileage)).toBe(car.mileage);
        expect(Number(sittingcapacity)).toBe(car.sittingcapacity);
        expect(color).toBe(car.color);
        expect(transmission).toBe(car.transmission);
        expect(finalPrice).toBe(car.price);
        expect(description).toBe(car.description);
    
        // Step 4: Check image is rendered with correct source
        // const image = page.locator(`img[src*="${car.imageUrl}"]`)
        // await expect(image).toBeVisible()
    })


    test.skip('This will test if images are rendering correctly', async () => {

            
        for( let car of carsForSale){

            const sanityImageUrls  = car.images.map(img =>  refToUrl(img.asset._ref));
            const sanityAssetIds  = sanityImageUrls.map(url => homePage.extractAssetId(url));
            const frontendSrc     = await detailPage.getBigImageSrc();
            const frontendSliderSrc = await detailPage.getSmallImagesSrc();
            const frontendAssetId = homePage.extractAssetId(frontendSrc);
            const frontendSliderAssetId = homePage.extractAssetId(frontendSliderSrc);
            expect(sanityAssetIds).toContain(frontendAssetId);
            expect(sanityAssetIds).toContain(frontendSliderAssetId);
        }
        

    })
})