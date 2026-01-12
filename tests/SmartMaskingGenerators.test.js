import { SymmetryGenerator } from '../src/generators/SymmetryGenerator.js';
import { AdvancedSymmetryGenerator } from '../src/generators/AdvancedSymmetryGenerator.js';
import { PatternGenerator } from '../src/generators/PatternGenerator.js';
import { SeededRandom } from '../src/utils/PRNG.js';

describe('Smart Masking Implementation for All Generators', () => {
    const size = 20;
    // Create a mask that covers the right half of the grid
    // 0 = masked (right half), 1 = allowed (left half)
    const inputMask = Array.from({ length: size }, (_, y) =>
        Array.from({ length: size }, (_, x) => {
            return x < size / 2 ? 1 : 0;
        }),
    );

    test('SymmetryGenerator strictly respects inputMask', () => {
        const generator = new SymmetryGenerator();
        const prng = new SeededRandom('symmetry-mask-test');

        // Ensure allowBlank is false to force generation attempts
        const config = { size, allowBlank: false };
        const result = generator.run(config, prng, inputMask);

        let outsideCount = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (result[y][x] === 1 && inputMask[y][x] === 0) {
                    outsideCount++;
                }
            }
        }
        expect(outsideCount).toBe(0);
    });

    test('AdvancedSymmetryGenerator strictly respects inputMask (Vertical)', () => {
        const generator = new AdvancedSymmetryGenerator();
        const prng = new SeededRandom('adv-sym-vertical');
        const config = { size, symmetryMode: 'vertical' };

        const result = generator.run(config, prng, inputMask);

        let outsideCount = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (result[y][x] === 1 && inputMask[y][x] === 0) {
                    outsideCount++;
                }
            }
        }
        expect(outsideCount).toBe(0);
    });

    test('AdvancedSymmetryGenerator strictly respects inputMask (Radial)', () => {
        const generator = new AdvancedSymmetryGenerator();
        const prng = new SeededRandom('adv-sym-radial');
        const config = { size, symmetryMode: 'radial' };

        const result = generator.run(config, prng, inputMask);

        let outsideCount = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (result[y][x] === 1 && inputMask[y][x] === 0) {
                    outsideCount++;
                }
            }
        }
        expect(outsideCount).toBe(0);
    });

    test('PatternGenerator strictly respects inputMask', () => {
        const generator = new PatternGenerator();
        const prng = new SeededRandom('pattern-test');

        // 5x5 pattern of all 1s
        const patternData = Array.from({ length: 5 }, () => Array(5).fill(1));

        // Place it in the middle (where the mask boundary is)
        // x=50, y=50 should center it roughly at 10,10.
        // Mask is x < 10 is 1, x >= 10 is 0.
        // So right part of pattern should be clipped.
        const config = { size, patternData, x: 50, y: 50 };

        const result = generator.run(config, prng, inputMask);

        let outsideCount = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (result[y][x] === 1 && inputMask[y][x] === 0) {
                    outsideCount++;
                }
            }
        }
        expect(outsideCount).toBe(0);
    });
});
