import { SymmetryGenerator } from './generators/SymmetryGenerator.js';
import { MonochromePalette } from './palettes/MonochromePalette.js';
import { VaporwavePalette, ForestPalette } from './palettes/ColorPalettes.js';

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
     * Creates an instance of the Planter class.
     * @param {object} config - The configuration object for the generator.
     * @param {number} [config.size=16] - The width and height of the pixel art in pixels.
     * @param {string} [config.generator='symmetry'] - The name of the generator module to use.
     * @param {string} [config.palette='monochrome'] - The name of the palette module to use.
     * @param {number} [config.pixelSize=20] - The size to scale each "logical" pixel to for display.
     */
    constructor(config = {}) {
        this.#config = {
            size: 16,
            generator: 'symmetry',
            palette: 'monochrome',
            pixelSize: 20,
            ...config,
        };

        this.#initializeCanvas();

        // Load default modules.
        this.registerGenerator('symmetry', new SymmetryGenerator());
        this.registerPalette('monochrome', new MonochromePalette());
        this.registerPalette('vaporwave', new VaporwavePalette());
        this.registerPalette('forest', new ForestPalette());
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
        const dataGrid = generator.run(this.#config);


        // --- 2. Select and Run the Palette Module ---
        const palette = this.#paletteRegistry.get(this.#config.palette);
        if (!palette) {
            throw new Error(`Palette "${this.#config.palette}" not found.`);
        }
        const colorGrid = palette.map(dataGrid);


        // --- 3. Draw the Final Output to the Canvas ---
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
     * Returns the canvas element containing the generated art.
     * @returns {HTMLCanvasElement} The canvas element.
     */
    getCanvas() {
        return this.#canvas;
    }
}
