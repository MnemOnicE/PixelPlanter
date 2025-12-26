/**
 * @file CellularAutomataGenerator.js
 * @description Generates a grid using Cellular Automata rules.
 */

/**
 * Generates a pattern using Cellular Automata (Game of Life style rules).
 * Iteratively updates the grid based on neighbor counts to create organic, cave-like structures.
 */
export class CellularAutomataGenerator {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {
        iterations: {
            label: 'Iterations',
            type: 'slider',
            min: 1,
            max: 20,
            step: 1,
            defaultValue: 5
        },
        birthLimit: {
            label: 'Birth Limit',
            type: 'slider',
            min: 1,
            max: 8,
            step: 1,
            defaultValue: 4
        },
        deathLimit: {
            label: 'Death Limit',
            type: 'slider',
            min: 1,
            max: 8,
            step: 1,
            defaultValue: 3
        },
        initialChance: {
            label: 'Initial Chance',
            type: 'slider',
            min: 0.1,
            max: 0.9,
            step: 0.05,
            defaultValue: 0.45
        }
    }

    /**
     * Runs the cellular automata simulation.
     *
     * @param {object} config - The configuration object.
     * @param {number} config.size - The grid size.
     * @param {number} [config.iterations=5] - Number of simulation steps to run.
     * @param {number} [config.birthLimit=4] - Number of neighbors required for a dead cell to become alive.
     * @param {number} [config.deathLimit=3] - Number of neighbors required for a live cell to die (less than this dies).
     * @param {number} [config.initialChance=0.45] - Probability of a cell starting as alive (0.0 - 1.0).
     * @param {SeededRandom} prng - The pseudo-random number generator.
     * @param {number[][]} [inputMask] - Optional mask. If provided, generation is restricted to non-zero pixels in this mask.
     * @returns {number[][]} The generated grid.
     */
    run({ size, iterations = 5, birthLimit = 4, deathLimit = 3, initialChance = 0.45 }, prng, inputMask = null) {
        const gridSize = Math.floor(size);
        let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

        // Initialize randomly
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // If masked, ensure cells outside the mask stay 0
                if (inputMask && inputMask[y][x] === 0) {
                    grid[y][x] = 0;
                } else {
                    grid[y][x] = prng.next() < initialChance ? 1 : 0;
                }
            }
        }

        // Simulation steps
        for (let i = 0; i < iterations; i++) {
            grid = this.#doSimulationStep(grid, gridSize, birthLimit, deathLimit, inputMask);
        }

        // Safety check: Ensure the grid is not empty (bug fix for small sizes)
        // If masked, we only check inside the mask.
        let hasLife = false;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (grid[y][x] === 1) {
                    hasLife = true;
                    break;
                }
            }
            if (hasLife) break;
        }

        if (!hasLife && gridSize > 0) {
            // Only add safety pixel if it's inside the mask (or no mask)
            const mid = Math.floor(gridSize / 2);
            if (!inputMask || inputMask[mid][mid] > 0) {
                 grid[mid][mid] = 1;
            }
        }

        return grid;
    }

    /**
     * Performs a single step of the simulation.
     *
     * @param {number[][]} oldGrid - The grid state before this step.
     * @param {number} size - The grid size.
     * @param {number} birthLimit - Threshold for cell birth.
     * @param {number} deathLimit - Threshold for cell death.
     * @param {number[][]} [inputMask] - Optional mask.
     * @returns {number[][]} The new grid state.
     * @private
     */
    #doSimulationStep(oldGrid, size, birthLimit, deathLimit, inputMask) {
        const newGrid = Array.from({ length: size }, () => Array(size).fill(0));
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // If masked out, skip processing and keep it 0
                if (inputMask && inputMask[y][x] === 0) {
                    newGrid[y][x] = 0;
                    continue;
                }

                const neighbors = this.#countNeighbors(oldGrid, x, y, size);
                if (oldGrid[y][x] === 1) {
                    if (neighbors < deathLimit) {
                        newGrid[y][x] = 0;
                    } else {
                        newGrid[y][x] = 1;
                    }
                } else {
                    if (neighbors > birthLimit) {
                        newGrid[y][x] = 1;
                    } else {
                        newGrid[y][x] = 0;
                    }
                }
            }
        }
        return newGrid;
    }

    /**
     * Counts the number of active neighbors for a given cell.
     *
     * @param {number[][]} grid - The current grid.
     * @param {number} x - The x coordinate of the cell.
     * @param {number} y - The y coordinate of the cell.
     * @param {number} size - The grid size.
     * @returns {number} The count of active neighbors.
     * @private
     */
    #countNeighbors(grid, x, y, size) {
        let count = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const neighbourX = x + i;
                const neighbourY = y + j;
                if (i === 0 && j === 0) {
                    continue;
                } else if (neighbourX < 0 || neighbourY < 0 || neighbourX >= size || neighbourY >= size) {
                    count = count + 1; // Treat out-of-bounds as alive (walls)
                } else if (grid[neighbourY][neighbourX] === 1) {
                    count = count + 1;
                }
            }
        }
        return count;
    }
}
