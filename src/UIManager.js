/**
 * @file UIManager.js
 * @description Manages the user interface and interactions.
 */
import { driver } from "/node_modules/driver.js/dist/driver.js.mjs";
import { Planter } from './Planter.js';
import { HistoryManager } from './HistoryManager.js';
import { Layer } from './Layer.js';

/**
 * Text content for UI tooltips.
 * @type {object}
 */
const TOOLTIP_TEXTS = {
    'generator-select': 'The core algorithm used to create the pattern.',
    'seed-input': 'A number or string that determines the random pattern. The same seed will always produce the same image.',
    'palette-select': 'The set of colors used in the artwork.',
    'size-input': 'The number of cells in the grid (e.g., 32x32).',
    'pixel-size-input': 'The size of each \'pixel\' in the final image.',
    'modifiers-container': 'Optional effects that alter the generated image.'
};

/**
 * Manages the User Interface.
 * Handles DOM events, updates the view, and communicates with the Planter instance.
 */
export class UIManager {
    /**
     * The core application engine.
     * @type {Planter}
     * @private
     */
    #planterInstance;

    /**
     * Cache of DOM elements.
     * @type {object}
     * @private
     */
    #controls = {};

    /**
     * Container for the canvas.
     * @type {HTMLElement}
     * @private
     */
    #canvasContainer;

    /**
     * Container for modifier controls.
     * @type {HTMLElement}
     * @private
     */
    #modifiersContainer;

    /**
     * Container for generator parameters.
     * @type {HTMLElement}
     * @private
     */
    #generatorParamsContainer;

    /**
     * Container for modifier parameters.
     * @type {HTMLElement}
     * @private
     */
    #modifierParamsContainer;

    /**
     * Panel displaying the layer list.
     * @type {HTMLElement}
     * @private
     */
    #layerPanel;

    /**
     * The ID of the currently selected layer.
     * @type {number|null}
     * @private
     */
    #activeLayerId = null;

    /**
     * Manager for undo/redo history.
     * @type {HistoryManager}
     * @private
     */
    #historyManager;

    /**
     * Current symmetry mode for brushing.
     * @type {string}
     * @private
     */
    #activeSymmetryMode = 'none';

    /**
     * State flag for mouse drag operations.
     * @type {boolean}
     * @private
     */
    #isBrushing = false;

    /**
     * Clipboard for copying modifier configurations.
     * @type {object[]|null}
     * @private
     */
    #clipboard = null;

    /**
     * Modal element for presets.
     * @type {HTMLElement}
     * @private
     */
    #presetsModal;

    /**
     * Gallery container inside the presets modal.
     * @type {HTMLElement}
     * @private
     */
    #presetGallery;

    /**
     * Button to close the presets modal.
     * @type {HTMLElement}
     * @private
     */
    #closePresetsBtn;

    /**
     * Modal element for asset factory.
     * @type {HTMLElement}
     * @private
     */
    #factoryModal;

    /**
     * Button to close the factory modal.
     * @type {HTMLElement}
     * @private
     */
    #closeFactoryBtn;

