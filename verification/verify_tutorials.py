import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to the local dev server
        await page.goto("http://localhost:5173")

        # Wait for the app to load
        await page.wait_for_selector("#show-tutorials-btn")

        # Click the Tutorials button
        await page.click("#show-tutorials-btn")

        # Wait for the modal to be visible
        await page.wait_for_selector("#tutorials-modal", state="visible")
        print("Tutorials modal opened successfully.")

        # Take screenshot of the modal
        await page.screenshot(path="verification/tutorials_modal.png")

        # Wait for tutorial cards to load from JSON
        await page.wait_for_selector(".tutorial-item")
        print("Tutorial cards loaded successfully.")

        # Click the "basic-sprite" tutorial card
        await page.click(".tutorial-item[data-id='basic-sprite']")

        # Wait for the driver.js popover to appear
        await page.wait_for_selector(".driver-popover", state="visible")
        print("Tutorial driver popover opened successfully.")

        # Take a screenshot of the driver active state
        await page.screenshot(path="verification/driver_active.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
