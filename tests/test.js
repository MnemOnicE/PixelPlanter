/**
 * @file test.js
 * @description Unit tests for UIManager and preset loading logic.
 */
import { jest } from '@jest/globals';
import 'jest-environment-jsdom';

// Mock the Planter class to isolate UIManager tests
jest.unstable_mockModule('../src/Planter.js', () => ({
    Planter: jest.fn().mockImplementation(() => ({
        getCanvas: () => document.createElement('canvas'),
        getGeneratorNames: () => ['noise'],
        getPaletteNames: () => ['monochrome'],
        getModifierNames: () => ['outline'],
        addLayer: jest.fn().mockReturnValue({ id: 1, config: { modifiers: [] } }),
        getLayerById: jest.fn().mockReturnValue({ id: 1, config: { modifiers: [] } }),
        generate: jest.fn(),
        setLayerStack: jest.fn(),
        getLayerStack: () => [],
        getGenerator: jest.fn(),
        getModifier: jest.fn(),
        getPatternNames: jest.fn().mockReturnValue([]),
        moveLayer: jest.fn(),
        removeLayer: jest.fn(),
        drawOnLayer: jest.fn(),
    })),
}));

// Mock the driver.js library
jest.unstable_mockModule('driver.js', () => ({
    driver: jest.fn().mockReturnValue({ drive: jest.fn() }),
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
            </div>
            <div id="presets-modal" style="display: none;">
                <span class="close-button"></span>
                <div id="preset-gallery"></div>
            </div>
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
        const configObj = [{
            config: {size: 32, pixelSize: 15, generator: "noise", palette: "monochrome", seed: "1234", modifiers: []},
            name: "Test Layer",
            isVisible: true,
            opacity: 1,
            blendMode: "source-over",
            maskLayerId: null
        }];
        const configStr = btoa(encodeURIComponent(JSON.stringify(configObj)));
        // Note: UIManager uses decodeURIComponent(atob(configStr)) so we must encodeURIComponent before btoa.

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([
                    {
                        name: 'Test Preset',
                        preview: '',
                        config: configStr,
                    },
                ]),
            })
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
});
