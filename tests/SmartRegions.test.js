
import { NoiseGenerator } from '../src/generators/NoiseGenerator.js';
import { CellularAutomataGenerator } from '../src/generators/CellularAutomataGenerator.js';
import { SeededRandom } from '../src/utils/PRNG.js';

describe('Smart Regions (Masking)', () => {
    const size = 10;
    const prng = new SeededRandom('test-seed');

    // Create a mask: left half 1, right half 0
    const mask = Array.from({ length: size }, (_, y) =>
        Array.from({ length: size }, (_, x) => (x < size / 2 ? 1 : 0))
    );

    test('NoiseGenerator respects inputMask', () => {
        const generator = new NoiseGenerator();
        const result = generator.run({ size, noiseScale: 5, noiseThreshold: 0.1 }, prng, mask);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (x >= size / 2) {
                    // Right half (masked out) must be 0
                    expect(result[y][x]).toBe(0);
                }
                // Left half can be 0 or 1, but we trust the generator logic there.
            }
        }
    });

    test('CellularAutomataGenerator respects inputMask', () => {
        const generator = new CellularAutomataGenerator();
        const result = generator.run({ size, iterations: 2, initialChance: 1.0 }, prng, mask);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (x >= size / 2) {
                    // Right half (masked out) must be 0
                    expect(result[y][x]).toBe(0);
                } else {
                    // Left half was initialized with 100% chance, so it should have life
                    // (unless died by overcrowding, but iterations=2 is short)
                    // Actually, let's just check that it didn't leak.
                }
            }
        }
    });
});
