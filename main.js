// IMPORT necessary classes
import { UIManager } from './src/UIManager.js';

// ADD 'DOMContentLoaded' event listener to ensure the HTML is fully loaded
// before we try to interact with it.
document.addEventListener('DOMContentLoaded', () => {
    // The new UIManager now handles the creation of the Planter instance
    // and the initial generation, so we just need to create it.
    new UIManager();
});