    /**
     * Initializes the UI Manager.
     * Sets up the Planter instance, binds DOM elements, and starts the tour.
     */
    constructor() {
        this.#historyManager = new HistoryManager();
        this.#bindDOM();

        const globalConfig = {
            size: parseInt(this.#controls.sizeInput.value, 10),
            pixelSize: parseInt(this.#controls.pixelSizeInput.value, 10),
        };
        this.#planterInstance = new Planter(globalConfig);

        this.#initializeUI();
        this.#attachEventListeners();

        const loadedFromURL = this.#loadConfigFromURL();
        if (!loadedFromURL) {
            this.#handleAddLayer();
        }
        this.#startOnboardingTour();
    }

    /**
     * Starts the guided onboarding tour for new users using `driver.js`.
     * Checks localStorage to prevent showing it repeatedly.
     * @private
     */
    #startOnboardingTour() {
        const hasBeenOnboarded = localStorage.getItem('pixelPlanterOnboarded');
        if (hasBeenOnboarded) {
            return;
        }

        const driverObj = driver({
            showProgress: true,
            steps: [
                { element: '#generator-select', popover: { title: '1. Pick a Generator', description: 'This is the main algorithm used to create your art. Try "noise" or "cellular" to start.' } },
                { element: '#palette-select', popover: { title: '2. Pick a Palette', description: 'Choose a color scheme for your creation.' } },
                { element: '#generate-btn', popover: { title: '3. Generate!', description: 'Click here to create your artwork. You can click it again to get a new variation with the same settings.' } },
                { element: '#randomize-btn', popover: { title: 'Roll the Dice', description: 'This button will randomize all settings for a surprise result.' } },
                { element: '#mode-toggle-container', popover: { title: 'Unlock More Power', description: 'When you\'re ready, switch to "Advanced" mode to unlock layers, modifiers, and more!' } }
            ]
        });

        driverObj.drive();
        localStorage.setItem('pixelPlanterOnboarded', 'true');
    }

    /**
     * Binds DOM elements to class properties for easy access.
     * @private
     */
    #bindDOM() {
        this.#controls.generatorSelect = document.getElementById('generator-select');
        this.#controls.paletteSelect = document.getElementById('palette-select');
        this.#controls.sizeInput = document.getElementById('size-input');
        this.#controls.pixelSizeInput = document.getElementById('pixel-size-input');
        this.#controls.seedInput = document.getElementById('seed-input');
        this.#controls.generateBtn = document.getElementById('generate-btn');
        this.#controls.randomizeBtn = document.getElementById('randomize-btn');
        this.#controls.symmetrySelect = document.getElementById('symmetry-select');
        this.#layerPanel = document.getElementById('layer-panel');
        this.#controls.addLayerBtn = document.getElementById('add-layer-btn');
        this.#controls.layerList = document.getElementById('layer-list');
        this.#canvasContainer = document.getElementById('canvas-container');
        this.#modifiersContainer = document.getElementById('modifiers-container');
        this.#generatorParamsContainer = document.getElementById('generator-params');
        this.#modifierParamsContainer = document.getElementById('modifier-params');
        this.#controls.saveBtn = document.getElementById('save-btn');
        this.#controls.exportJsonBtn = document.getElementById('export-json-btn');
        this.#controls.undoBtn = document.getElementById('undo-btn');
        this.#controls.redoBtn = document.getElementById('redo-btn');
        this.#controls.shareBtn = document.getElementById('share-btn');
        this.#controls.showPresetsBtn = document.getElementById('show-presets-btn');
        this.#presetsModal = document.getElementById('presets-modal');
        this.#presetGallery = document.getElementById('preset-gallery');
        this.#closePresetsBtn = this.#presetsModal.querySelector('.close-button');
        this.#controls.showFactoryBtn = document.getElementById('show-factory-btn');
        this.#factoryModal = document.getElementById('factory-modal');
        this.#closeFactoryBtn = this.#factoryModal.querySelector('.close-button');
        this.#controls.factoryGenerateBtn = document.getElementById('factory-generate-btn');
    }

