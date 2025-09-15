// IMPORT necessary classes
import { Planter } from './src/Planter.js';
import { UIManager } from './src/UIManager.js';

// ADD 'DOMContentLoaded' event listener to ensure the HTML is fully loaded
// before we try to interact with it.
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initial Setup ---

    // Create an initial or "default" configuration object.
    // This sets the starting state of the application.
    const initialConfig = {
        size: 32,
        palette: 'vaporwave',
        generator: 'symmetry',
        pixelSize: 15,
    };

    // Create the first Planter instance using this initial configuration.
    //  -- Note: This instance is primarily used to give the UIManager access
    //     to the lists of registered generators and palettes.
    const planter = new Planter(initialConfig);

    // --- 2. UI Initialization ---

    // Create a new instance of the UIManager, passing it the Planter instance.
    const uiManager = new UIManager(planter);

    // --- 3. Initial Artwork Generation ---

    // Call the UI manager's `handleGenerate` method once at the start.
    // This will perform the first draw on the screen using the default values
    // reflected in the UI, ensuring the page isn't blank on load.
    uiManager.handleGenerate();
});
