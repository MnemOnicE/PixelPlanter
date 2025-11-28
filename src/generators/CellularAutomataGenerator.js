export class CellularAutomataGenerator {
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

    run({ size, iterations = 5, birthLimit = 4, deathLimit = 3, initialChance = 0.45 }, prng) {
        let grid = Array.from({ length: size }, () => Array(size).fill(0));

        // Initialize randomly
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                grid[y][x] = prng.next() < initialChance ? 1 : 0;
            }
        }

        // Simulation steps
        for (let i = 0; i < iterations; i++) {
            grid = this.#doSimulationStep(grid, size, birthLimit, deathLimit);
        }

        return grid;
    }

    #doSimulationStep(oldGrid, size, birthLimit, deathLimit) {
        const newGrid = Array.from({ length: size }, () => Array(size).fill(0));
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
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

    #countNeighbors(grid, x, y, size) {
        let count = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const neighbourX = x + i;
                const neighbourY = y + j;
                if (i === 0 && j === 0) {
                    continue;
                } else if (neighbourX < 0 || neighbourY < 0 || neighbourX >= size || neighbourY >= size) {
                    count = count + 1;
                } else if (grid[neighbourY][neighbourX] === 1) {
                    count = count + 1;
                }
            }
        }
        return count;
    }
}
