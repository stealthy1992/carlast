const BasePage = require("./BasePage");
const { expect } = require('@playwright/test');

class DashboardPage extends BasePage{
    constructor(page){
        super(page);
        this.page = page;
        this.selectors = {

        }
    }

    async selectCategory(category){
        await this.clickSidebarItem(category);
    }

    // ─────────────────────────────────────────────────────────────────
    // Scrolls through the Virtuoso gallery until it finds the image
    // matching car.image, then clicks it.
    //
    // WHY THIS IS NEEDED:
    // Virtuoso is a virtual scroller — it only renders items currently
    // visible in the viewport. Your original loop only iterated over
    // whatever was rendered at load time. If the matching image was
    // below the fold, the loop completed without finding it and no
    // image got attached — silently, with no error thrown.
    //
    // HOW THE FIX WORKS:
    // 1. After each full pass over currently-rendered items, it scrolls
    //    the gallery container down by one viewport height.
    // 2. It waits briefly for Virtuoso to render the newly visible items.
    // 3. It repeats until the image is found OR the gallery stops
    //    producing new items after a scroll (meaning we've reached the
    //    bottom without a match).
    // 4. If no match is found after exhausting the gallery, it throws a
    //    clear error so the test fails loudly rather than silently
    //    publishing a document with no image attached.
    // ─────────────────────────────────────────────────────────────────
    async findAndSelectImage(car) {
        const scrollContainer = this.page.locator('[data-test-id="virtuoso-scroller"]');
        const gallery         = this.page.locator('.virtuoso-grid-list');
        const imageTarget     = car.image.trim();

        let found            = false;
        let previousCount    = -1;
        const MAX_SCROLLS    = 50; // safety cap — prevents infinite loop
        let scrollAttempts   = 0;

        console.log(`🔍 Searching gallery for image: "${imageTarget}"`);

        while (!found && scrollAttempts < MAX_SCROLLS) {

            // Get all currently-rendered grid items
            const items      = gallery.locator('.virtuoso-grid-item');
            const itemCount  = await items.count();

            console.log(`  Scroll attempt ${scrollAttempts + 1} — rendered items: ${itemCount}`);

            // Loop over every currently-rendered item
            for (let i = 0; i < itemCount; i++) {
                const rawText  = await items.nth(i).innerText();
                const trimmed  = rawText.trim();

                if (trimmed.includes(imageTarget)) {
                    console.log(`  ✅ Matched: "${trimmed}" — clicking`);
                    await items.nth(i).click();
                    await this.page.waitForTimeout(500);
                    found = true;
                    break;
                }
            }

            if (found) break;

            // Check if scrolling produced new items — if count is the
            // same as last scroll, we've hit the bottom of the gallery
            if (itemCount === previousCount) {
                console.error(`  ❌ Reached end of gallery without finding "${imageTarget}"`);
                break;
            }

            previousCount = itemCount;

            // Scroll the Virtuoso container down by one viewport height
            await scrollContainer.evaluate(el => {
                el.scrollTop += el.clientHeight;
            });

            // Wait for Virtuoso to render newly visible items
            await this.page.waitForTimeout(400);
            scrollAttempts++;
        }

        if (!found) {
            throw new Error(
                `Image "${imageTarget}" was not found in the Sanity Media gallery. ` +
                `Check that the image is uploaded in your Sanity studio with exactly this filename.`
            );
        }
    }

    async addingCar(car, category){

        let dialogueCard;

        console.log(car, category);
        await this.page.locator(`#${category}-${category}-0`).waitFor({state: 'visible'});
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
        if(category == 'carsforsale'){
            await form.locator('[data-testid="input-price"] input').fill(String(car.price));
        }
        else{
            await form.locator('[data-testid="input-rent"] input').fill(String(car.rent));
        }
        
        await form.locator('button', { hasText: 'Add item'}).click();
        await this.page.locator('[data-ui="DialogCard"]').waitFor({ state: 'visible'});
        dialogueCard = await this.page.locator('[data-ui="DialogCard"]');
        await dialogueCard.locator('[data-testid="file-input-multi-browse-button"]').click();

        await this.page.locator('[data-testid="file-input-browse-button-media"]').waitFor({ state: 'visible'});
        await this.page.locator('[data-testid="file-input-browse-button-media"]').click();

        // Wait for the Virtuoso gallery to render its initial items
        await this.page.locator('.virtuoso-grid-list').waitFor({ state: 'visible'});

        // ✅ Replaced original static loop with scroll-aware image finder
        await this.findAndSelectImage(car);

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
            { state: 'visible' }
        );

        await this.page.waitForSelector(
            '[data-testid="action-Publish"][disabled]',
            { state: 'visible' }
        );

        await this.page.waitForSelector(
            'text="The document was published"',
            { state: 'visible' }
        );
    }
}

module.exports=DashboardPage