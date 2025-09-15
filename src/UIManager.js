import { Planter } from './Planter.js';

// CLASS UIManager
// Manages the interaction between the HTML controls and the Planter instance.
export class UIManager {
    // PRIVATE PROPERTIES
    #planterInstance; // A reference to the main Planter object.
    #controls; // An object to hold references to all the HTML input elements.
    #canvasContainer; // The HTML element where the canvas will be displayed.
    #modifiersContainer;
    #currentCanvas;
    #currentSeed;

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
            seedInput: document.getElementById('seed-input'),
            generateBtn: document.getElementById('generate-btn'),
            saveBtn: document.getElementById('save-btn'),
        };
        this.#canvasContainer = document.getElementById('canvas-container');
        this.#modifiersContainer = document.getElementById('modifiers-container');

        // Initialize the UI state
        this.#populateGeneratorOptions();
        this.#populatePaletteOptions();
        this.#populateModifierOptions();

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

    // METHOD populateModifierOptions
    #populateModifierOptions() {
        const modifierNames = this.#planterInstance.getModifierNames();
        this.#modifiersContainer.innerHTML = ''; // Clear existing options

        modifierNames.forEach(name => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `mod-${name}`;
            checkbox.dataset.modifierName = name;

            const label = document.createElement('label');
            label.htmlFor = `mod-${name}`;
            label.textContent = name;

            div.appendChild(checkbox);
            div.appendChild(label);
            this.#modifiersContainer.appendChild(div);
        });
    }

    // METHOD attachEventListeners
    #attachEventListeners() {
        this.#controls.generateBtn.addEventListener('click', () => this.handleGenerate());
        this.#controls.saveBtn.addEventListener('click', () => this.handleSave());
    }

    // METHOD handleGenerate
    // This is the core method that orchestrates the regeneration process.
    handleGenerate() {
        // --- NEW LOGIC for gathering active modifiers ---
        const activeModifiers = [];
        const modifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]');
        modifierCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                activeModifiers.push({
                    name: checkbox.dataset.modifierName,
                });
            }
        });

        // Create a `config` object to hold the current settings from the UI.
        const seedValue = this.#controls.seedInput.value;
        const config = {
            generator: this.#controls.generatorSelect.value,
            palette: this.#controls.paletteSelect.value,
            size: parseInt(this.#controls.sizeInput.value, 10),
            pixelSize: parseInt(this.#controls.pixelSizeInput.value, 10),
            modifiers: activeModifiers,
            seed: seedValue ? (isNaN(parseInt(seedValue, 10)) ? seedValue : parseInt(seedValue, 10)) : Date.now(),
        };

        // Clear the canvas container of any previous canvas.
        this.#canvasContainer.innerHTML = '';

        // Create a NEW Planter instance using the `config` object from the UI.
        const newPlanter = new Planter(config);

        // Call the `generate()` method on the new Planter instance.
        newPlanter.generate();

        // Get the canvas element from the instance using `getCanvas()`.
        const canvas = newPlanter.getCanvas();

        // Store a reference to the canvas and seed for the save function to use.
        this.#currentCanvas = canvas;
        this.#currentSeed = config.seed;

        // Append the new canvas to the canvas container element in the DOM.
        this.#canvasContainer.appendChild(canvas);
    }

    // METHOD handleSave
    handleSave() {
        if (!this.#currentCanvas) {
            console.error('No canvas to save.');
            return;
        }

        const link = document.createElement('a');
        link.href = this.#currentCanvas.toDataURL('image/png');
        link.download = `pixel-art-seed-${this.#currentSeed}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
