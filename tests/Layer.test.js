import { jest } from '@jest/globals';
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
            run: jest.fn().mockReturnValue(mockGrid)
        };
        const mockPRNG = {};

        const mockPlanter = {
            getPRNG: jest.fn().mockReturnValue(mockPRNG),
            getGeneratorInstance: jest.fn().mockReturnValue(mockGenerator),
            getModifierInstance: jest.fn()
        };

        layer.generate(mockPlanter);

        expect(mockPlanter.getPRNG).toHaveBeenCalledWith('test');
        expect(mockPlanter.getGeneratorInstance).toHaveBeenCalledWith('mock');
        expect(mockGenerator.run).toHaveBeenCalledWith(layer.config, mockPRNG);
        expect(layer.dataGrid).toBe(mockGrid);
    });

    it('should apply modifiers', () => {
        const layer = new Layer({
            generator: 'mock',
            seed: 'test',
            modifiers: [{ name: 'mod1', val: 10 }]
        });

        const initialGrid = [[1]];
        const modifiedGrid = [[2]];

        const mockGenerator = { run: () => initialGrid };
        const mockModifier = { apply: jest.fn().mockReturnValue(modifiedGrid) };
        const mockPRNG = {};

        const mockPlanter = {
            getPRNG: () => mockPRNG,
            getGeneratorInstance: () => mockGenerator,
            getModifierInstance: jest.fn().mockReturnValue(mockModifier)
        };

        layer.generate(mockPlanter);

        expect(mockPlanter.getModifierInstance).toHaveBeenCalledWith('mod1');
        expect(mockModifier.apply).toHaveBeenCalledWith(initialGrid, { name: 'mod1', val: 10 }, mockPRNG, null);
        expect(layer.dataGrid).toBe(modifiedGrid);
    });
});
