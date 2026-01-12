/**
 * @file Planter.test.js
 * @description Integration/Unit tests for the Planter class.
 */


import { Planter } from '../src/Planter.js';
import { Layer } from '../src/Layer.js';

describe('Planter', () => {
    let planter;

    beforeEach(() => {
        planter = new Planter({ size: 10, pixelSize: 1 });
    });

    it('should initialize with default modules', () => {
        expect(planter.getGeneratorNames()).toContain('noise');
        expect(planter.getGeneratorNames()).toContain('cellular-automata');
        expect(planter.getPaletteNames()).toContain('monochrome');
        expect(planter.getModifierNames()).toContain('outline');
    });

    it('should add a layer', () => {
        const layer = planter.addLayer({ generator: 'noise' });
        expect(layer).toBeInstanceOf(Layer);
        expect(planter.getLayerStack()).toHaveLength(1);
        expect(planter.getLayerById(layer.id)).toBe(layer);
    });

    it('should remove a layer', () => {
        const layer = planter.addLayer({ generator: 'noise' });
        planter.removeLayer(layer.id);
        expect(planter.getLayerStack()).toHaveLength(0);
    });

    it('should generate output without errors', () => {
        planter.addLayer({ generator: 'noise', palette: 'monochrome' });
        const result = planter.generate();
        expect(result).toBe(planter);
        const layer = planter.getLayerStack()[0];
        expect(layer.dataGrid).toBeDefined();
        expect(layer.dataGrid.length).toBe(10);
    });

    it('should handle masking', () => {
        const maskLayer = planter.addLayer({
            generator: 'noise',
            palette: 'monochrome',
            noiseThreshold: 0,
            name: 'Mask',
        });

        const targetLayer = planter.addLayer({
            generator: 'noise',
            palette: 'monochrome',
            maskLayerId: maskLayer.id,
            name: 'Target',
        });

        // Use a mock generator to have deterministic output
        const MockGenerator = class {
            run({ value }) {
                return Array.from({ length: 10 }, () => Array(10).fill(value));
            }
        };
        // Register mock generator
        planter.registerGenerator('mock', new MockGenerator());

        maskLayer.config.generator = 'mock';
        maskLayer.config.value = 0; // Mask is 0 (blocking)

        targetLayer.config.generator = 'mock';
        targetLayer.config.value = 1; // Target is 1 (visible if not masked)

        planter.generate();

        const flatTarget = targetLayer.dataGrid.flat();
        expect(flatTarget.every((v) => v === 0)).toBe(true);

        // Change mask to all 1s (allowing)
        maskLayer.config.value = 1;
        planter.generate();

        const flatTarget2 = targetLayer.dataGrid.flat();
        expect(flatTarget2.every((v) => v === 1)).toBe(true);
    });
});
