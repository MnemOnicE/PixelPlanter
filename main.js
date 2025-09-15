import { Planter } from './src/Planter.js';

// Wrap the execution code inside this event listener
document.addEventListener('DOMContentLoaded', () => {
    // Create a new planter instance with the 'vaporwave' palette
    const art = new Planter({
        size: 32,
        palette: 'vaporwave',
        pixelSize: 15,
    });

    // Generate the artwork and get the canvas element
    const mySprite = art.generate().getCanvas();

    // Add it to the body of your HTML page
    document.body.appendChild(mySprite);
});