    /**
     * Populates initial UI options and adds tooltips.
     * @private
     */
    #initializeUI() {
        this.#populateGeneratorOptions();
        this.#populatePaletteOptions();
        this.#populateModifierOptions();
        this.#addTooltips();
        const canvas = this.#planterInstance.getCanvas();
        this.#canvasContainer.appendChild(canvas);
    }

    /**
     * Attaches event listeners to DOM elements.
     * Handles clicks, inputs, and canvas interactions.
     * @private
     */
    #attachEventListeners() {
        this.#controls.generateBtn.addEventListener('click', () => this.handleGenerateActiveLayer());
        this.#controls.randomizeBtn.addEventListener('click', () => this.#handleRandomizeAll());
        this.#controls.addLayerBtn.addEventListener('click', () => this.#handleAddLayer());
        this.#controls.exportJsonBtn.addEventListener('click', () => this.#handleExportJSON());
        this.#controls.undoBtn.addEventListener('click', () => this.#handleUndo());
        this.#controls.redoBtn.addEventListener('click', () => this.#handleRedo());
        this.#controls.shareBtn.addEventListener('click', () => this.#handleShare());
        document.getElementById('mode-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('simple-mode');
            } else {
                document.body.classList.add('simple-mode');
            }
        });

        // Delegated listeners for the layer list
        this.#controls.layerList.addEventListener('click', e => {
            const layerItem = e.target.closest('.layer-item');
            if (!layerItem) return;
            const layerId = Number(layerItem.dataset.layerId);

            if (e.target.matches('.layer-delete-btn')) {
                this.#handleRemoveLayer(layerId);
            } else if (e.target.matches('.layer-move-up-btn')) {
                this.#planterInstance.moveLayer(layerId, 'up');
                this.#renderLayerPanel();
                this.#saveState();
            } else if (e.target.matches('.layer-move-down-btn')) {
                this.#planterInstance.moveLayer(layerId, 'down');
                this.#renderLayerPanel();
                this.#saveState();
            } else if (e.target.matches('.copy-mods-btn')) {
                this.#copyModifierStack(layerId);
            } else if (e.target.matches('.paste-mods-btn')) {
                this.#pasteModifierStack(layerId);
            } else if (!e.target.matches('input, select, button')) {
                this.#setActiveLayer(layerId);
            }
        });

        this.#controls.layerList.addEventListener('input', e => {
            const layerItem = e.target.closest('.layer-item');
            if (!layerItem) return;
            const layerId = Number(layerItem.dataset.layerId);
            const layer = this.#planterInstance.getLayerById(layerId);
            if (!layer) return;

            if (e.target.matches('.layer-visible-toggle')) {
                layer.isVisible = e.target.checked;
                this.#planterInstance.generate();
                this.#saveState();
            } else if (e.target.matches('.layer-opacity-slider')) {
                layer.opacity = parseFloat(e.target.value);
                this.#planterInstance.generate();
                this.#saveState();
            } else if (e.target.matches('.layer-blend-mode-select')) {
                layer.blendMode = e.target.value;
                this.#planterInstance.generate();
                this.#saveState();
            } else if (e.target.matches('.layer-name-input')) {
                layer.name = e.target.value;
                this.#saveState(); // No need to regenerate, just save
            } else if (e.target.matches('.layer-mask-select')) {
                const value = e.target.value;
                layer.maskLayerId = value === 'none' ? null : Number(value);
                this.#planterInstance.generate(); // Masking requires a full generate
                this.#saveState();
            }
        });

        this.#controls.symmetrySelect.addEventListener('change', e => this.#activeSymmetryMode = e.target.value);
        this.#canvasContainer.addEventListener('mousedown', e => { this.#isBrushing = true; this.#handleBrushStroke(e); });
        this.#canvasContainer.addEventListener('mousemove', e => { if (this.#isBrushing) this.#handleBrushStroke(e); });
        this.#canvasContainer.addEventListener('mouseup', () => this.#isBrushing = false);
        this.#canvasContainer.addEventListener('mouseleave', () => this.#isBrushing = false);

        this.#controls.showPresetsBtn.addEventListener('click', () => this.#handleShowPresets());
        this.#closePresetsBtn.addEventListener('click', () => this.#presetsModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target == this.#presetsModal) {
                this.#presetsModal.style.display = 'none';
            }
        });

        this.#presetGallery.addEventListener('click', (event) => {
            const presetItem = event.target.closest('.preset-item');
            if (presetItem) {
                const configString = presetItem.dataset.config;
                this.#loadConfig(configString);
                this.#presetsModal.style.display = 'none';
            }
        });

        this.#controls.showFactoryBtn.addEventListener('click', () => this.#factoryModal.style.display = 'block');
        this.#closeFactoryBtn.addEventListener('click', () => this.#factoryModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target == this.#factoryModal) {
                this.#factoryModal.style.display = 'none';
            }
        });
        this.#controls.factoryGenerateBtn.addEventListener('click', () => this.#handleGenerateBatch());
    }

    /**
     * Handles manual painting on the canvas.
     * @param {MouseEvent} event - The mouse event.
     * @private
     */
    #handleBrushStroke(event) {
        if (!this.#activeLayerId) return;

        const canvas = this.#planterInstance.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { size, pixelSize } = layer.config;

        const gridX = Math.floor(canvasX / pixelSize);
        const gridY = Math.floor(canvasY / pixelSize);

        const pointsToDraw = [{ x: gridX, y: gridY }];

        if (this.#activeSymmetryMode === 'vertical' || this.#activeSymmetryMode === 'quad') {
            pointsToDraw.push({ x: size - 1 - gridX, y: gridY });
        }
        if (this.#activeSymmetryMode === 'horizontal' || this.#activeSymmetryMode === 'quad') {
            pointsToDraw.push({ x: gridX, y: size - 1 - gridY });
        }
        if (this.#activeSymmetryMode === 'quad') {
            pointsToDraw.push({ x: size - 1 - gridX, y: size - 1 - gridY });
        }

        this.#planterInstance.drawOnLayer(this.#activeLayerId, pointsToDraw, 1);
        this.#planterInstance.generate();
        this.#saveState();
    }

    /**
     * Renders the layer panel list, including controls for each layer.
     * @private
     */
    #renderLayerPanel() {
        const layerStack = this.#planterInstance.getLayerStack();
        this.#controls.layerList.innerHTML = '';

        [...layerStack].reverse().forEach(layer => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.layerId = layer.id;
            if (layer.id === this.#activeLayerId) {
                item.classList.add('active');
            }

            const otherLayers = layerStack.filter(l => l.id !== layer.id);
            const maskOptions = otherLayers.map(l => `<option value="${l.id}" ${layer.maskLayerId == l.id ? 'selected' : ''}>${l.name}</option>`).join('');

            item.innerHTML = `
                <div class="layer-item-header">
                    <input type="checkbox" class="layer-visible-toggle" ${layer.isVisible ? 'checked' : ''} title="Toggle Visibility">
                    <input type="text" class="layer-name-input" value="${layer.name}">
                    <div class="layer-item-buttons">
                        <button class="layer-move-up-btn" title="Move Up">↑</button>
                        <button class="layer-move-down-btn" title="Move Down">↓</button>
                        <button class="layer-delete-btn" title="Delete Layer">X</button>
                    </div>
                </div>
                <div class="layer-item-controls">
                    <div>
                        <label>Opacity</label>
                        <input type="range" class="layer-opacity-slider" min="0" max="1" step="0.05" value="${layer.opacity}">
                    </div>
                    <div>
                        <label>Blend</label>
                        <select class="layer-blend-mode-select">
                            <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>Normal</option>
                            <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>Multiply</option>
                            <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>Screen</option>
                            <option value="overlay" ${layer.blendMode === 'overlay' ? 'selected' : ''}>Overlay</option>
                            <option value="difference" ${layer.blendMode === 'difference' ? 'selected' : ''}>Difference</option>
                            <option value="lighten" ${layer.blendMode === 'lighten' ? 'selected' : ''}>Lighten</option>
                            <option value="darken" ${layer.blendMode === 'darken' ? 'selected' : ''}>Darken</option>
                        </select>
                    </div>
                    <div>
                        <label>Mask</label>
                        <select class="layer-mask-select">
                            <option value="none">No Mask</option>
                            ${maskOptions}
                        </select>
                    </div>
                    <div class="modifier-actions">
                        <button class="copy-mods-btn">Copy Mods</button>
                        <button class="paste-mods-btn">Paste Mods</button>
                    </div>
                </div>
            `;
            this.#controls.layerList.appendChild(item);
        });
    }

    /**
     * Copies the modifier stack of a layer to the clipboard.
     * @param {number} layerId - The ID of the source layer.
     * @private
     */
    #copyModifierStack(layerId) {
        const layer = this.#planterInstance.getLayerById(layerId);
        if (layer && layer.config.modifiers) {
            this.#clipboard = JSON.parse(JSON.stringify(layer.config.modifiers));
            alert('Modifiers copied!');
        }
    }

    /**
     * Pastes the modifier stack from the clipboard to a layer.
     * @param {number} layerId - The ID of the target layer.
     * @private
     */
    #pasteModifierStack(layerId) {
        if (this.#clipboard === null) {
            alert('Nothing to paste!');
            return;
        }
        const layer = this.#planterInstance.getLayerById(layerId);
        if (layer) {
            layer.config.modifiers = JSON.parse(JSON.stringify(this.#clipboard));
            this.#setActiveLayer(layer.id); // This will update the main controls
            this.handleGenerateActiveLayer(); // This regenerates and saves state
        }
    }

    /**
     * Sets the active layer and updates the UI to reflect its configuration.
     * @param {number} layerId - The ID of the layer to select.
     * @private
     */
    #setActiveLayer(layerId) {
        this.#activeLayerId = layerId;
        const layer = this.#planterInstance.getLayerById(layerId);
        if (layer) {
            this.#updateMainControlsFromLayer(layer);
        }
        this.#renderLayerPanel();
    }

    /**
     * Adds a new layer with default settings.
     * @private
     */
    #handleAddLayer() {
        const defaultConfig = {
            generator: 'noise',
            palette: 'monochrome',
            seed: Date.now().toString(),
            modifiers: [],
            noiseScale: 20,
            noiseThreshold: 0.5,
        };
        const newLayer = this.#planterInstance.addLayer(defaultConfig);
        this.#setActiveLayer(newLayer.id);
        this.handleGenerateActiveLayer(); // This will generate and save
    }

    /**
     * Removes a layer and updates the active selection if needed.
     * @param {number} layerId - The ID of the layer to remove.
     * @private
     */
    #handleRemoveLayer(layerId) {
        this.#planterInstance.removeLayer(layerId);
        if (this.#activeLayerId === layerId) {
            const layerStack = this.#planterInstance.getLayerStack();
            const newActiveLayer = layerStack.length > 0 ? layerStack[layerStack.length - 1] : null;
            this.#setActiveLayer(newActiveLayer ? newActiveLayer.id : null);
        }
        this.#renderLayerPanel();
        this.#planterInstance.generate();
        this.#saveState();
    }

    /**
     * Triggers generation for the active layer using current UI controls.
     * Updates the layer's config and then the full image.
     */
    handleGenerateActiveLayer() {
        if (!this.#activeLayerId) {
            // This can happen if the last layer is deleted.
            this.#planterInstance.generate(); // Render the empty state
            this.#saveState();
            return;
        }
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        if (layer) {
            layer.config = this.#getConfigFromMainControls();
            // The main generate call will handle the individual layer generation now
            this.#planterInstance.generate();
            this.#saveState();
        }
    }

    /**
     * Loads and displays the presets modal.
     * Fetches presets from `src/presets.json` if not already loaded.
     * @private
     */
    async #handleShowPresets() {
        if (this.#presetGallery.children.length === 0) {
            try {
                const response = await fetch('./src/presets.json');
                const presets = await response.json();
                this.#populatePresetGallery(presets);
            } catch (error) {
                console.error('Failed to load presets:', error);
                this.#presetGallery.innerHTML = '<p>Could not load presets.</p>';
            }
        }
        this.#presetsModal.style.display = 'block';
    }

    /**
     * Populates the preset gallery with items.
     * @param {object[]} presets - List of preset objects.
     * @private
     */
    #populatePresetGallery(presets) {
        this.#presetGallery.innerHTML = '';
        presets.forEach(preset => {
            const item = document.createElement('div');
            item.className = 'preset-item';
            item.dataset.config = preset.config;
            item.innerHTML = `
                <img src="${preset.preview}" alt="${preset.name}" loading="lazy">
                <div class="preset-item-name">${preset.name}</div>
            `;
            this.#presetGallery.appendChild(item);
        });
    }

    /**
     * Randomizes all settings for the active layer.
     * @private
     */
    #handleRandomizeAll() {
        if (!this.#activeLayerId) {
            alert("Please add or select a layer to randomize.");
            return;
        }

        const generators = this.#planterInstance.getGeneratorNames();
        const palettes = this.#planterInstance.getPaletteNames();

        const randomGenerator = generators[Math.floor(Math.random() * generators.length)];
        const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
        const randomSeed = Math.floor(Math.random() * 1000000).toString();

        this.#controls.generatorSelect.value = randomGenerator;
        this.#controls.paletteSelect.value = randomPalette;
        this.#controls.seedInput.value = randomSeed;

        this.#updateGeneratorParamsUI(randomGenerator, {});

        const allModifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]');
        allModifierCheckboxes.forEach(cb => cb.checked = false);
        this.#updateModifierParamsUI([]);

        this.handleGenerateActiveLayer();
    }

    /**
     * Gathers configuration data from the main control panel.
     * @returns {object} The configuration object.
     * @private
     */
    #getConfigFromMainControls() {
        const config = {
            generator: this.#controls.generatorSelect.value,
            palette: this.#controls.paletteSelect.value,
            seed: this.#controls.seedInput.value || Date.now().toString(),
            modifiers: []
        };
        const genParamsInputs = this.#generatorParamsContainer.querySelectorAll('[data-param-name]');
        genParamsInputs.forEach(input => {
            const key = input.dataset.paramName;
            const value = input.type === 'range' ? parseFloat(input.value) : input.value;
            config[key] = isNaN(value) ? input.value : value;
        });
        const modifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]:checked');
        modifierCheckboxes.forEach(checkbox => {
            const modName = checkbox.dataset.modifierName;
            const modConfig = { name: modName };
            const modParamsInputs = this.#modifierParamsContainer.querySelectorAll(`[data-param-owner="${modName}"]`);
            modParamsInputs.forEach(input => {
                const key = input.dataset.paramName;
                const value = input.type === 'range' ? parseFloat(input.value) : input.value;
                modConfig[key] = isNaN(value) ? input.value : value;
            });
            config.modifiers.push(modConfig);
        });
        return config;
    }

    /**
     * Updates the main controls to match a layer's configuration.
     * @param {Layer} layer - The layer to read from.
     * @private
     */
    #updateMainControlsFromLayer(layer) {
        const config = layer.config;
        this.#controls.generatorSelect.value = config.generator;
        this.#controls.paletteSelect.value = config.palette;
        this.#controls.seedInput.value = config.seed;
        this.#updateGeneratorParamsUI(config.generator, config);
        const allModifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]');
        allModifierCheckboxes.forEach(checkbox => {
            checkbox.checked = config.modifiers.some(m => m.name === checkbox.dataset.modifierName);
        });
        this.#updateModifierParamsUI(config.modifiers);
    }

    /**
     * Adds tooltips to UI elements based on the TOOLTIP_TEXTS constant.
     * @private
     */
    #addTooltips() {
        for (const controlId in TOOLTIP_TEXTS) {
            const el = document.getElementById(controlId);
            if (!el) continue;
            let label = (controlId === 'modifiers-container') ? el.previousElementSibling : document.querySelector(`label[for="${controlId}"]`);
            if (label) {
                label.classList.add('tooltip');
                const tooltipText = document.createElement('span');
                tooltipText.classList.add('tooltip-text');
                tooltipText.textContent = TOOLTIP_TEXTS[controlId];
                label.appendChild(tooltipText);
            }
        }
    }

    /**
     * Populates the generator select dropdown.
     * @private
     */
    #populateGeneratorOptions() {
        const names = this.#planterInstance.getGeneratorNames();
        this.#controls.generatorSelect.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
    }

    /**
     * Populates the palette select dropdown.
     * @private
     */
    #populatePaletteOptions() {
        const names = this.#planterInstance.getPaletteNames();
        this.#controls.paletteSelect.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
    }

    /**
     * Populates the modifier checkbox list.
     * @private
     */
    #populateModifierOptions() {
        const names = this.#planterInstance.getModifierNames();
        this.#modifiersContainer.innerHTML = names.map(name => `
            <div>
                <input type="checkbox" id="mod-${name}" data-modifier-name="${name}">
                <label for="mod-${name}">${name}</label>
            </div>
        `).join('');
    }

    /**
     * Dynamically builds UI controls for generator parameters.
     * @param {string} generatorName - The name of the generator.
     * @param {object} config - Current configuration values.
     * @private
     */
    #updateGeneratorParamsUI(generatorName, config) {
        const generatorClass = this.#planterInstance.getGenerator(generatorName);
        this.#generatorParamsContainer.innerHTML = '';
        if (generatorClass && generatorClass.params) {
            this.#buildControls(this.#generatorParamsContainer, generatorClass.params, generatorName, config);
        }
    }

    /**
     * Dynamically builds UI controls for modifier parameters.
     * @param {object[]} modifiersConfig - List of active modifier configurations.
     * @private
     */
    #updateModifierParamsUI(modifiersConfig) {
        this.#modifierParamsContainer.innerHTML = '';
        if (!modifiersConfig) return;
        modifiersConfig.forEach(modConfig => {
            const modifierClass = this.#planterInstance.getModifier(modConfig.name);
            if (modifierClass && modifierClass.params) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'modifier-param-group';
                const groupLabel = document.createElement('h4');
                groupLabel.textContent = `${modConfig.name} Settings`;
                groupDiv.appendChild(groupLabel);
                this.#buildControls(groupDiv, modifierClass.params, modConfig.name, modConfig);
                this.#modifierParamsContainer.appendChild(groupDiv);
            }
        });
    }

    /**
     * Helper to create input elements based on a params definition object.
     * @param {HTMLElement} container - The container to append controls to.
     * @param {object} paramsObject - The parameters definition.
     * @param {string} ownerName - The name of the owning generator/modifier.
     * @param {object} config - Current values.
     * @private
     */
    #buildControls(container, paramsObject, ownerName, config) {
        for (const key in paramsObject) {
            const paramConfig = paramsObject[key];
            const currentValue = config[key] !== undefined ? config[key] : paramConfig.defaultValue;
            const controlDiv = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = paramConfig.label;
            let input;
            if (paramConfig.type === 'slider') {
                input = document.createElement('input');
                input.type = 'range';
                input.min = paramConfig.min;
                input.max = paramConfig.max;
                input.step = paramConfig.step;
                input.value = currentValue;
            } else if (paramConfig.type === 'select') {
                input = document.createElement('select');
                let options = paramConfig.optionsSource === 'patterns' ? this.#planterInstance.getPatternNames() : (paramConfig.options || []);
                input.innerHTML = options.map(opt => `<option value="${opt}" ${opt == currentValue ? 'selected' : ''}>${opt}</option>`).join('');
            }
            if (input) {
                input.dataset.paramOwner = ownerName;
                input.dataset.paramName = key;
                controlDiv.appendChild(label);
                controlDiv.appendChild(input);
                container.appendChild(controlDiv);
            }
        }
    }

    /**
     * Exports the current layer stack to a JSON file.
     * @private
     */
    #handleExportJSON() {
        const layerStack = this.#planterInstance.getLayerStack();
        const simplifiedStack = layerStack.map(layer => ({
            config: layer.config,
            name: layer.name,
            isVisible: layer.isVisible,
            opacity: layer.opacity,
            blendMode: layer.blendMode,
            maskLayerId: layer.maskLayerId,
        }));
        const jsonString = JSON.stringify(simplifiedStack, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = "pixel-planter-export.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Saves the current application state to the history manager.
     * @private
     */
    #saveState() {
        const layerStack = this.#planterInstance.getLayerStack();
        const state = layerStack.map(layer => {
            const newLayer = new Layer(JSON.parse(JSON.stringify(layer.config)));
            newLayer.id = layer.id;
            newLayer.name = layer.name;
            newLayer.isVisible = layer.isVisible;
            newLayer.opacity = layer.opacity;
            newLayer.blendMode = layer.blendMode;
            newLayer.maskLayerId = layer.maskLayerId; // IMPORTANT: Persist mask ID
            // Don't save the dataGrid in history, it can be regenerated.
            // newLayer.dataGrid = JSON.parse(JSON.stringify(layer.dataGrid));
            return newLayer;
        });
        this.#historyManager.addState({ layers: state, activeLayerId: this.#activeLayerId });
    }

    /**
     * Restores the application state from a history snapshot.
     * @param {object} state - The state object to restore.
     * @private
     */
    #restoreState(state) {
        if (!state) return;
        const newLayerStack = state.layers.map(simpleLayer => {
            const newLayer = new Layer(simpleLayer.config);
            newLayer.id = simpleLayer.id;
            newLayer.name = simpleLayer.name;
            newLayer.isVisible = simpleLayer.isVisible;
            newLayer.opacity = simpleLayer.opacity;
            newLayer.blendMode = simpleLayer.blendMode;
            newLayer.maskLayerId = simpleLayer.maskLayerId;
            // Data grid will be regenerated.
            return newLayer;
        });
        this.#planterInstance.setLayerStack(newLayerStack);
        this.#activeLayerId = state.activeLayerId;
        const newActiveLayer = this.#planterInstance.getLayerById(this.#activeLayerId) || newLayerStack[newLayerStack.length - 1];
        this.#setActiveLayer(newActiveLayer ? newActiveLayer.id : null);
        this.#planterInstance.generate();
    }

    /**
     * Handles the Undo action.
     * @private
     */
    #handleUndo() {
        const prevState = this.#historyManager.undo();
        if (prevState) this.#restoreState(prevState);
    }

    /**
     * Handles the Redo action.
     * @private
     */
    #handleRedo() {
        const nextState = this.#historyManager.redo();
        if (nextState) this.#restoreState(nextState);
    }

    /**
     * Generates a shareable URL for the current artwork.
     * @private
     */
    #handleShare() {
        const layerStack = this.#planterInstance.getLayerStack();
        const simplifiedStack = layerStack.map(layer => ({
            config: layer.config,
            name: layer.name,
            isVisible: layer.isVisible,
            opacity: layer.opacity,
            blendMode: layer.blendMode,
            maskLayerId: layer.maskLayerId,
        }));
        const jsonString = JSON.stringify(simplifiedStack);
        const base64String = btoa(encodeURIComponent(jsonString));
        const shareableURL = `${window.location.origin}${window.location.pathname}?config=${base64String}`;
        navigator.clipboard.writeText(shareableURL).then(() => alert("Link copied to clipboard!")).catch(err => console.error("Failed to copy link: ", err));
    }

    /**
     * Handles the batch generation and download.
     * @private
     */
    #handleGenerateBatch() {
        const rows = parseInt(document.getElementById('factory-rows').value, 10);
        const cols = parseInt(document.getElementById('factory-cols').value, 10);
        const padding = parseInt(document.getElementById('factory-padding').value, 10);
        const variance = parseInt(document.getElementById('factory-variance').value, 10);

        const sheetCanvas = this.#planterInstance.generateBatch({ rows, cols, padding, variance });

        // Download
        const link = document.createElement('a');
        link.download = 'pixel-planter-sheet.png';
        link.href = sheetCanvas.toDataURL();
        link.click();

        this.#factoryModal.style.display = 'none';
    }

    /**
     * Checks the URL for configuration parameters and loads them.
     * @returns {boolean} True if config was loaded, false otherwise.
     * @private
     */
    #loadConfigFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const configString = urlParams.get('config');
        if (!configString) return false;

        return this.#loadConfig(configString);
    }

    /**
     * Loads a configuration string (base64 encoded JSON).
     * @param {string} configString - The encoded configuration.
     * @returns {boolean} True if successful.
     * @private
     */
    #loadConfig(configString) {
        try {
            const jsonString = decodeURIComponent(atob(configString));
            const simplifiedStack = JSON.parse(jsonString);
            if (!Array.isArray(simplifiedStack)) return false;

            const newLayerStack = simplifiedStack.map(simpleLayer => {
                const newLayer = new Layer(simpleLayer.config);
                newLayer.name = simpleLayer.name || `Layer ${newLayer.id}`;
                newLayer.isVisible = simpleLayer.isVisible !== false;
                newLayer.opacity = simpleLayer.opacity || 1.0;
                newLayer.blendMode = simpleLayer.blendMode || 'source-over';
                newLayer.maskLayerId = simpleLayer.maskLayerId || null;
                return newLayer;
            });

            this.#planterInstance.setLayerStack(newLayerStack);
            const firstLayer = newLayerStack[0];
            if (firstLayer) this.#setActiveLayer(firstLayer.id);
            this.#planterInstance.generate();
            this.#saveState();
            return true;
        } catch (error) {
            console.error("Failed to parse config:", error);
            return false;
        }
    }
}
