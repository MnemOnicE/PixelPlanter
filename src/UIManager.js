/**
 * @file UIManager.js
 * @description Manages the user interface and interactions.
 */
import { driver } from 'driver.js';
import { Planter } from './Planter.js';
import { HistoryManager } from './HistoryManager.js';
import { Layer } from './Layer.js';
import { LayerPanel } from './ui/LayerPanel.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { TutorialManager } from './ui/TutorialManager.js';
import { CanvasInput } from './ui/CanvasInput.js';

/**
 * Text content for UI tooltips.
 * @type {object}
 */
const TOOLTIP_TEXTS = {
    'generator-select': 'The core algorithm used to create the pattern.',
    'seed-input':
        'A number or string that determines the random pattern. The same seed will always produce the same image.',
    'palette-select': 'The set of colors used in the artwork.',
    'size-input': 'The number of cells in the grid (e.g., 32x32).',
    'pixel-size-input': "The size of each 'pixel' in the final image.",
    'modifiers-container': 'Optional effects that alter the generated image.',
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
     * @type {LayerPanel}
     * @private
     */
    #layerPanel;

    /**
     * Settings panel for generator and modifier parameters.
     * @type {SettingsPanel}
     * @private
     */
    #settingsPanel;

    /**
     * Canvas input handler.
     * @type {CanvasInput}
     * @private
     */
    #canvasInput;

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
     * Current drawing tool.
     * @type {string}
     * @private
     */
    #activeTool = 'brush';

    /**
     * Current brush size.
     * @type {number}
     * @private
     */
    #activeBrushSize = 1;

    /**
     * State flag for mouse drag operations.
     * @type {boolean}
     * @private
     */

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
    #tutorialsModal;
    #tutorialGallery;
    #closeTutorialsBtn;

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
    }

    /**
     * Binds DOM elements to class properties for easy access.
     * @private
     */
    #bindDOM() {
        this.#controls.generatorSelect = document.getElementById('generator-select');
        this.#controls.paletteSelect = document.getElementById('palette-select');
        this.#controls.paletteSwatches = document.getElementById('palette-swatches');
        this.#controls.sizeInput = document.getElementById('size-input');
        this.#controls.pixelSizeInput = document.getElementById('pixel-size-input');
        this.#controls.seedInput = document.getElementById('seed-input');
        this.#controls.generateBtn = document.getElementById('generate-btn');
        this.#controls.randomizeBtn = document.getElementById('randomize-btn');
        this.#controls.symmetrySelect = document.getElementById('symmetry-select');
        // this.#layerPanel is now a class instance, not the element itself.
        this.#controls.addLayerBtn = document.getElementById('add-layer-btn');
        this.#controls.layerList = document.getElementById('layer-list');
        this.#canvasContainer = document.getElementById('canvas-container');
        this.#modifiersContainer = document.getElementById('modifiers-container');
        this.#generatorParamsContainer = document.getElementById('generator-params');
        this.#modifierParamsContainer = document.getElementById('modifier-params');
        this.#controls.saveBtn = document.getElementById('save-btn');
        this.#controls.exportJsonBtn = document.getElementById('export-json-btn');
        this.#controls.exportSvgBtn = document.getElementById('export-svg-btn');
        this.#controls.undoBtn = document.getElementById('undo-btn');
        this.#controls.redoBtn = document.getElementById('redo-btn');
        this.#controls.shareBtn = document.getElementById('share-btn');
        this.#controls.showPresetsBtn = document.getElementById('show-presets-btn');
        this.#controls.showTutorialsBtn = document.getElementById('show-tutorials-btn');
        this.#tutorialsModal = document.getElementById('tutorials-modal');
        this.#tutorialGallery = document.getElementById('tutorial-gallery');
        this.#closeTutorialsBtn = this.#tutorialsModal.querySelector('.close-button');
        this.#presetsModal = document.getElementById('presets-modal');
        this.#presetGallery = document.getElementById('preset-gallery');
        this.#closePresetsBtn = this.#presetsModal.querySelector('.close-button');
        this.#controls.showFactoryBtn = document.getElementById('show-factory-btn');
        this.#factoryModal = document.getElementById('factory-modal');
        this.#closeFactoryBtn = this.#factoryModal.querySelector('.close-button');
        this.#controls.factoryGenerateBtn = document.getElementById('factory-generate-btn');
        this.#controls.toolRadios = document.querySelectorAll('input[name="tool"]');
        this.#controls.brushSize = document.getElementById('brush-size');
        this.#controls.brushSizeVal = document.getElementById('brush-size-val');

        // Mobile Controls
        this.#controls.toggleLeftSidebarBtn = document.getElementById('toggle-left-sidebar');
        this.#controls.toggleRightSidebarBtn = document.getElementById('toggle-right-sidebar');
        this.#controls.mobileGenerateBtn = document.getElementById('generate-btn-mobile');
        this.#controls.sidebarLeft = document.getElementById('sidebar-left');
        this.#controls.sidebarRight = document.getElementById('sidebar-right');
        this.#controls.stage = document.getElementById('stage');
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

        this.#layerPanel = new LayerPanel(
            this.#planterInstance,
            document.getElementById('layer-list'),
            (action, ...args) => this.#handleLayerPanelAction(action, ...args)
        );

        this.#settingsPanel = new SettingsPanel(
            this.#planterInstance,
            this.#generatorParamsContainer,
            this.#modifierParamsContainer,
            (type, data) => {
                 // Future: handle real-time updates
            }
        );

        this.#canvasInput = new CanvasInput(
             this.#planterInstance,
             this.#canvasContainer,
             (data) => this.#handleBrushStrokeCallback(data),
             (data) => this.#handleFloodFillCallback(data)
        );

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
        this.#controls.exportSvgBtn.addEventListener('click', () => this.#handleExportSVG());
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

        this.#controls.symmetrySelect.addEventListener('change', (e) => {
             this.#activeSymmetryMode = e.target.value;
             this.#canvasInput.setSymmetryMode(this.#activeSymmetryMode);
        });

        this.#controls.paletteSelect.addEventListener('change', () => this.#updatePaletteSwatches());

        this.#controls.toolRadios.forEach((radio) => {
            radio.addEventListener('change', (e) => {
                this.#activeTool = e.target.value;
                this.#canvasInput.setTool(this.#activeTool);
            });
        });
        this.#controls.brushSize.addEventListener('input', (e) => {
            this.#activeBrushSize = parseInt(e.target.value);
            this.#controls.brushSizeVal.textContent = this.#activeBrushSize;
            this.#canvasInput.setBrushSize(this.#activeBrushSize);
        });

        this.#controls.showPresetsBtn.addEventListener('click', () => this.#handleShowPresets());

        this.#controls.showTutorialsBtn.addEventListener('click', () => this.#handleShowTutorials());
        this.#closeTutorialsBtn.addEventListener('click', () => (this.#tutorialsModal.style.display = 'none'));
        window.addEventListener('click', (event) => {
            if (event.target == this.#tutorialsModal) {
                this.#tutorialsModal.style.display = 'none';
            }
        });

        this.#tutorialGallery.addEventListener('click', (event) => {
            const tutorialItem = event.target.closest('.tutorial-item');
            if (tutorialItem) {
                const tutorialId = tutorialItem.dataset.id;
                this.#tutorialsModal.style.display = 'none';
                TutorialManager.startTutorial(tutorialId);
            }
        });
        this.#closePresetsBtn.addEventListener('click', () => (this.#presetsModal.style.display = 'none'));
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

        this.#controls.showFactoryBtn.addEventListener('click', () => (this.#factoryModal.style.display = 'block'));
        this.#closeFactoryBtn.addEventListener('click', () => (this.#factoryModal.style.display = 'none'));
        window.addEventListener('click', (event) => {
            if (event.target == this.#factoryModal) {
                this.#factoryModal.style.display = 'none';
            }
        });
        this.#controls.factoryGenerateBtn.addEventListener('click', () => this.#handleGenerateBatch());


        // Collapsible sections
        document.querySelectorAll('.collapsible').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                const content = header.nextElementSibling;
                if (content && content.classList.contains('section-content')) {
                    content.classList.toggle('collapsed');
                }
            });
        });

        // Mobile Sidebar Toggles
        if (this.#controls.toggleLeftSidebarBtn) {
            this.#controls.toggleLeftSidebarBtn.addEventListener('click', () => {
                this.#controls.sidebarLeft.classList.toggle('active');
                this.#controls.toggleLeftSidebarBtn.classList.toggle('active');
                // Close other sidebar
                this.#controls.sidebarRight.classList.remove('active');
                this.#controls.toggleRightSidebarBtn.classList.remove('active');
            });
        }

        if (this.#controls.toggleRightSidebarBtn) {
            this.#controls.toggleRightSidebarBtn.addEventListener('click', () => {
                this.#controls.sidebarRight.classList.toggle('active');
                this.#controls.toggleRightSidebarBtn.classList.toggle('active');
                // Close other sidebar
                this.#controls.sidebarLeft.classList.remove('active');
                this.#controls.toggleLeftSidebarBtn.classList.remove('active');
            });
        }

        if (this.#controls.mobileGenerateBtn) {
            this.#controls.mobileGenerateBtn.addEventListener('click', () => {
                this.handleGenerateActiveLayer();
                // Close sidebars to see result
                this.#controls.sidebarLeft.classList.remove('active');
                this.#controls.sidebarRight.classList.remove('active');
                this.#controls.toggleLeftSidebarBtn.classList.remove('active');
                this.#controls.toggleRightSidebarBtn.classList.remove('active');
            });
        }

        // Close sidebars when clicking on stage (mobile UX)
        if (this.#controls.stage) {
            this.#controls.stage.addEventListener('click', (e) => {
                // Only if not interacting with canvas (though canvas is in stage)
                // Actually, if we are painting, we probably want to see the canvas, so closing sidebars is good.
                // But we don't want to close if we are just clicking a zoom button (if we had one).
                // For now, clicking outside sidebars closes them.
                if (window.innerWidth <= 900) {
                    this.#controls.sidebarLeft.classList.remove('active');
                    this.#controls.sidebarRight.classList.remove('active');
                    this.#controls.toggleLeftSidebarBtn.classList.remove('active');
                    this.#controls.toggleRightSidebarBtn.classList.remove('active');
                }
            });
        }
    }

    /**
     * Handles manual painting on the canvas via callback.
     * @param {object} data - Data from CanvasInput.
     * @private
     */
    #handleBrushStrokeCallback(data) {
        if (!this.#activeLayerId) return;

        const { x: canvasX, y: canvasY, brushSize, tool, symmetry } = data;
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { size, pixelSize } = layer.config;

        const centerX = Math.floor(canvasX / pixelSize);
        const centerY = Math.floor(canvasY / pixelSize);

        const points = [];
        const offset = Math.floor(brushSize / 2);

        for (let yOff = 0; yOff < brushSize; yOff++) {
            for (let xOff = 0; xOff < brushSize; xOff++) {
                points.push({
                    x: centerX - offset + xOff,
                    y: centerY - offset + yOff,
                });
            }
        }

        const value = tool === 'eraser' ? 0 : 1;
        const finalPoints = [];

        points.forEach((p) => {
            finalPoints.push(p);
            if (symmetry === 'vertical' || symmetry === 'quad') {
                finalPoints.push({ x: size - 1 - p.x, y: p.y });
            }
            if (symmetry === 'horizontal' || symmetry === 'quad') {
                finalPoints.push({ x: p.x, y: size - 1 - p.y });
            }
            if (symmetry === 'quad') {
                finalPoints.push({ x: size - 1 - p.x, y: size - 1 - p.y });
            }
        });

        this.#planterInstance.drawOnLayer(this.#activeLayerId, finalPoints, value);
        this.#planterInstance.generate();
        this.#saveState();
    }

    /**
     * Handles flood fill on the canvas via callback.
     * @param {object} data - Data from CanvasInput.
     * @private
     */
    #handleFloodFillCallback(data) {
        if (!this.#activeLayerId) return;

        const { x: canvasX, y: canvasY } = data;
        const layer = this.#planterInstance.getLayerById(this.#activeLayerId);
        const { pixelSize } = layer.config;

        const gridX = Math.floor(canvasX / pixelSize);
        const gridY = Math.floor(canvasY / pixelSize);

        const value = 1;

        this.#planterInstance.floodFillLayer(this.#activeLayerId, gridX, gridY, value);
        this.#planterInstance.generate();
        this.#saveState();
    }

    /**
     * Renders the layer panel list, including controls for each layer.
     * @private
     */
    #renderLayerPanel() {
        this.#layerPanel.render();
        if (this.#activeLayerId !== null) {
            this.#layerPanel.updateActiveState(this.#activeLayerId);
        }
    }

    /**
     * Handles actions from the LayerPanel.
     * @param {string} action - The action name.
     * @param {any[]} args - Arguments associated with the action.
     * @private
     */
    #handleLayerPanelAction(action, ...args) {
        const [layerId, value] = args;
        const layer = this.#planterInstance.getLayerById(layerId);

        switch (action) {
            case 'select':
                this.#setActiveLayer(layerId);
                break;
            case 'delete':
                this.#handleRemoveLayer(layerId);
                break;
            case 'moveUp':
                this.#planterInstance.moveLayer(layerId, 'up');
                this.#renderLayerPanel();
                this.#saveState();
                break;
            case 'moveDown':
                this.#planterInstance.moveLayer(layerId, 'down');
                this.#renderLayerPanel();
                this.#saveState();
                break;
            case 'reorder':
                this.#planterInstance.reorderLayer(layerId, value);
                this.#renderLayerPanel();
                this.#saveState();
                break;
            case 'copyMods':
                this.#copyModifierStack(layerId);
                break;
            case 'pasteMods':
                this.#pasteModifierStack(layerId);
                break;
            case 'toggleVisibility':
                if (layer) {
                    layer.isVisible = value;
                    this.#planterInstance.generate();
                    this.#saveState();
                }
                break;
            case 'updateType':
                if (layer) {
                    layer.type = value;
                    this.#planterInstance.generate();
                    this.#saveState();
                }
                break;
            case 'updateOpacity':
                if (layer) {
                    layer.opacity = value;
                    this.#planterInstance.generate();
                    this.#saveState();
                }
                break;
            case 'updateBlendMode':
                if (layer) {
                    layer.blendMode = value;
                    this.#planterInstance.generate();
                    this.#saveState();
                }
                break;
            case 'updateName':
                if (layer) {
                    layer.name = value;
                    this.#saveState();
                }
                break;
            case 'updateMask':
                if (layer) {
                    layer.maskLayerId = value;
                    this.#planterInstance.generate();
                    this.#saveState();
                }
                break;
        }
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
    /**
     * Loads and displays the tutorials modal.
     * Fetches tutorials from `src/tutorials.json` if not already loaded.
     * @private
     */
    async #handleShowTutorials() {
        if (this.#tutorialGallery.children.length === 0) {
            try {
                const response = await fetch('./src/tutorials.json');
                const tutorials = await response.json();
                this.#populateTutorialGallery(tutorials);
            } catch (error) {
                console.error('Failed to load tutorials:', error);
                this.#tutorialGallery.textContent = '';
                const p = document.createElement('p');
                p.textContent = 'Could not load tutorials.';
                this.#tutorialGallery.appendChild(p);
            }
        }
        this.#tutorialsModal.style.display = 'block';
    }

    /**
     * Populates the tutorial gallery with items.
     * @param {object[]} tutorials - List of tutorial objects.
     * @private
     */
    #populateTutorialGallery(tutorials) {
        this.#tutorialGallery.innerHTML = '';
        tutorials.forEach((tutorial) => {
            const div = document.createElement('div');
            div.className = 'tutorial-item';
            div.dataset.id = tutorial.id;
            div.style.cssText = `
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 10px;
                cursor: pointer;
                background-color: var(--surface);
                text-align: center;
                transition: transform 0.2s;
            `;

            div.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">${tutorial.title}</div>
                <div style="font-size: 0.8em; color: var(--text-muted);">${tutorial.description}</div>
            `;

            div.addEventListener('mouseover', () => (div.style.transform = 'scale(1.05)'));
            div.addEventListener('mouseout', () => (div.style.transform = 'scale(1)'));

            this.#tutorialGallery.appendChild(div);
        });
    }

    async #handleShowPresets() {
        if (this.#presetGallery.children.length === 0) {
            try {
                const response = await fetch('./src/presets.json');
                const presets = await response.json();
                this.#populatePresetGallery(presets);
            } catch (error) {
                console.error('Failed to load presets:', error);
                this.#presetGallery.textContent = '';
                const p = document.createElement('p');
                p.textContent = 'Could not load presets.';
                this.#presetGallery.appendChild(p);
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
        this.#presetGallery.textContent = '';
        presets.forEach((preset) => {
            const item = document.createElement('div');
            item.className = 'preset-item';
            item.dataset.config = preset.config;
                        const nameDiv = document.createElement('div');
            nameDiv.className = 'preset-name';
            nameDiv.textContent = preset.name;

            const descDiv = document.createElement('div');
            descDiv.className = 'preset-desc';
            descDiv.textContent = preset.description;

            item.appendChild(nameDiv);
            item.appendChild(descDiv);
            this.#presetGallery.appendChild(item);
        });
    }

    /**
     * Randomizes all settings for the active layer.
     * @private
     */
    #handleRandomizeAll() {
        if (!this.#activeLayerId) {
            alert('Please add or select a layer to randomize.');
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
        allModifierCheckboxes.forEach((cb) => (cb.checked = false));
        this.#updateModifierParamsUI([]);

        this.handleGenerateActiveLayer();
    }

    /**
     * Gathers configuration data from the main control panel.
     * @returns {object} The configuration object.
     * @private
     */
    #getConfigFromMainControls() {
        // Base config from main controls
        const config = {
            generator: this.#controls.generatorSelect.value,
            palette: this.#controls.paletteSelect.value,
            seed: this.#controls.seedInput.value || Date.now().toString(),
            modifiers: [],
        };

        // Get dynamic generator params from SettingsPanel
        const dynamicConfig = this.#settingsPanel.getConfig();
        Object.assign(config, dynamicConfig); // Merge dynamic params into top-level config (except modifiers)

        // Get modifier params
        const modifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]:checked');
        modifierCheckboxes.forEach((checkbox) => {
            const modName = checkbox.dataset.modifierName;
            const modConfig = this.#settingsPanel.getModifierParams(modName);
            config.modifiers.push(modConfig);
        });

        // The SettingsPanel.getConfig() currently returns an object with `modifiers: []` and other keys.
        // We shouldn't overwrite the main config modifiers array.
        // Actually, SettingsPanel.getConfig implementation returns dynamic params mixed in the object.
        // But it initializes modifiers to [].
        // Let's rely on the above logic which is consistent with the refactor.

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
        this.#updatePaletteSwatches();
        this.#controls.seedInput.value = config.seed;
        this.#updateGeneratorParamsUI(config.generator, config);
        const allModifierCheckboxes = this.#modifiersContainer.querySelectorAll('input[type="checkbox"]');
        allModifierCheckboxes.forEach((checkbox) => {
            checkbox.checked = config.modifiers.some((m) => m.name === checkbox.dataset.modifierName);
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
            let label =
                controlId === 'modifiers-container'
                    ? el.previousElementSibling
                    : document.querySelector(`label[for="${controlId}"]`);
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
                this.#controls.generatorSelect.textContent = '';
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.#controls.generatorSelect.appendChild(opt);
        });
    }

    /**
     * Populates the palette select dropdown.
     * @private
     */

    /**
     * Updates the color swatches below the palette dropdown.
     * @private
     */
    #updatePaletteSwatches() {
        if (!this.#controls.paletteSwatches) return;
        this.#controls.paletteSwatches.textContent = '';
        const selectedPaletteName = this.#controls.paletteSelect.value;
        const paletteInstance = this.#planterInstance.getPaletteInstance(selectedPaletteName);

        if (paletteInstance && paletteInstance.colors) {
            paletteInstance.colors.forEach(colorHex => {
                const swatch = document.createElement('div');
                swatch.className = 'swatch';
                swatch.style.backgroundColor = colorHex;
                swatch.title = colorHex;
                this.#controls.paletteSwatches.appendChild(swatch);
            });
        }
    }

    #populatePaletteOptions() {
        const names = this.#planterInstance.getPaletteNames();
                this.#controls.paletteSelect.textContent = '';
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.#controls.paletteSelect.appendChild(opt);
        });
        this.#updatePaletteSwatches();
    }

    /**
     * Populates the modifier checkbox list.
     * @private
     */
    #populateModifierOptions() {
        const names = this.#planterInstance.getModifierNames();
                this.#modifiersContainer.textContent = '';
        names.forEach(name => {
            const label = document.createElement('label');
            label.className = 'modifier-checkbox';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.setAttribute('data-modifier-name', name);

            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + name));
            this.#modifiersContainer.appendChild(label);
        });
    }

    /**
     * Dynamically builds UI controls for generator parameters.
     * @param {string} generatorName - The name of the generator.
     * @param {object} config - Current configuration values.
     * @private
     */
    #updateGeneratorParamsUI(generatorName, config) {
        this.#settingsPanel.updateGeneratorParamsUI(generatorName, config);
    }

    /**
     * Dynamically builds UI controls for modifier parameters.
     * @param {object[]} modifiersConfig - List of active modifier configurations.
     * @private
     */
    #updateModifierParamsUI(modifiersConfig) {
        this.#settingsPanel.updateModifierParamsUI(modifiersConfig);
    }

    /**
     * Exports the current layer stack to a JSON file.
     * @private
     */

    /**
     * Exports the final canvas as an SVG file.
     * @private
     */
    #handleExportSVG() {
        const canvas = this.#planterInstance.getCanvas();
        if (!canvas) return;

        const w = canvas.width;
        const h = canvas.height;
        const data = canvas.getContext('2d').getImageData(0, 0, w, h).data;
        const rects = [];

        for (let idx = 0; idx < data.length; idx += 4) {
            const alpha = data[idx + 3] / 255;
            if (alpha > 0) {
                rects.push(`<rect x="${(idx / 4) % w}" y="${Math.floor((idx / 4) / w)}" width="1" height="1" fill="rgba(${data[idx]},${data[idx+1]},${data[idx+2]},${alpha})" />`);
            }
        }

        this.#triggerFileDownload(
            new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">\n`, ...rects, '\n</svg>'], { type: 'image/svg+xml' }),
            'pixel-planter-export.svg'
        );
    }

    #triggerFileDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    #handleExportJSON() {
        const layerStack = this.#planterInstance.getLayerStack();
        const simplifiedStack = layerStack.map((layer) => ({
            config: layer.config,
            name: layer.name,
            isVisible: layer.isVisible,
            opacity: layer.opacity,
            blendMode: layer.blendMode,
            maskLayerId: layer.maskLayerId,
            type: layer.type,
        }));
        const jsonString = JSON.stringify(simplifiedStack, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'pixel-planter-export.json';
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
        const state = layerStack.map((layer) => {
            const newLayer = new Layer(JSON.parse(JSON.stringify(layer.config)));
            newLayer.id = layer.id;
            newLayer.name = layer.name;
            newLayer.isVisible = layer.isVisible;
            newLayer.opacity = layer.opacity;
            newLayer.blendMode = layer.blendMode;
            newLayer.maskLayerId = layer.maskLayerId; // IMPORTANT: Persist mask ID
            newLayer.type = layer.type || 'normal';
            // Persist the dataGrid in history to preserve manual edits.
            newLayer.dataGrid = JSON.parse(JSON.stringify(layer.dataGrid));
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
        const newLayerStack = state.layers.map((simpleLayer) => {
            const newLayer = new Layer(simpleLayer.config);
            newLayer.id = simpleLayer.id;
            newLayer.name = simpleLayer.name;
            newLayer.isVisible = simpleLayer.isVisible;
            newLayer.opacity = simpleLayer.opacity;
            newLayer.blendMode = simpleLayer.blendMode;
            newLayer.maskLayerId = simpleLayer.maskLayerId;
            newLayer.type = simpleLayer.type || 'normal';
            newLayer.dataGrid = simpleLayer.dataGrid || [];
            return newLayer;
        });
        this.#planterInstance.setLayerStack(newLayerStack);
        this.#activeLayerId = state.activeLayerId;
        const newActiveLayer =
            this.#planterInstance.getLayerById(this.#activeLayerId) || newLayerStack[newLayerStack.length - 1];
        this.#setActiveLayer(newActiveLayer ? newActiveLayer.id : null);
        this.#planterInstance.render();
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
        const simplifiedStack = layerStack.map((layer) => ({
            config: layer.config,
            name: layer.name,
            isVisible: layer.isVisible,
            opacity: layer.opacity,
            blendMode: layer.blendMode,
            maskLayerId: layer.maskLayerId,
            type: layer.type,
        }));
        const jsonString = JSON.stringify(simplifiedStack);
        const base64String = btoa(encodeURIComponent(jsonString));
        const shareableURL = `${window.location.origin}${window.location.pathname}?config=${base64String}`;
        navigator.clipboard
            .writeText(shareableURL)
            .then(() => alert('Link copied to clipboard!'))
            .catch((err) => console.error('Failed to copy link: ', err));
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

            const newLayerStack = simplifiedStack.map((simpleLayer) => {
                const newLayer = new Layer(simpleLayer.config);
                newLayer.name = simpleLayer.name || `Layer ${newLayer.id}`;
                newLayer.isVisible = simpleLayer.isVisible !== false;
                newLayer.opacity = simpleLayer.opacity || 1.0;
                newLayer.blendMode = simpleLayer.blendMode || 'source-over';
                newLayer.maskLayerId = simpleLayer.maskLayerId || null;
                newLayer.type = simpleLayer.type || 'normal';
                return newLayer;
            });

            this.#planterInstance.setLayerStack(newLayerStack);
            const firstLayer = newLayerStack[0];
            if (firstLayer) this.#setActiveLayer(firstLayer.id);
            this.#planterInstance.generate();
            this.#saveState();
            return true;
        } catch (error) {
            console.error('Failed to parse config:', error);
            return false;
        }
    }
}
