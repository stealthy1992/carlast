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

    async addingCar(car){

        let dialogueCard;
        let isSearching = true;

        console.log(car);
        await this.page.locator('#carsforsale-carsforsale-0').waitFor({state: 'visible'});
        await this.page.getByTestId('action-intent-button').click();
        const form = this.page.locator('form[data-as="form"]');
        await form.waitFor({ state: 'visible' });

        await form.locator('[data-testid="input-name"] input').fill(car.name);
        await form.locator('[data-testid="input-modelyear"] input').fill(String(car.modelyear));
        await form.locator('[data-testid="input-manufacturer"] input').fill(car.manufacturer);
        await form.locator('[data-testid="input-registrationyear"] input').fill(String(car.registrationyear));
        await form.locator('[data-testid="input-mileage"] input').fill(String(car.mileage));
        await form.locator('[data-testid="input-sittingcapacity"] input').fill(String(car.sittingcapacity));
        await form.locator('[data-testid="input-color"] input').fill(car.color);
        await form.locator('[data-testid="input-price"] input').fill(String(car.price));
        await form.locator('button', { hasText: 'Add item'}).click();
        await this.page.locator('[data-ui="DialogCard"]').waitFor({ state: 'visible'});
        dialogueCard = await this.page.locator('[data-ui="DialogCard"]');
        await dialogueCard.locator('[data-testid="file-input-multi-browse-button"]').click();
        // await this.page.locator('div', { name: 'ImageInput4_assetImageButton'}).waitFor({state: 'visible'});
        await this.page.locator('[data-testid="file-input-browse-button-media"]').waitFor({ state: 'visible'});
        await this.page.locator('[data-testid="file-input-browse-button-media"]').click();
        // await this.page.locator('div', { has: this.page.locator('button', { hasText: 'Upload images'})}).waitFor({ state: 'visible'});
        // await this.page.locator('div[data-scheme="dark"]').first().waitFor({state: 'visible'});
        // await this.page.locator('[data-test-id="virtuoso-scroller"]').waitFor({ state: 'visible'});
        // const gallery = await this.page.locator('[data-test-id="virtuoso-scroller"]');
        await this.page.locator('.virtuoso-grid-list').waitFor({ state: 'visible'});
        const gallery = await this.page.locator('.virtuoso-grid-list');
        const images = await gallery.locator('.virtuoso-grid-item');
        const imageCount = await gallery.locator('.virtuoso-grid-item').count();
        // const imageTitle = car.image.trim();
        console.log('idenfied images are: ',imageCount);
     
        for(let i=0; i < imageCount; i++){
            const imageName = await images.nth(i).innerText();
            const trimmed = imageName.trim();
            console.log('image is: ',trimmed);
            if(trimmed == car.image){
                console.log('matched');
                await images.nth(i).click();
                await this.page.waitForTimeout(500);
                break; 
            }                  
         }
        
        
        await this.page.locator('[data-ui="DialogCard"]', { hasText: 'Edit Image'}).waitFor({ state: 'visible'});
        dialogueCard = await this.page.locator('[data-ui="DialogCard"]', { hasText: 'Edit Image'});
        await dialogueCard.locator('[aria-label="Close dialog"]').click();
        await form.locator('button', { hasText: 'Generate'}).click();
        const slug = await form.locator('[data-testid="input-slug"] input');
        await expect(slug).not.toHaveValue('');
        await form.locator('[data-testid="input-description"] input').fill(car.description);
        await this.page.locator('[data-testid="action-Publish"]').click();
        
        await this.page.waitForSelector(
        '[data-testid="action-Publish"][data-disabled="true"]',
        { state: 'visible', timeout: 15000 }
        );

        // Step 3: Wait for the button to fully transition to "Published" 
        // (disabled=true as a real HTML attribute, not just data-disabled)
        await this.page.waitForSelector(
        '[data-testid="action-Publish"][disabled]',
        { state: 'visible', timeout: 15000 }
        );

        // Step 4: Wait for the success toast to appear
        await this.page.waitForSelector(
        'text="The document was published"',
        { state: 'visible', timeout: 10000 }
        );
    }
}

module.exports=DashboardPage