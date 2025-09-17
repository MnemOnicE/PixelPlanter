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
 * @class Planter
 * The main class for the Pixel Planter library. This class orchestrates the entire
 * generative process, from managing layers to applying generators and palettes.
 */
export class Planter {
    #finalCanvas;
    #finalContext;
    #layerStack = [];
    #globalConfig;

    #generatorRegistry = new Map();
    #paletteRegistry = new Map();
    #modifierRegistry = new Map();
    #patternRegistry = new Map();

    /**
     * Creates an instance of the Planter class.
     * @param {object} globalConfig - The global configuration object (size, pixelSize).
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

    #initializeCanvas() {
        const canvasSize = this.#globalConfig.size * this.#globalConfig.pixelSize;
        this.#finalCanvas = document.createElement('canvas');
        this.#finalCanvas.width = canvasSize;
        this.#finalCanvas.height = canvasSize;
        this.#finalContext = this.#finalCanvas.getContext('2d');
        this.#finalContext.imageSmoothingEnabled = false;
    }

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
     * Main orchestration method. It generates each layer and composites them.
     * @returns {this} Returns the Planter instance for method chaining.
     */
    generate() {
        this.#finalContext.clearRect(0, 0, this.#finalCanvas.width, this.#finalCanvas.height);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.#finalCanvas.width;
        tempCanvas.height = this.#finalCanvas.height;
        const tempContext = tempCanvas.getContext('2d');

        for (const layer of this.#layerStack) {
            if (!layer.isVisible) continue;

            // Ensure layer's grid is generated
            if (layer.dataGrid.length === 0) {
                layer.generate(this);
            }

            const palette = this.getPaletteInstance(layer.config.palette);
            if (!palette) {
                console.error(`Palette "${layer.config.palette}" not found.`);
                continue;
            }
            const colorGrid = palette.map(layer.dataGrid);

            // Draw this layer to the temporary canvas
            this.#drawColorGridToContext(tempContext, colorGrid, this.#globalConfig);

            // Now, draw the temp canvas onto the final canvas with blending
            this.#finalContext.globalAlpha = layer.opacity;
            this.#finalContext.globalCompositeOperation = layer.blendMode;
            this.#finalContext.drawImage(tempCanvas, 0, 0);

            // Clear the temp canvas for the next layer
            tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Reset context properties
        this.#finalContext.globalAlpha = 1.0;
        this.#finalContext.globalCompositeOperation = 'source-over';

        return this;
    }

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
    addLayer(config) {
        const fullConfig = { ...this.#globalConfig, ...config };
        const newLayer = new Layer(fullConfig);
        this.#layerStack.push(newLayer);
        return newLayer;
    }

    removeLayer(layerId) {
        this.#layerStack = this.#layerStack.filter(layer => layer.id !== layerId);
    }

    moveLayer(layerId, direction) {
        const index = this.#layerStack.findIndex(l => l.id === layerId);
        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            [this.#layerStack[index], this.#layerStack[index - 1]] = [this.#layerStack[index - 1], this.#layerStack[index]];
        } else if (direction === 'down' && index < this.#layerStack.length - 1) {
            [this.#layerStack[index], this.#layerStack[index + 1]] = [this.#layerStack[index + 1], this.#layerStack[index]];
        }
    }

    getLayerById(id) {
        return this.#layerStack.find(l => l.id === id);
    }

    getLayerStack() {
        return this.#layerStack;
    }

    setLayerStack(layerStack) {
        this.#layerStack = layerStack;
    }

    /**
     * Modifies the dataGrid of a specific layer by setting values at given points.
     * @param {number} layerId - The ID of the layer to draw on.
     * @param {Array<{x: number, y: number}>} points - An array of points to modify.
     * @param {number} value - The value to set at each point (e.g., 1 for on, 0 for off).
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

    getDataGridForLayer(layerId) {
        const layer = this.getLayerById(layerId);
        return layer ? layer.dataGrid : null;
    }

    // --- Registries and Getters ---
    getPRNG(seed) { return new SeededRandom(seed); }
    getCanvas() { return this.#finalCanvas; }
    getGeneratorInstance(name) { return this.#generatorRegistry.get(name); }
    getModifierInstance(name) { return this.#modifierRegistry.get(name); }
    getPaletteInstance(name) { return this.#paletteRegistry.get(name); }
    getGenerator(name) { const i = this.getGeneratorInstance(name); return i ? i.constructor : null; }
    getModifier(name) { const i = this.getModifierInstance(name); return i ? i.constructor : null; }
    getGeneratorNames() { return Array.from(this.#generatorRegistry.keys()); }
    getPaletteNames() { return Array.from(this.#paletteRegistry.keys()); }
    getModifierNames() { return Array.from(this.#modifierRegistry.keys()); }
    getPattern(name) { return this.#patternRegistry.get(name) || null; }
    getPatternNames() { return Array.from(this.#patternRegistry.keys()); }
    registerGenerator(name, instance) { this.#generatorRegistry.set(name, instance); }
    registerPalette(name, instance) { this.#paletteRegistry.set(name, instance); }
    registerModifier(name, instance) { this.#modifierRegistry.set(name, instance); }
    registerPattern(name, instance) { this.#patternRegistry.set(name, instance); }
}
