// == RecursiveGrowthGenerator Pseudocode ==

// CLASS RecursiveGrowthGenerator
export class RecursiveGrowthGenerator {
    // --- NEW: PARAMETER DEFINITIONS ---
    static params = {
        startPoints: {
            label: 'Start Points',
            type: 'slider',
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 2,
        },
        maxDepth: {
            label: 'Growth Depth',
            type: 'slider',
            min: 1,
            max: 15,
            step: 1,
            defaultValue: 5,
        }
    };

    // METHOD run
    // PARAMETERS: config, prng
    run({ size, startPoints = 1, maxDepth = 5 }, prng) {
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));

        // --- Define the recursive function ---
        const grow = (x, y, depth) => {
            // Base cases for recursion
            if (depth >= maxDepth || x < 0 || x >= size || y < 0 || y >= size) {
                return;
            }

            // Consider the four neighbors of (x, y)
            const neighbors = [
                { nx: x, ny: y - 1 }, // Up
                { nx: x, ny: y + 1 }, // Down
                { nx: x - 1, ny: y }, // Left
                { nx: x + 1, ny: y }  // Right
            ];

            for (const neighbor of neighbors) {
                // Generate a random number to decide whether to grow
                if (prng.next() > 0.5) {
                    // Check if the neighbor is within bounds and currently empty
                    if (
                        neighbor.nx >= 0 && neighbor.nx < size &&
                        neighbor.ny >= 0 && neighbor.ny < size &&
                        dataGrid[neighbor.ny][neighbor.nx] === 0
                    ) {
                        dataGrid[neighbor.ny][neighbor.nx] = 1;
                        // RECURSIVE CALL
                        grow(neighbor.nx, neighbor.ny, depth + 1);
                    }
                }
            }
        };

        // --- Seed the process ---
        for (let i = 0; i < startPoints; i++) {
            const startX = Math.floor(prng.next() * size);
            const startY = Math.floor(prng.next() * size);
            if (dataGrid[startY][startX] === 0) {
                dataGrid[startY][startX] = 1;
                // --- Start the recursion ---
                grow(startX, startY, 0);
            }
        }

        return dataGrid;
    }
}
