import { CellularAutomataGenerator } from '../src/generators/CellularAutomataGenerator.js';
import { SeededRandom } from '../src/utils/PRNG.js';

describe('CellularAutomataGenerator Fix Verification', () => {
    test('should NOT produce empty grid even with high birthLimit', () => {
        const generator = new CellularAutomataGenerator();
        let failures = 0;
        const size = 2; // Size 2 has high probability of empty initialization
        const config = {
            size: size,
            iterations: 5,
            birthLimit: 5, // High birth limit that causes empty grids currently
            deathLimit: 3,
            initialChance: 0.45,
        };

        for (let i = 0; i < 100; i++) {
            const prng = new SeededRandom(i);
            const grid = generator.run(config, prng);

            let hasAliveCell = false;
            for (let y = 0; y < Math.floor(size); y++) {
                for (let x = 0; x < Math.floor(size); x++) {
                    if (grid[y][x] === 1) {
                        hasAliveCell = true;
                        break;
                    }
                }
                if (hasAliveCell) break;
            }

            if (!hasAliveCell) {
                failures++;
            }
        }
        // Expect NO failures after fix
        expect(failures).toBe(0);
    });

    test('should handle floating point sizes gracefully', () => {
        const generator = new CellularAutomataGenerator();
        const config = {
            size: 5.5,
            iterations: 2,
        };
        const prng = new SeededRandom(123);
        // Should not throw
        const grid = generator.run(config, prng);
        expect(grid.length).toBe(5);
    });
});
