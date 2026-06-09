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

        let hasWalls = false;
        let hasPaths = false;

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[0].length; x++) {
                if (grid[y][x] === 1) hasWalls = true;
                if (grid[y][x] === 0) hasPaths = true;
            }
        }

        expect(hasWalls).toBe(true);
        expect(hasPaths).toBe(true);
    });
});
