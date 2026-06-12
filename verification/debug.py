import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("http://localhost:5173")
        await page.wait_for_timeout(2000)

        await page.screenshot(path="verification/debug.png")
        html = await page.content()
        with open("verification/debug.html", "w") as f:
            f.write(html)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
