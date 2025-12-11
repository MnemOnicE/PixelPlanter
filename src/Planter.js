/**
 * @file Planter.js
 * @description The core engine for the Pixel Planter application.
 */
import { Layer } from './Layer.js';
import { SeededRandom } from './utils/PRNG.js';
import { SymmetryGenerator } from './generators/SymmetryGenerator.js';
import { AdvancedSymmetryGenerator } from './generators/AdvancedSymmetryGenerator.js';
import { RecursiveGrowthGenerator } from './generators/RecursiveGrowthGenerator.js';
import { PatternGenerator } from './generators/PatternGenerator.js';
import { NoiseGenerator } from './generators/NoiseGenerator.js';
import { CellularAutomataGenerator } from './generators/CellularAutomataGenerator.js';
import { MonochromePalette } from './palettes/MonochromePalette.js';
import { VaporwavePalette, ForestPalette } from './palettes/ColorPalettes.js';
import { OutlineModifier } from './modifiers/OutlineModifier.js';
import { DensityMaskModifier } from './modifiers/DensityMaskModifier.js';
import { PathfinderModifier } from './modifiers/PathfinderModifier.js';
import { ParticleModifier } from './modifiers/ParticleModifier.js';

/**
 * The main engine class.
 * Orchestrates generators, modifiers, palettes, and layer management.
 * Responsible for rendering the final composite image.
 */
export class Planter {
    /**
     * The final canvas element where the result is drawn.
     * @type {HTMLCanvasElement}
     * @private
     */
    #finalCanvas;

    /**
     * The 2D rendering context for the final canvas.
     * @type {CanvasRenderingContext2D}
     * @private
     */
    #finalContext;

    /**
     * The stack of layers that make up the image.
     * @type {Layer[]}
     * @private
     */
    #layerStack = [];

    /**
     * Global configuration settings (e.g., size, pixelSize).
     * @type {object}
     * @private
     */
    #globalConfig;

    /**
     * Registry for generator instances.
     * @type {Map<string, object>}
     * @private
     */
    #generatorRegistry = new Map();

    /**
     * Registry for palette instances.
     * @type {Map<string, object>}
     * @private
     */
    #paletteRegistry = new Map();

    /**
     * Registry for modifier instances.
     * @type {Map<string, object>}
     * @private
     */
    #modifierRegistry = new Map();

    /**
     * Registry for pattern instances.
     * @type {Map<string, object>}
     * @private
     */
    #patternRegistry = new Map();

    /**
     * Creates an instance of Planter.
     *
     * @param {object} globalConfig - The initial global configuration.
     * @param {number} [globalConfig.size=32] - The grid size (width and height).
     * @param {number} [globalConfig.pixelSize=20] - The visual size of each pixel.
     */
    constructor(globalConfig = {}) {
        this.#globalConfig = {
            size: 32,
            pixelSize: 20,
            ...globalConfig,
        };

