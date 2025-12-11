
import { RecursiveGrowthGenerator } from '../src/generators/RecursiveGrowthGenerator.js';
import { SeededRandom } from '../src/utils/PRNG.js';

describe('Smart Masking (Recursive Growth)', () => {
    test('Growth respects inputMask boundaries', () => {
        const generator = new RecursiveGrowthGenerator();
        const prng = new SeededRandom('test-seed-fixed');
        const size = 20;

        // Create a mask that only allows a central 4x4 area
        // 0 = blocked, 1 = allowed
        const inputMask = Array.from({ length: size }, (_, y) =>
            Array.from({ length: size }, (_, x) => {
                const centerX = size / 2;
                const centerY = size / 2;
                return (Math.abs(x - centerX) < 2 && Math.abs(y - centerY) < 2) ? 1 : 0;
            })
        );

        // Configure to start points (some might be outside, some inside)
        const config = {
            size: size,
            startPoints: 50, // High number to ensure we hit the mask
            maxDepth: 10
        };

        const result = generator.run(config, prng, inputMask);

        // Verify no pixels are set outside the mask
        let insideCount = 0;
        let outsideCount = 0;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (result[y][x] === 1) {
                    if (inputMask[y][x] === 1) {
                        insideCount++;
                    } else {
                        outsideCount++;
                    }
                }
            }
        }

        // We expect NO outside pixels
        expect(outsideCount).toBe(0);
        // We expect SOME inside pixels (growth happened)
        expect(insideCount).toBeGreaterThan(0);
    });

    test('Growth works normally without mask', () => {
        const generator = new RecursiveGrowthGenerator();
        const prng = new SeededRandom('test-nomask');
        const size = 10;

        const result = generator.run({ size, startPoints: 5, maxDepth: 5 }, prng, null);

        const pixelCount = result.flat().reduce((a, b) => a + b, 0);
        expect(pixelCount).toBeGreaterThan(0);
    });
});
