/**
 * @file test.js
 * @description Unit tests for UIManager and preset loading logic.
 */



// Mock the Planter class to isolate UIManager tests
vi.mock('../src/Planter.js', () => ({
    Planter: vi.fn().mockImplementation(() => ({
        getCanvas: () => document.createElement('canvas'),
        getGeneratorNames: () => ['noise'],
        getPaletteNames: () => ['monochrome'],
        getModifierNames: () => ['outline'],
        addLayer: vi.fn().mockReturnValue({ id: 1, config: { modifiers: [] } }),
        getLayerById: vi.fn().mockReturnValue({ id: 1, config: { modifiers: [] } }),
        generate: vi.fn(),
        setLayerStack: vi.fn(),
        getLayerStack: vi.fn().mockReturnValue([]),
        getGenerator: vi.fn(),
        getModifier: vi.fn(),
        getPatternNames: vi.fn().mockReturnValue([]),
        moveLayer: vi.fn(),
        removeLayer: vi.fn(),
        drawOnLayer: vi.fn(),
        render: vi.fn(),
    })),
}));

// Mock the driver.js library
vi.mock('driver.js', () => ({
    driver: vi.fn().mockReturnValue({ drive: vi.fn() }),
}));

// Import dynamically after mocks
const { UIManager } = await import('../src/UIManager.js');
const { Planter } = await import('../src/Planter.js');

describe('UIManager Preset Loading', () => {
    let uiManager;

    beforeEach(async () => {
        // Setup a mock DOM
        document.body.innerHTML = `
            <div id="controls">
                <button id="show-presets-btn"></button>
                <select id="generator-select"></select>
                <select id="palette-select"></select>
                <input id="size-input" value="32"/>
                <input id="pixel-size-input" value="15"/>
                <input id="seed-input"/>
                <button id="generate-btn"></button>
                <button id="randomize-btn"></button>
                <select id="symmetry-select"></select>
                <button id="export-json-btn"></button>
                <button id="undo-btn"></button>
                <button id="redo-btn"></button>
                <button id="share-btn"></button>
                <input type="checkbox" id="mode-toggle"/>
                <button id="add-layer-btn"></button>
                <button id="save-btn"></button>
                <input type="radio" name="tool" value="brush" />
                <input type="radio" name="tool" value="eraser" />
                <input type="radio" name="tool" value="fill" />
                <input id="brush-size" value="1"/>
                <span id="brush-size-val"></span>
            </div>
            <div id="presets-modal" style="display: none;">
                <span class="close-button"></span>
                <div id="preset-gallery"></div>
            </div>
            <div id="factory-modal" style="display: none;">
                <span class="close-button"></span>
                <input id="factory-rows" value="4" />
                <input id="factory-cols" value="4" />
                <input id="factory-padding" value="2" />
                <input id="factory-variance" value="20" />
                <button id="factory-generate-btn"></button>
            </div>
            <button id="show-factory-btn"></button>
            <div id="modifiers-container"></div>
            <div id="generator-params"></div>
            <div id="modifier-params"></div>
            <div id="layer-panel">
                <div id="layer-list"></div>
            </div>
            <div id="canvas-container"></div>
        `;

        global.localStorage = { getItem: jest.fn(), setItem: jest.fn() };
        uiManager = new UIManager();
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('should load presets and update the layer stack when a preset is clicked', async () => {
        const configObj = [
            {
                config: {
                    size: 32,
                    pixelSize: 15,
                    generator: 'noise',
                    palette: 'monochrome',
                    seed: '1234',
                    modifiers: [],
                },
                name: 'Test Layer',
                isVisible: true,
                opacity: 1,
                blendMode: 'source-over',
                maskLayerId: null,
            },
        ];
        const configStr = btoa(encodeURIComponent(JSON.stringify(configObj)));
        // Note: UIManager uses decodeURIComponent(atob(configStr)) so we must encodeURIComponent before btoa.

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve([
                        {
                            name: 'Test Preset',
                            preview: '',
                            config: configStr,
                        },
                    ]),
            }),
        );

        const showPresetsBtn = document.getElementById('show-presets-btn');
        showPresetsBtn.click();

        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        const presetItem = document.querySelector('.preset-item');
        expect(presetItem).not.toBeNull();
        presetItem.click();

        const planterInstance = Planter.mock.results[0].value;
        expect(planterInstance.setLayerStack).toHaveBeenCalled();
        const callArg = planterInstance.setLayerStack.mock.calls[0][0];
        expect(callArg[0].name).toBe('Test Layer');
    });

    it('should preserve dataGrid on undo', async () => {
        // Setup initial state with a manual dataGrid modification
        const manualGrid = [
            [1, 0],
            [0, 1],
        ];
        const stateWithData = {
            activeLayerId: 1,
            layers: [
                {
                    id: 1,
                    name: 'Manual Layer',
                    config: { generator: 'noise', seed: '123' },
                    dataGrid: manualGrid,
                    isVisible: true,
                    type: 'normal',
                },
            ],
        };

        // Manually push to history (accessing private member via loose JavaScript, or just use addState)
        // Since historyManager is private, we can't access it easily.
        // But we can trick UIManager by overwriting its save behavior or just simulating a restore.
        // Actually, we can trigger saveState by calling an action.

        // Let's use the mock Planter to verify setLayerStack receives the grid.
        // We need to inject a state into history.
        // UIManager doesn't expose history.
        // But we can trigger a save by generating.

        // Wait, the easiest way to test this without exposing internals is to rely on the fact
        // that restoreState calls setLayerStack.
        // But we can't easily inject a history state with dataGrid from the outside
        // because saveState is what creates it.
        // And saveState creates it from planter.getLayerStack().

        // So:
        // 1. Mock planter.getLayerStack() to return a layer WITH dataGrid.
        // 2. Call an action that triggers saveState (e.g. handleGenerateActiveLayer).
        // 3. Undo (which will go back to previous state).
        // Wait, undo goes BACK. We need at least 2 states.

        const planterInstance = Planter.mock.results[0].value;

        // State 1: Empty
        planterInstance.getLayerStack.mockReturnValue([{ id: 1, config: {}, dataGrid: [] }]);
        uiManager.handleGenerateActiveLayer(); // Saves State 1

        // State 2: With Data
        const dataGrid = [
            [9, 9],
            [9, 9],
        ];
        planterInstance.getLayerStack.mockReturnValue([
            {
                id: 1,
                config: { generator: 'noise' },
                dataGrid: dataGrid,
                isVisible: true,
                opacity: 1,
                blendMode: 'source-over',
                maskLayerId: null,
                type: 'normal',
            },
        ]);
        uiManager.handleGenerateActiveLayer(); // Saves State 2

        // Now Undo -> Should go back to State 1?
        // Wait, if we are at State 2, Undo goes to State 1.
        // We want to verify State 2 has the dataGrid saved.
        // So we should Undo, then Redo?

        const undoBtn = document.getElementById('undo-btn');
        undoBtn.click(); // Back to State 1

        const redoBtn = document.getElementById('redo-btn');
        redoBtn.click(); // Forward to State 2

        // Check if setLayerStack was called with the dataGrid from State 2
        // The last call to setLayerStack should correspond to the redo.
        const lastCallArgs = planterInstance.setLayerStack.mock.lastCall[0];
        expect(lastCallArgs[0].dataGrid).toEqual(dataGrid);

        // And expect render to be called instead of generate
        expect(planterInstance.render).toHaveBeenCalled();
    });
});
