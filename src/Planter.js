import { SymmetryGenerator } from './generators/SymmetryGenerator.js';
import { AdvancedSymmetryGenerator } from './generators/AdvancedSymmetryGenerator.js';
import { RecursiveGrowthGenerator } from './generators/RecursiveGrowthGenerator.js';
import { MonochromePalette } from './palettes/MonochromePalette.js';
import { VaporwavePalette, ForestPalette } from './palettes/ColorPalettes.js';
import { OutlineModifier } from './modifiers/OutlineModifier.js';
import { DensityMaskModifier } from './modifiers/DensityMaskModifier.js';
import { SeededRandom } from './utils/PRNG.js';

/**
 * @class Planter
 * The main class for the Pixel Planter library. This class orchestrates the entire
 * generative process, from setting up the canvas to applying generators and palettes.
 */
export class Planter {
    /**
     * The HTMLCanvasElement used for drawing.
     * @private
     * @type {HTMLCanvasElement}
     */
    #canvas;

    /**
     * The 2D rendering context of the canvas.
     * @private
     * @type {CanvasRenderingContext2D}
     */
    #context;

    /**
     * Configuration options for the generation process.
     * @private
     * @type {object}
     */
    #config;

    /**
     * A registry to hold all available generator modules.
     * This allows for easy extension by adding new generators.
     *
     * @private
     * @type {Map<string, object>}
     *
     * @potential_datastructure A 'Map' is ideal here. It provides a simple key-value store
     * with O(1) average time complexity for adding ('set') and retrieving ('get') modules.
     * The key would be the generator's name (e.g., 'symmetry'), and the value would be
     * the generator object/class itself.
     */
    #generatorRegistry = new Map();

    /**
     * A registry to hold all available palette modules.
     *
     * @private
     * @type {Map<string, object>}
     */
    #paletteRegistry = new Map();

    /**
     * A registry for all available modifier modules.
     * @private
     * @type {Map<string, object>}
     */
    #modifierRegistry = new Map();


    /**
     * Creates an instance of the Planter class.
     * @param {object} config - The configuration object.
     * @param {Array<object>} [config.modifiers=[]] - An array of modifier configs to apply.
     */
    constructor(config = {}) {
        this.#config = {
            size: 16,
            generator: 'advanced-symmetry',
            symmetryMode: 'vertical',
            palette: 'monochrome',
            pixelSize: 20,
            modifiers: [], // Add a default empty array for modifiers
            seed: Date.now(), // Default to a new seed every time
            ...config,
        };

        // Create a single PRNG instance for this generation process.
        this.prng = new SeededRandom(this.#config.seed);

        this.#initializeCanvas();

        // Load default modules.
        this.registerGenerator('simple-symmetry', new SymmetryGenerator());
        this.registerGenerator('advanced-symmetry', new AdvancedSymmetryGenerator());
        this.registerGenerator('recursive-growth', new RecursiveGrowthGenerator());
        this.registerPalette('monochrome', new MonochromePalette());
        this.registerPalette('vaporwave', new VaporwavePalette());
        this.registerPalette('forest', new ForestPalette());

        this.registerModifier('outline', new OutlineModifier());
        this.registerModifier('density-mask', new DensityMaskModifier());
    }

