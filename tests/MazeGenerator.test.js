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
        expect(flatGrid.includes(1)).toBe(true);
        expect(flatGrid.includes(0)).toBe(true);
    });
});
