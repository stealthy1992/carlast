const BasePage = require('./BasePage');
const { expect} = require('@playwright/test');

class HomePage extends BasePage{
    constructor(page){
        super(page);
        this.page = page;
        this.selectors = {
            carsForSale: this.page.locator('.products-container', { has: this.page.locator('button', { hasText: 'Buy Now'})}),
            carsForRent: this.page.locator('.products-container', { has: this.page.locator('button', { hasText: 'Rent Now'})}),
            image: this.page.locator('.products-container img'),
            rentButton: this.page.locator('button', { hasText: 'Apply for Rent'}),
            rentForm: this.page.locator('form', { has: this.page.locator('h2', { hasText: 'Customer Information'})}),


           
        }
    }

    async forSaleCarsCount(){
             
        return await this.selectors.carsForSale.locator('.MuiGrid-item').count();
    }

    async fetchSaleCard(carName){
        const buttonCard = await this.page.locator('button', { has: this.page.locator('div', { hasText: carName})});
        await buttonCard.click();
        const heading = await this.page.locator('h1').innerText();
        return heading;
    }

    async fetchRentCard(carName){
        const buttonCard = await this.page.locator('button', { has: this.page.locator('div', { hasText: carName})});
        await buttonCard.click();
        const heading = await this.page.locator('h1').innerText();
        return heading;

    }

    async getCarsForSale(carName){
        return await this.selectors.carsForSale.locator('.MuiGrid-item', { hasText: carName});
    }

    async forRentCarsCount(){

        return await this.selectors.carsForRent.locator('.MuiGrid-item').count();
    }

    async getCarsForRent(carName){
        return await this.selectors.carsForRent.locator('.MuiGrid-item', { hasText: carName});
    }

    async getSaleCarPrice(carName){
        const carPrice = await this.selectors.carsForSale.locator('.MuiGrid-item', { hasText: carName }).locator('p');
        const price = carPrice.innerText();
        return price;
    }

    async getRentPrice(carName){
        const carRent = await this.selectors.carsForRent.locator('.MuiGrid-item', { hasText: carName}).locator('p');
        const rent = carRent.innerText();
        return rent;
    }

    async getFirstImageSrcForCar(carName) {
        const card = await this.selectors.carsForSale
          .locator('.MuiGrid-item', { hasText: carName });
    
        return card.locator('img').first().getAttribute('src');
      }

    extractAssetId(url) {
        console.log('url is: ',url);
        if (!url) return null;
        const filename = url.split('/').pop();  // "fea05cad-3345x2040.jpg?w=800"
        const withoutQuery = filename.split('?')[0]; // "fea05cad-3345x2040.jpg"
        const assetId = withoutQuery.split('-')[0];  // "fea05cad"
        return assetId;
    }

    async applyForRent(customerName, email, rentDays, certificatePath){
        await this.selectors.rentButton.click();
        await this.selectors.rentForm.waitFor({ state: 'visible'});
        const formFields = await this.selectors.rentForm.locator('.MuiFormControl-root');
        // console.log('Field count is: ',formFields);
        await formFields.filter({ hasText: 'Full Name'}).locator('input').fill(customerName);
        await formFields.filter({ hasText: 'Email Address'}).locator('input').fill(email);
        await formFields.filter({ hasText: 'Rent Days'}).locator('div[role="button"]').click();
        await this.page.locator('ul').waitFor({ state: 'visible'});
        await this.page.locator('ul > li', { hasText: rentDays}).click();
        // Locate the file input element and set the file
        await this.page.locator('input[type="file"]').setInputFiles(
            certificatePath   
        );
        // await expect(this.page.locator('input[type="file"]')).toHaveValue(/mg-5-essence/)

    }

    async clickSubmit(){
        await this.page.locator('input[type="submit"]').click();
        
    }

    async postSubmitProcess(){
        await this.selectors.rentForm.waitFor({ state: 'hidden'});
        await this.page.locator('div[role="alert"]').waitFor({ state: 'visible'});
        await this.page.locator('button[aria-label="close"]').click();
    }

    

}

module.exports = HomePage