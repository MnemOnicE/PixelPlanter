
import { jest } from '@jest/globals';
import { NoiseGenerator } from '../src/generators/NoiseGenerator.js';
import { SeededRandom } from '../src/utils/PRNG.js';

describe('NoiseGenerator Determinism', () => {
    it('should produce identical results across different instances with the same seed', () => {
        const seed = 'test-seed-123';
        const config = { size: 32, noiseScale: 20, noiseThreshold: 0.5 };

        // Instance 1
        const prng1 = new SeededRandom(seed);
        const generator1 = new NoiseGenerator();
        const grid1 = generator1.run(config, prng1);

        // Instance 2
        const prng2 = new SeededRandom(seed);
        const generator2 = new NoiseGenerator();
        const grid2 = generator2.run(config, prng2);

        // Compare grids
        expect(grid1).toEqual(grid2);
    });
});
