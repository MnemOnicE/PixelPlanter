/**
 * @file Layer.test.js
 * @description Unit tests for the Layer class.
 */

import { Layer } from '../src/Layer.js';

describe('Layer', () => {
    it('should initialize with config', () => {
        const config = { generator: 'noise' };
        const layer = new Layer(config);
        expect(layer.config).toBe(config);
        expect(layer.isVisible).toBe(true);
        expect(layer.dataGrid).toEqual([]);
    });

    it('should generate grid using planter instance', () => {
        const layer = new Layer({ generator: 'mock', seed: 'test' });

        const mockGrid = [[1]];
        const mockGenerator = {
            run: vi.fn().mockReturnValue(mockGrid),
        };
        const mockPRNG = {};

        const mockPlanter = {
            getPRNG: vi.fn().mockReturnValue(mockPRNG),
            getGeneratorInstance: vi.fn().mockReturnValue(mockGenerator),
            getModifierInstance: vi.fn(),
        };

        layer.generate(mockPlanter);

        expect(mockPlanter.getPRNG).toHaveBeenCalledWith('test');
        expect(mockPlanter.getGeneratorInstance).toHaveBeenCalledWith('mock');
        expect(mockGenerator.run).toHaveBeenCalledWith(layer.config, mockPRNG, null);
        expect(layer.dataGrid).toBe(mockGrid);
    });

    it('should apply modifiers', () => {
        const layer = new Layer({
            generator: 'mock',
            seed: 'test',
            modifiers: [{ name: 'mod1', val: 10 }],
        });

        const initialGrid = [[1]];
        const modifiedGrid = [[2]];

        const mockGenerator = { run: () => initialGrid };
        const mockModifier = { apply: vi.fn().mockReturnValue(modifiedGrid) };
        const mockPRNG = {};

        const mockPlanter = {
            getPRNG: () => mockPRNG,
            getGeneratorInstance: () => mockGenerator,
            getModifierInstance: vi.fn().mockReturnValue(mockModifier),
        };

        layer.generate(mockPlanter);

        expect(mockPlanter.getModifierInstance).toHaveBeenCalledWith('mod1');
        expect(mockModifier.apply).toHaveBeenCalledWith(initialGrid, { name: 'mod1', val: 10 }, mockPRNG, null, null);
        expect(layer.dataGrid).toBe(modifiedGrid);
    });
});