        this.#initializeCanvas();
        this.#loadDefaultModules();
    }

    /**
     * Initializes the canvas element and context.
     * @private
     */
    #initializeCanvas() {
        const canvasSize = this.#globalConfig.size * this.#globalConfig.pixelSize;
        this.#finalCanvas = document.createElement('canvas');
        this.#finalCanvas.width = canvasSize;
        this.#finalCanvas.height = canvasSize;
        this.#finalContext = this.#finalCanvas.getContext('2d');
        this.#finalContext.imageSmoothingEnabled = false;
    }

    /**
     * Registers and loads the default set of generators, palettes, and modifiers.
     * @private
     */
    #loadDefaultModules() {
        this.registerGenerator('simple-symmetry', new SymmetryGenerator());
        this.registerGenerator('advanced-symmetry', new AdvancedSymmetryGenerator());
        this.registerGenerator('recursive-growth', new RecursiveGrowthGenerator());
        this.registerGenerator('pattern', new PatternGenerator());
        this.registerGenerator('noise', new NoiseGenerator());
        this.registerGenerator('cellular-automata', new CellularAutomataGenerator());

        this.registerPalette('monochrome', new MonochromePalette());
        this.registerPalette('vaporwave', new VaporwavePalette());
        this.registerPalette('forest', new ForestPalette());

        this.registerModifier('outline', new OutlineModifier());
        this.registerModifier('density-mask', new DensityMaskModifier());
        this.registerModifier('pathfinder', new PathfinderModifier());
        this.registerModifier('particle-deposition', new ParticleModifier());
    }

    /**
     * Generates and renders the entire image.
     * Clears the canvas, regenerates all layer data, and then composites them.
     *
     * @returns {Planter} The instance for chaining.
     */
    generate() {
        this.#finalContext.clearRect(0, 0, this.#finalCanvas.width, this.#finalCanvas.height);
        this.#generateAllLayers();
        this.#renderAllLayers();
        return this;
    }

    /**
     * Generates a batch of variations as a single sprite sheet.
     * @param {object} config - Configuration for the batch.
     * @param {number} config.rows - Number of rows.
     * @param {number} config.cols - Number of columns.
     * @param {number} config.padding - Padding between sprites in pixels.
     * @param {number} config.variance - Variance level (0-100).
     * @returns {HTMLCanvasElement} The generated sprite sheet canvas.
     */
    generateBatch({ rows = 4, cols = 4, padding = 0, variance = 20 }) {
        // Backup current layer configs
        const originalLayerConfigs = this.#layerStack.map(layer => ({
            id: layer.id,
            config: JSON.parse(JSON.stringify(layer.config))
        }));

        const spriteWidth = this.#finalCanvas.width;
        const spriteHeight = this.#finalCanvas.height;
        const sheetWidth = (spriteWidth * cols) + (padding * (cols - 1));
        const sheetHeight = (spriteHeight * rows) + (padding * (rows - 1));

        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = sheetWidth;
        sheetCanvas.height = sheetHeight;
        const ctx = sheetCanvas.getContext('2d');

        // Heuristic for "structural" generators that shouldn't change on low variance
        const structuralGenerators = ['simple-symmetry', 'advanced-symmetry', 'recursive-growth'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const variationIndex = (r * cols) + c;

                if (variationIndex > 0) {
                     this.#layerStack.forEach(layer => {
                        const original = originalLayerConfigs.find(l => l.id === layer.id);
                        const isStructural = structuralGenerators.includes(original.config.generator);

                        // If variance is high (>50), change everything.
                        // If variance is low, preserve structural layers.
                        if (variance > 50 || !isStructural) {
                             // Modify seed
                             // We use the original seed + variation index to be deterministic for this batch
                             layer.config.seed = `${original.config.seed}-${variationIndex}`;
                        }
                     });
                } else {
                    // Index 0: Ensure it's the original config
                    this.#layerStack.forEach(layer => {
                        const original = originalLayerConfigs.find(l => l.id === layer.id);
                        layer.config = JSON.parse(JSON.stringify(original.config));
                    });
                }

                this.generate(); // Render to #finalCanvas

                const x = c * (spriteWidth + padding);
                const y = r * (spriteHeight + padding);
                ctx.drawImage(this.#finalCanvas, 0, 0, spriteWidth, spriteHeight, x, y, spriteWidth, spriteHeight);
            }
        }

        // Restore original configuration
        this.#layerStack.forEach(layer => {
             const original = originalLayerConfigs.find(l => l.id === layer.id);
             if (original) {
                 layer.config = original.config;
             }
        });

        // Restore the single view
        this.generate();

        return sheetCanvas;
    }

    /**
     * Generates data grids for all layers.
     * Handles dependencies between layers (like masking and reading below).
     * @private
     */
    #generateAllLayers() {
        // First pass: Generate all data grids
        for (const layer of this.#layerStack) {
            const currentIndex = this.#layerStack.findIndex(l => l.id === layer.id);
            const readBelowGrid = this.#createCompositeGridForLayers(this.#layerStack.slice(0, currentIndex));

            let inputMask = null;
            if (layer.maskLayerId) {
                const maskLayer = this.getLayerById(layer.maskLayerId);
                // STRICT CONSTRAINT: Mask layer must be BELOW the current layer (lower index)
                const maskIndex = this.#layerStack.findIndex(l => l.id === layer.maskLayerId);
                if (maskLayer && maskIndex < currentIndex && maskLayer.dataGrid && maskLayer.dataGrid.length > 0) {
                    inputMask = maskLayer.dataGrid;
                }
            }

            layer.generate(this, readBelowGrid, inputMask);
        }
        // Second pass: Apply masks (Post-process clip)
        // We keep this for generators that don't support smart masking yet,
        // and to ensure hard edges even if the generator was "smart".
        for (const layer of this.#layerStack) {
            if (layer.maskLayerId) {
                const maskLayer = this.getLayerById(layer.maskLayerId);
                // Ensure the mask layer has its data grid generated and is not the layer itself
                if (maskLayer && maskLayer.dataGrid && maskLayer.dataGrid.length > 0 && maskLayer.id !== layer.id) {
                    this.#applyMask(layer.dataGrid, maskLayer.dataGrid);
                }
            }
        }
    }

    /**
     * Helper to generate a single layer with context.
     * (Currently unused directly but kept for completeness).
     * @param {Layer} layer - The layer to generate.
     * @param {Layer[]} allLayers - The full stack of layers.
     * @private
     */
    #generateLayerWithContext(layer, allLayers) {
        const currentIndex = allLayers.findIndex(l => l.id === layer.id);
        const readBelowGrid = this.#createCompositeGridForLayers(allLayers.slice(0, currentIndex));
        layer.generate(this, readBelowGrid);
    }

    /**
     * Applies a mask to a target grid.
     * Zeros out pixels in the target where the mask is zero.
     *
     * @param {number[][]} targetGrid - The grid to modify.
     * @param {number[][]} maskGrid - The grid to use as a mask.
     * @private
     */
    #applyMask(targetGrid, maskGrid) {
        const size = this.#globalConfig.size;
        if (targetGrid.length !== size || maskGrid.length !== size) return;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // If the mask's pixel is 0, the target's pixel becomes 0.
                if (maskGrid[y][x] === 0) {
                    targetGrid[y][x] = 0;
                }
            }
        }
    }

    /**
     * Creates a composite grid from a list of layers.
     * Useful for checking "solid" ground below a layer.
     *
     * @param {Layer[]} layers - The list of layers to composite.
     * @returns {number[][]} A combined 2D grid where >0 means occupied.
     * @private
     */
    #createCompositeGridForLayers(layers) {
        const { size } = this.#globalConfig;
        const compositeGrid = Array.from({ length: size }, () => Array(size).fill(0));

        for (const layer of layers) {
            if (layer.isVisible && layer.dataGrid.length > 0) {
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        if (layer.dataGrid[y][x] > 0) {
                            compositeGrid[y][x] = 1;
                        }
                    }
                }
            }
        }
        return compositeGrid;
    }

    /**
     * Renders all layers to the final canvas.
     * Handles coloring, opacity, and blending modes.
     * @private
     */
    #renderAllLayers() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.#finalCanvas.width;
        tempCanvas.height = this.#finalCanvas.height;
        const tempContext = tempCanvas.getContext('2d');

        for (const layer of this.#layerStack) {
            if (!layer.isVisible || layer.dataGrid.length === 0) continue;

            const palette = this.getPaletteInstance(layer.config.palette);
            if (!palette) {
                console.error(`Palette "${layer.config.palette}" not found.`);
                continue;
            }
            const colorGrid = palette.map(layer.dataGrid);

            this.#drawColorGridToContext(tempContext, colorGrid, this.#globalConfig);

            this.#finalContext.globalAlpha = layer.opacity;
            this.#finalContext.globalCompositeOperation = layer.blendMode;
            this.#finalContext.drawImage(tempCanvas, 0, 0);

            tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        this.#finalContext.globalAlpha = 1.0;
        this.#finalContext.globalCompositeOperation = 'source-over';
    }

    /**
     * Draws a color grid to a canvas context.
     *
     * @param {CanvasRenderingContext2D} context - The target context.
     * @param {string[][]} colorGrid - The 2D array of color strings.
     * @param {object} config - Configuration containing size and pixelSize.
     * @private
     */
    #drawColorGridToContext(context, colorGrid, { size, pixelSize }) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const color = colorGrid[y][x];
                if (!color) continue;
                context.fillStyle = color;
                context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    // --- Layer Management ---

    /**
     * Adds a new layer to the stack.
     *
     * @param {object} config - The configuration for the new layer.
     * @returns {Layer} The created layer instance.
     */
    addLayer(config) {
        const fullConfig = { ...this.#globalConfig, ...config };
        const newLayer = new Layer(fullConfig);
        this.#layerStack.push(newLayer);
        return newLayer;
    }

    /**
     * Removes a layer by its ID.
     * @param {number} layerId - The ID of the layer to remove.
     */
    removeLayer(layerId) {
        this.#layerStack = this.#layerStack.filter(layer => layer.id !== layerId);
    }

    /**
     * Moves a layer up or down in the stack.
     * @param {number} layerId - The ID of the layer to move.
     * @param {string} direction - 'up' or 'down'.
     */
    moveLayer(layerId, direction) {
        const index = this.#layerStack.findIndex(l => l.id === layerId);
        if (index === -1) return;

        if (direction === 'up' && index < this.#layerStack.length - 1) {
            [this.#layerStack[index], this.#layerStack[index + 1]] = [this.#layerStack[index + 1], this.#layerStack[index]];
        } else if (direction === 'down' && index > 0) {
            [this.#layerStack[index], this.#layerStack[index - 1]] = [this.#layerStack[index - 1], this.#layerStack[index]];
        }
    }

    /**
     * Retrieves a layer by its ID.
     * @param {number|string} id - The layer ID.
     * @returns {Layer|undefined} The layer instance or undefined.
     */
    getLayerById(id) {
        // Make sure to handle number and string conversions
        return this.#layerStack.find(l => l.id == id);
    }

    /**
     * Returns the full stack of layers.
     * @returns {Layer[]} The array of layers.
     */
    getLayerStack() {
        return this.#layerStack;
    }

    /**
     * Replaces the layer stack with a new one.
     * @param {Layer[]} layerStack - The new layer stack.
     */
    setLayerStack(layerStack) {
        this.#layerStack = layerStack;
    }

    /**
     * Directly modifies a layer's data grid (e.g., for manual drawing).
     * @param {number} layerId - The ID of the layer.
     * @param {object[]} points - Array of points {x, y}.
     * @param {number} [value=1] - The value to write to the grid.
     */
    drawOnLayer(layerId, points, value = 1) {
        const layer = this.getLayerById(layerId);
        if (!layer) return;

        const size = this.#globalConfig.size;
        for (const point of points) {
            if (point.x >= 0 && point.x < size && point.y >= 0 && point.y < size) {
                if (!layer.dataGrid || layer.dataGrid.length !== size) {
                    layer.dataGrid = Array.from({ length: size }, () => Array(size).fill(0));
                }
                layer.dataGrid[point.y][point.x] = value;
            }
        }
    }

    /**
     * Gets the data grid for a specific layer.
     * @param {number} layerId - The layer ID.
     * @returns {number[][]|null} The data grid or null.
     */
    getDataGridForLayer(layerId) {
        const layer = this.getLayerById(layerId);
        return layer ? layer.dataGrid : null;
    }

    // --- Registries and Getters ---

    /**
     * Gets a PRNG instance initialized with a seed.
     * @param {string|number} seed - The seed.
     * @returns {SeededRandom} The PRNG instance.
     */
    getPRNG(seed) { return new SeededRandom(seed); }

    /**
     * Gets the final canvas element.
     * @returns {HTMLCanvasElement} The canvas.
     */
    getCanvas() { return this.#finalCanvas; }

    /**
     * Gets a generator instance by name.
     * @param {string} name - The generator name.
     * @returns {object|undefined} The generator instance.
     */
    getGeneratorInstance(name) { return this.#generatorRegistry.get(name); }

    /**
     * Gets a modifier instance by name.
     * @param {string} name - The modifier name.
     * @returns {object|undefined} The modifier instance.
     */
    getModifierInstance(name) { return this.#modifierRegistry.get(name); }

    /**
     * Gets a palette instance by name.
     * @param {string} name - The palette name.
     * @returns {object|undefined} The palette instance.
     */
    getPaletteInstance(name) { return this.#paletteRegistry.get(name); }

    /**
     * Gets the constructor/class of a generator by name.
     * @param {string} name - The generator name.
     * @returns {class|null} The generator class.
     */
    getGenerator(name) { const i = this.getGeneratorInstance(name); return i ? i.constructor : null; }

    /**
     * Gets the constructor/class of a modifier by name.
     * @param {string} name - The modifier name.
     * @returns {class|null} The modifier class.
     */
    getModifier(name) { const i = this.getModifierInstance(name); return i ? i.constructor : null; }

    /**
     * Gets the list of registered generator names.
     * @returns {string[]} List of names.
     */
    getGeneratorNames() { return Array.from(this.#generatorRegistry.keys()); }

    /**
     * Gets the list of registered palette names.
     * @returns {string[]} List of names.
     */
    getPaletteNames() { return Array.from(this.#paletteRegistry.keys()); }

    /**
     * Gets the list of registered modifier names.
     * @returns {string[]} List of names.
     */
    getModifierNames() { return Array.from(this.#modifierRegistry.keys()); }

    /**
     * Gets a registered pattern by name.
     * @param {string} name - The pattern name.
     * @returns {object|null} The pattern object or null.
     */
    getPattern(name) { return this.#patternRegistry.get(name) || null; }

    /**
     * Gets the list of registered pattern names.
     * @returns {string[]} List of names.
     */
    getPatternNames() { return Array.from(this.#patternRegistry.keys()); }

    /**
     * Registers a generator.
     * @param {string} name - The name.
     * @param {object} instance - The generator instance.
     */
    registerGenerator(name, instance) { this.#generatorRegistry.set(name, instance); }

    /**
     * Registers a palette.
     * @param {string} name - The name.
     * @param {object} instance - The palette instance.
     */
    registerPalette(name, instance) { this.#paletteRegistry.set(name, instance); }

    /**
     * Registers a modifier.
     * @param {string} name - The name.
     * @param {object} instance - The modifier instance.
     */
    registerModifier(name, instance) { this.#modifierRegistry.set(name, instance); }

    /**
     * Registers a pattern.
     * @param {string} name - The name.
     * @param {object} instance - The pattern instance.
     */
    registerPattern(name, instance) { this.#patternRegistry.set(name, instance); }
}
