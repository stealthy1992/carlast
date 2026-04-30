const BasePage = require('../page-objects/BasePage');

class DetailPage extends BasePage{

    constructor(page){
        super(page);
        this.page=page;
        this.selectors = {
            forSaleContainer: this.page.locator('.products-container', { has: this.page.locator('button', { hasText: 'Buy Now'})}),
            forRentContainer: this.page.locator('.products-container', { has: this.page.locator('button', { hasText: 'Rent Now'})}),
            carTitle: this.page.locator('h1'),
            carSpecHeadings: this.page.locator('h4'),
            carSpecs: this.page.locator('p')
        }
    }

    async fetchCarData(carName){
        // return await this.selectors.carTitle.innerText();
        const button = await this.page.locator('button', { has: this.page.locator('div', { hasText: carName})});
        await button.click();

    }

    async verifyCarData(){
        const name = await this.selectors.carTitle.innerText();
        const model = await this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Model Year'})});
        const modelyear = await model.locator('> p').innerText();
        const manufacturerSection = await this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Manufacturer'})}).locator('> p');
        const manufacturer = await manufacturerSection.innerText();
        const registrationyearSection = await this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Registration Year'})}).locator('> p');
        const registrationyear = await registrationyearSection.innerText();
        const mileageSection = await this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Mileage'})}).locator('> p');
        const mileage = await mileageSection.innerText();
        const sittingcapacitySection = this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Sitting Capacity'})}).locator('> p');
        const sittingcapacity = await sittingcapacitySection.innerText();
        const colorSection = await this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Color'})}).locator('> p');
        const color = await colorSection.innerText();
        const transmissionSection = this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Transmission'})}).locator('> p');
        const transmission = await transmissionSection.innerText();
        const priceSection = await this.page.locator('.product-detail-desc').last();
        const price = await priceSection.locator('> p').innerText();
        const descriptionSection = await this.page.locator('div', { has: this.page.locator('h4', { hasText: 'Details'})}).locator('> p');
        const description = await descriptionSection.innerText();

        return { name, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color, transmission, price, description };
    
    }

    async getBigImageSrc() {
        const card = await this.page.locator('.image-container');
    
        return card.locator('img').getAttribute('src');
    }

    async getSmallImagesSrc(){
        const srcList = [];
        const imgSlider = await this.page.locator('.small-images-container');
        const images = await imgSlider.locator('img').all();

        for(let img of images){
            srcList.push(await img.getAttribute('src'));
        }

        return srcList;
    }

    async testSlug(slug){
        await this.page.goto(`https://carlast.vercel.app/car-for-sale/${slug}`);
        return await this.selectors.carTitle.innerText();
        
    }

}

module.exports=DetailPage