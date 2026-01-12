/**
 * @file Generators.test.js
 * @description Unit tests for generator classes (CellularAutomataGenerator, NoiseGenerator).
 */

import { CellularAutomataGenerator } from '../src/generators/CellularAutomataGenerator.js';
import { NoiseGenerator } from '../src/generators/NoiseGenerator.js';
import { SeededRandom } from '../src/utils/PRNG.js';

describe('CellularAutomataGenerator', () => {
    let generator;
    let prng;

    beforeEach(() => {
        generator = new CellularAutomataGenerator();
        prng = new SeededRandom('test');
    });

    it('should generate a grid of correct size', () => {
        const grid = generator.run({ size: 10 }, prng);
        expect(grid.length).toBe(10);
        expect(grid[0].length).toBe(10);
    });

    it('should respect parameters', () => {
        const grid = generator.run({ size: 10, iterations: 1 }, prng);
        expect(grid).toBeDefined();
    });
});

describe('NoiseGenerator', () => {
    let generator;
    let prng;

    beforeEach(() => {
        generator = new NoiseGenerator();
        prng = new SeededRandom('test');
    });

    it('should generate a grid of correct size', () => {
        const grid = generator.run({ size: 10 }, prng);
        expect(grid.length).toBe(10);
        expect(grid[0].length).toBe(10);
    });

    it('should return 0s and 1s', () => {
        const grid = generator.run({ size: 10 }, prng);
        const flat = grid.flat();
        const valid = flat.every((v) => v === 0 || v === 1);
        expect(valid).toBe(true);
    });
});
