class BasePage{
    constructor(page){
        this.page = page;
        this.selectors = {
            sidebar:  this.page.getByTestId('pane-content'),
            carsForSale: this.page.locator('a', { has: this.page.locator('div', { hasText: 'Cars For Sale'})}),
            carsForRent: this.page.locator('a', { has: this.page.locator('div', { hasText: 'Cars For Rent'})}),
        }
    }

    async clickSidebarItem(){
        // await this.selectors.carsForSale;
        await this.page.locator('a[href="/desk/carsforsale"]').click();

        // await this.selectors.carsForSale.click();
    }
}

module.exports=BasePage