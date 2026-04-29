const BasePage = require('./BasePage');

class HomePage extends BasePage{
    constructor(page){
        super(page);
        this.page = page;
        this.selectors = {
            carsForSale: this.page.locator('.products-container', { has: this.page.locator('button', { hasText: 'Buy Now'})}),
            carsForRent: this.page.locator('.products-container', { has: this.page.locator('button', { hasText: 'Rent Now'})}),
            image: this.page.locator('.products-container img'),
           
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

}

module.exports = HomePage