    /**
     * Initializes the canvas and its 2D context based on the configuration.
     * @private
     */
    #initializeCanvas() {
        const canvasSize = this.#config.size * this.#config.pixelSize;
        this.#canvas = document.createElement('canvas');
        this.#canvas.width = canvasSize;
        this.#canvas.height = canvasSize;
        this.#context = this.#canvas.getContext('2d');
        this.#context.imageSmoothingEnabled = false;
    }

    /**
     * Main orchestration method. It calls the necessary modules to generate the art.
     * @returns {this} Returns the Planter instance for method chaining.
     */
    generate() {
        // --- 1. Select and Run the Generator Module ---
        const generator = this.#generatorRegistry.get(this.#config.generator);
        if (!generator) {
            throw new Error(`Generator "${this.#config.generator}" not found.`);
        }
        let dataGrid = generator.run(this.#config, this.prng); // Use 'let' because we will modify this grid


        // --- 2. NEW: APPLY MODIFIER PIPELINE ---
        // Check if there are any modifiers in the config to apply.
        if (this.#config.modifiers && this.#config.modifiers.length > 0) {
            // Loop through each modifier config in the array.
            // This allows them to be chained in a specific order.
            for (const modConfig of this.#config.modifiers) {
                const modifier = this.#modifierRegistry.get(modConfig.name);
                if (modifier) {
                    // Pass the current state of the dataGrid to the modifier.
                    // The modifier returns a new, altered grid which becomes
                    // the input for the next modifier in the chain.
                    dataGrid = modifier.apply(dataGrid, modConfig, this.prng);
                } else {
                    console.warn(`Modifier "${modConfig.name}" not found.`);
                }
            }
        }


        // --- 3. Select and Run the Palette Module ---
        const palette = this.#paletteRegistry.get(this.#config.palette);
        if (!palette) {
            throw new Error(`Palette "${this.#config.palette}" not found.`);
        }
        const colorGrid = palette.map(dataGrid); // Use the final, modified grid


        // --- 4. Draw the Final Output to the Canvas ---
        this.#draw(colorGrid);


        return this; // Allow chaining
    }

    /**
     * Renders the color grid onto the canvas.
     * @private
     * @param {string[][]} colorGrid - A 2D array of color strings.
     */
    #draw(colorGrid) {
        // Clear the canvas before drawing new content.
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        const { size, pixelSize } = this.#config;

        // --- Drawing Algorithm ---
        // Iterate over each "logical" pixel in our generated grid.
        // @potential_algorithm A nested loop is the most straightforward way to traverse a 2D grid.
        // The outer loop handles the rows (y-axis), and the inner loop handles the columns (x-axis).

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Get the color for the current grid position.
                const color = colorGrid[y][x];

                // If the color is null or undefined, we can treat it as transparent and skip drawing.
                // This is an optimization and allows for sprites with empty space.
                if (!color) continue;

                // Set the fill style for the rectangle we're about to draw.
                this.#context.fillStyle = color;

                // Calculate the actual position and size on the canvas.
                // We multiply by pixelSize to scale up the art.
                const canvasX = x * pixelSize;
                const canvasY = y * pixelSize;

                // Draw the scaled-up "pixel" as a rectangle.
                this.#context.fillRect(canvasX, canvasY, pixelSize, pixelSize);
            }
        }
    }

    /**
     * Registers a new generator module, making it available for use.
     * @param {string} name - The name to identify the generator by (e.g., "symmetry").
     * @param {object} generatorInstance - An instance of a generator class/object.
     */
    registerGenerator(name, generatorInstance) {
        this.#generatorRegistry.set(name, generatorInstance);
    }

    /**
     * Registers a new palette module.
     * @param {string} name - The name to identify the palette by (e.g., "monochrome").
     * @param {object} paletteInstance - An instance of a palette class/object.
     */
    registerPalette(name, paletteInstance) {
        this.#paletteRegistry.set(name, paletteInstance);
    }

    /**
     * Returns the list of registered generator names.
     * @returns {string[]} An array of generator names.
     */
    getGeneratorNames() {
        return Array.from(this.#generatorRegistry.keys());
    }

    /**
     * Returns the list of registered palette names.
     * @returns {string[]} An array of palette names.
     */
    getPaletteNames() {
        return Array.from(this.#paletteRegistry.keys());
    }

    /**
     * Registers a new modifier module.
     * @param {string} name - The name to identify the modifier by.
     * @param {object} modifierInstance - An instance of a modifier class.
     */
    registerModifier(name, modifierInstance) {
        this.#modifierRegistry.set(name, modifierInstance);
    }

    /**
     * Public getter for modifier names, for the UI.
     * @returns {string[]}
     */
    getModifierNames() {
        return Array.from(this.#modifierRegistry.keys());
    }

    /**
     * Retrieves the class constructor for a given generator.
     * This is used by the UI to access static parameter definitions.
     * @param {string} name - The name of the generator.
     * @returns {Function|null} The generator's class constructor or null if not found.
     */
    getGenerator(name) {
        const instance = this.#generatorRegistry.get(name);
        return instance ? instance.constructor : null;
    }

    /**
     * Retrieves the class constructor for a given modifier.
     * This is used by the UI to access static parameter definitions.
     * @param {string} name - The name of the modifier.
     * @returns {Function|null} The modifier's class constructor or null if not found.
     */
    getModifier(name) {
        const instance = this.#modifierRegistry.get(name);
        return instance ? instance.constructor : null;
    }

    /**
     * Returns the canvas element containing the generated art.
     * @returns {HTMLCanvasElement} The canvas element.
     */
    getCanvas() {
        return this.#canvas;
    }
}
