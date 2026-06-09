import { describe, it, expect } from 'vitest';
import { MazeGenerator } from '../src/generators/MazeGenerator.js';
import { SeededRandom } from '../src/utils/PRNG.js';

describe('MazeGenerator', () => {
    it('generates a grid of the correct size', () => {
        const generator = new MazeGenerator();
        const prng = new SeededRandom('test');
        const grid = generator.run({ size: 15, complexity: 5 }, prng);

        expect(grid.length).toBe(15);
        expect(grid[0].length).toBe(15);
    });

    it('generates walls (1) and paths (0)', () => {
        const generator = new MazeGenerator();
        const prng = new SeededRandom('test');
        const grid = generator.run({ size: 15, complexity: 5 }, prng);

        const flatGrid = grid.flat();
        const hasWalls = flatGrid.some(v => v === 1);
        const hasPaths = flatGrid.some(v => v === 0);
        expect(hasWalls).toBe(true);
        expect(hasPaths).toBe(true);
    });
});
