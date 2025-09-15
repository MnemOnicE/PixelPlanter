import { Planter } from './Planter.js';

// CLASS UIManager
// Manages the interaction between the HTML controls and the Planter instance.
export class UIManager {
    // PRIVATE PROPERTIES
    #planterInstance; // A reference to the main Planter object.
    #controls; // An object to hold references to all the HTML input elements.
    #canvasContainer; // The HTML element where the canvas will be displayed.

    // CONSTRUCTOR
    // PARAMETERS: planter (an instance of the Planter class)
    constructor(planter) {
        this.#planterInstance = planter;

        // Find and store all necessary DOM elements
        this.#controls = {
            generatorSelect: document.getElementById('generator-select'),
            paletteSelect: document.getElementById('palette-select'),
            sizeInput: document.getElementById('size-input'),
            pixelSizeInput: document.getElementById('pixel-size-input'),
            generateBtn: document.getElementById('generate-btn'),
        };
        this.#canvasContainer = document.getElementById('canvas-container');

        // Initialize the UI state
        this.#populateGeneratorOptions();
        this.#populatePaletteOptions();

        // Attach all the necessary event listeners
        this.#attachEventListeners();
    }

    // METHOD populateGeneratorOptions
    #populateGeneratorOptions() {
        const generatorNames = this.#planterInstance.getGeneratorNames();
        this.#controls.generatorSelect.innerHTML = ''; // Clear existing options

        generatorNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.#controls.generatorSelect.appendChild(option);
        });
    }

    // METHOD populatePaletteOptions
    #populatePaletteOptions() {
        const paletteNames = this.#planterInstance.getPaletteNames();
        this.#controls.paletteSelect.innerHTML = ''; // Clear existing options

        paletteNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.#controls.paletteSelect.appendChild(option);
        });
    }

    // METHOD attachEventListeners
    #attachEventListeners() {
        this.#controls.generateBtn.addEventListener('click', () => this.handleGenerate());
    }

    // METHOD handleGenerate
    // This is the core method that orchestrates the regeneration process.
    handleGenerate() {
        // Create a `config` object to hold the current settings from the UI.
        const config = {
            generator: this.#controls.generatorSelect.value,
            palette: this.#controls.paletteSelect.value,
            size: parseInt(this.#controls.sizeInput.value, 10),
            pixelSize: parseInt(this.#controls.pixelSizeInput.value, 10),
        };

        // Clear the canvas container of any previous canvas.
        this.#canvasContainer.innerHTML = '';

        // Create a NEW Planter instance using the `config` object from the UI.
        const newPlanter = new Planter(config);

        // Call the `generate()` method on the new Planter instance.
        newPlanter.generate();

        // Get the canvas element from the instance using `getCanvas()`.
        const canvas = newPlanter.getCanvas();

        // Append the new canvas to the canvas container element in the DOM.
        this.#canvasContainer.appendChild(canvas);
    }
}
