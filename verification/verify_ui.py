
from playwright.sync_api import sync_playwright

def verify_ui_refactor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (default vite port is usually 5173, but let's check output or try 5173)
        # Since I ran it in background without checking output, I'll assume 5173 or 3000.
        # I'll try 5173 first as it's vite default.
        try:
            page.goto("http://localhost:5173")
        except:
             try:
                 page.goto("http://localhost:3000")
             except:
                 print("Could not connect to localhost:5173 or 3000")
                 return

        # Wait for the app to load
        page.wait_for_selector("#layer-list")

        # Verify layer items exist
        layers = page.locator(".layer-item")
        count = layers.count()
        print(f"Found {count} layers")

        # Verify drawing works (CanvasInput)
        # Get canvas bounds
        canvas = page.locator("#canvas-container canvas")
        box = canvas.bounding_box()

        # Simulate a brush stroke
        page.mouse.move(box["x"] + 100, box["y"] + 100)
        page.mouse.down()
        page.mouse.move(box["x"] + 150, box["y"] + 150)
        page.mouse.up()

        # Take a screenshot
        page.screenshot(path="verification/ui_refactor.png")
        print("Screenshot saved to verification/ui_refactor.png")

        browser.close()

if __name__ == "__main__":
    verify_ui_refactor()
