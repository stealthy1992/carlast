const BasePage = require("./BasePage");
const { expect } = require('@playwright/test');

class DashboardPage extends BasePage{
    constructor(page){
        super(page);
        this.page = page;
        this.selectors = {

        }
    }

    async selectCategory(){
        await this.clickSidebarItem();
    }

    async addingCar(){

        await this.page.locator('#carsforsale-carsforsale-0').waitFor({state: 'visible'});
        await this.page.getByTestId('action-intent-button').click();
        const form = this.page.locator('form[data-as="form"]');
        await form.waitFor({ state: 'visible' });

        await form.locator('[data-testid="input-name"] input').fill('Toyota Corolla');
        await form.locator('[data-testid="input-modelyear"] input').fill('2022');
        await form.locator('[data-testid="input-manufacturer"] input').fill('Toyota');
        await form.locator('[data-testid="input-registrationyear"] input').fill('2022');
        await form.locator('[data-testid="input-mileage"] input').fill('15000');
        await form.locator('[data-testid="input-sittingcapacity"] input').fill('5');
        await form.locator('[data-testid="input-color"] input').fill('White');
        await form.locator('[data-testid="input-price"] input').fill('25000');
        await form.locator('button', { hasText: 'Add item'}).click();
        await this.page.locator('[data-ui="DialogCard"]').waitFor({ state: 'visible'});
        const dialogueCard = await this.page.locator('[data-ui="DialogCard"]');
        // Set the file
        const fileInput = this.page.locator('input[type="file"]');
        await fileInput.waitFor({ state: 'attached' });
        await fileInput.setInputFiles('C:/Users/Rehman/Downloads/carImage.webp');
        // await dialogueCard.locator('[data-testid="file-input-upload-button"]').click();
        await dialogueCard.locator('[data-testid="hotspot-image-input"]').waitFor({ state: 'visible'});
        await dialogueCard.locator('[aria-label="Close dialog"]').click();
        await form.locator('button', { hasText: 'Generate'}).click();
        const slug = await form.locator('[data-testid="input-slug"] input');
        await expect(slug).not.toHaveValue('');
        await form.locator('[data-testid="input-description"] input').fill('Well maintained car');
        await this.page.locator('[data-testid="action-Publish"]').click();
    }
}

module.exports=DashboardPage