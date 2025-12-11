/**
 * @file RecursiveGrowthGenerator.js
 * @description Generates a grid using a recursive growth algorithm.
 */

/**
 * Generates a pattern by recursively growing from random starting points.
 * Simulates organic growth spreading from seed locations.
 */
export class RecursiveGrowthGenerator {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
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

    /**
     * Runs the recursive growth generation.
     *
     * @param {object} config - The configuration object.
     * @param {number} config.size - The grid size.
     * @param {number} [config.startPoints=1] - Number of random starting points.
     * @param {number} [config.maxDepth=5] - Maximum recursion depth for growth.
     * @param {SeededRandom} prng - The pseudo-random number generator.
     * @returns {number[][]} The generated grid.
     */
    run({ size, startPoints = 1, maxDepth = 5 }, prng, inputMask = null) {
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));

        // --- Define the recursive function ---
        /**
         * Recursively grows the pattern from a coordinate.
         * @param {number} x - Current X coordinate.
         * @param {number} y - Current Y coordinate.
         * @param {number} depth - Current recursion depth.
         */
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
                        // Check mask constraint: if mask exists and pixel is 0, do not grow
                        if (inputMask && inputMask[neighbor.ny][neighbor.nx] === 0) {
                            continue;
                        }

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

            // Check mask constraint for seed point
            if (inputMask && inputMask[startY][startX] === 0) {
                continue;
            }

            if (dataGrid[startY][startX] === 0) {
                dataGrid[startY][startX] = 1;
                // --- Start the recursion ---
                grow(startX, startY, 0);
            }
        }

        return dataGrid;
    }
}
