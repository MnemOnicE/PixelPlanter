
import sys
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Open the local server
    page.goto("http://localhost:8000/index.html")

    # Disable onboarding tour
    page.evaluate("localStorage.setItem('pixelPlanterOnboarded', 'true');")
    page.reload() # Reload to apply the localstorage setting

    # 1. Switch to Advanced Mode
    print("Switching to Advanced Mode...")
    # Click the checkbox directly or the label, forcing interaction if needed
    page.click("label[for='mode-toggle'].advanced", force=True)

    # Verify 'Asset Factory' button is visible
    factory_btn = page.locator("#show-factory-btn")
    if factory_btn.is_visible():
        print("Asset Factory button is visible.")
    else:
        print("ERROR: Asset Factory button is NOT visible.")
        sys.exit(1)

    # 2. Open Modal
    print("Opening Asset Factory Modal...")
    factory_btn.click()

    modal = page.locator("#factory-modal")
    if modal.is_visible():
        print("Modal opened successfully.")
    else:
        print("ERROR: Modal did not open.")
        sys.exit(1)

    # 3. Click Generate
    print("Clicking Generate...")

    # Setup download listener
    with page.expect_download() as download_info:
        page.click("#factory-generate-btn")

    download = download_info.value
    print(f"Download initiated: {download.suggested_filename}")

    # Save to verification folder
    download.save_as("verification/sprite_sheet.png")
    print("Sprite sheet saved to verification/sprite_sheet.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
