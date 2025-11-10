import { jest } from '@jest/globals';
import 'jest-environment-jsdom';
import { UIManager } from '../src/UIManager.js';

jest.unstable_mockModule('../src/Planter.js', () => ({
    Planter: jest.fn().mockImplementation(() => ({
        getCanvas: () => document.createElement('canvas'),
        getGeneratorNames: () => ['noise'],
        getPaletteNames: () => ['monochrome'],
        getModifierNames: () => ['outline'],
        addLayer: jest.fn().mockReturnValue({ id: 1 }),
        getLayerById: jest.fn(),
        generate: jest.fn(),
        setLayerStack: jest.fn(),
        getLayerStack: () => [],
    })),
}));

jest.unstable_mockModule('driver.js', () => ({
    driver: jest.fn().mockReturnValue({ drive: jest.fn() }),
}));

describe('UIManager Preset Loading', () => {
    let uiManager;
    let Planter;

    beforeEach(async () => {
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
            </div>
            <div id="presets-modal" style="display: none;">
                <span class="close-button"></span>
                <div id="preset-gallery"></div>
            </div>
            <div id="modifiers-container"></div>
            <div id="generator-params"></div>
            <div id="modifier-params"></div>
            <div id="layer-panel">
                <button id="add-layer-btn"></button>
                <div id="layer-list"></div>
            </div>
            <div id="canvas-container"></div>
        `;

        global.localStorage = { getItem: jest.fn(), setItem: jest.fn() };
        Planter = (await import('../src/Planter.js')).Planter;
        uiManager = new UIManager();
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('should load presets and update the layer stack when a preset is clicked', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([
                    {
                        name: 'Test Preset',
                        preview: '',
                        config: 'W3sib25maWciOnsic2l6ZSI6MzIsInBpeGVsU2l6ZSI6MTUsImdlbmVyYXRvciI6Im5vaXNlIiwicGFsZXR0ZSI6Im1vbm9jaHJvbWUiLCJzZWVkIjoiMTIzNCIsIm1vZGlmaWVcnMiOltdfSwibmFtZSI6IlRlc3QgTGF5ZXIiLCJpc1Zpc2libGUiOnRydWUsIm9wYWNpdHkiOjEsImJsZW5kTW9kZSI6InNvdXJjZS1vdmVyIiwibWFza0xheWVySWQiOm51bGx9XQ==',
                    },
                ]),
            })
        );

        const showPresetsBtn = document.getElementById('show-presets-btn');
        await uiManager['#handleShowPresets']();

        const presetItem = document.querySelector('.preset-item');
        expect(presetItem).not.toBeNull();
        presetItem.click();

        const planterInstance = Planter.mock.instances[0];
        expect(planterInstance.setLayerStack).toHaveBeenCalled();
        const callArg = planterInstance.setLayerStack.mock.calls[0][0];
        expect(callArg[0].name).toBe('Test Layer');
    });
});
