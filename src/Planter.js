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

export class Planter {
    #finalCanvas;
    #finalContext;
    #layerStack = [];
    #globalConfig;

    #generatorRegistry = new Map();
    #paletteRegistry = new Map();
    #modifierRegistry = new Map();
    #patternRegistry = new Map();

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

    generate() {
        this.#finalContext.clearRect(0, 0, this.#finalCanvas.width, this.#finalCanvas.height);
        this.#generateAllLayers();
        this.#renderAllLayers();
        return this;
    }

    #generateAllLayers() {
        // First pass: Generate all data grids without masking
        for (const layer of this.#layerStack) {
            const currentIndex = this.#layerStack.findIndex(l => l.id === layer.id);
            const readBelowGrid = this.#createCompositeGridForLayers(this.#layerStack.slice(0, currentIndex));
            layer.generate(this, readBelowGrid);
        }
        // Second pass: Apply masks
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

    // This is now just a wrapper
    #generateLayerWithContext(layer, allLayers) {
        const currentIndex = allLayers.findIndex(l => l.id === layer.id);
        const readBelowGrid = this.#createCompositeGridForLayers(allLayers.slice(0, currentIndex));
        layer.generate(this, readBelowGrid);
    }

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
        // Make sure to handle number and string conversions
        return this.#layerStack.find(l => l.id == id);
    }

    getLayerStack() {
        return this.#layerStack;
    }

    setLayerStack(layerStack) {
        this.#layerStack = layerStack;
    }

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
