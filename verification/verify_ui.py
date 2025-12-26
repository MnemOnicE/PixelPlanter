from playwright.sync_api import sync_playwright

def verify_zone_layer_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # Bypass the onboarding tour
        page.evaluate("localStorage.setItem('pixelPlanterOnboarded', 'true')")
        page.reload()

        # Wait for the UI to be ready
        page.wait_for_selector("#add-layer-btn")

        # Switch to Advanced Mode
        # Use a more specific selector if needed, or force click
        advanced_label = page.locator("label[for='mode-toggle'].advanced")
        advanced_label.click(force=True)

        # Add a new layer
        page.click("#add-layer-btn")

        # Find the layer item
        # The UI appends new layers to the list.
        # Wait for a new layer item to appear.
        page.wait_for_selector(".layer-item")

        # There might be multiple layers now (initial + added).
        # We want to interact with one.
        layer_items = page.locator(".layer-item")
        first_layer = layer_items.first

        # Make sure the layer controls are visible (clicking the item expands it usually, or it's always visible in this CSS?)
        # Looking at CSS: .layer-item-controls { display: none; } ... .layer-item.active .layer-item-controls { display: flex; }
        # Adding a layer makes it active automatically in UIManager.js (#handleAddLayer calls #setActiveLayer)

        # Change its type to 'zone'
        type_select = first_layer.locator(".layer-type-select")
        # Ensure it's visible
        if not type_select.is_visible():
            first_layer.click()

        type_select.select_option("zone")

        # Wait a moment for DOM update
        page.wait_for_timeout(500)

        # Check if the class 'zone-layer' is applied
        # We verify this visually via screenshot

        # Take a screenshot of the layer panel
        # We capture the whole layer panel
        page.locator("#layer-panel").screenshot(path="verification/zone_layer_ui.png")

        browser.close()

if __name__ == "__main__":
    verify_zone_layer_ui()
