
from playwright.sync_api import sync_playwright

def verify_ui_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to a desktop size to verify the 3-column layout
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        # Navigate to the local server
        page.goto("http://localhost:8000/index.html")

        # Disable onboarding tour if it appears (set localStorage)
        page.evaluate("localStorage.setItem('pixelPlanterOnboarded', 'true')")
        page.reload()

        # Wait for key elements to ensure layout is loaded
        page.wait_for_selector("#sidebar-left")
        page.wait_for_selector("#stage")
        page.wait_for_selector("#sidebar-right")

        # Take a screenshot of the Desktop layout
        page.screenshot(path="verification/desktop_layout.png")
        print("Desktop screenshot taken.")

        # --- Mobile Verification ---
        # Resize viewport to mobile
        page.set_viewport_size({'width': 375, 'height': 667})
        page.reload() # Reload to ensure CSS media queries apply cleanly if needed

        # Wait for mobile toolbar
        page.wait_for_selector("#mobile-toolbar")

        # Take a screenshot of the Mobile layout (initial state)
        page.screenshot(path="verification/mobile_initial.png")
        print("Mobile initial screenshot taken.")

        # Interact: Open Left Sidebar
        page.click("#toggle-left-sidebar")
        # Wait for transition/animation if any (simple wait here)
        page.wait_for_timeout(500)
        page.screenshot(path="verification/mobile_left_drawer.png")
        print("Mobile left drawer screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_ui_layout()
