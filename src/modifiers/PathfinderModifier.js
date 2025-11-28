/**
 * @file PathfinderModifier.js
 * @description Creates paths through the grid using "drunkard's walk" algorithms.
 */

/**
 * Draws or erases paths using random walkers.
 * Can be used to create rivers, roads, or carve out caves.
 */
export class PathfinderModifier {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {
        mode: {
            label: 'Mode',
            type: 'select',
            options: ['additive', 'subtractive'],
            defaultValue: 'additive'
        },
        pathCount: {
            label: 'Number of Paths',
            type: 'slider', min: 1, max: 10, step: 1, defaultValue: 3
        },
        pathWidth: {
            label: 'Path Width',
            type: 'slider', min: 1, max: 5, step: 1, defaultValue: 1
        },
        pathStraightness: {
            label: 'Path Straightness',
            type: 'slider', min: 0.1, max: 0.9, step: 0.1, defaultValue: 0.7
        }
    };

    /**
     * Applies the pathfinding modification.
     *
     * @param {number[][]} dataGrid - The incoming 2D array.
     * @param {object} config - Configuration object.
     * @param {string} [config.mode='additive'] - 'additive' to draw, 'subtractive' to erase.
     * @param {number} [config.pathCount=3] - Number of paths to generate.
     * @param {number} [config.pathWidth=1] - Width of the path brush.
     * @param {number} [config.pathStraightness=0.7] - Bias towards continuing in the same direction (0-1).
     * @param {SeededRandom} prng - The pseudo-random number generator.
     * @returns {number[][]} A new grid with paths applied.
     */
    apply(dataGrid, { mode = 'additive', pathCount = 3, pathWidth = 1, pathStraightness = 0.7 }, prng) {
        const outputGrid = JSON.parse(JSON.stringify(dataGrid));
        const size = dataGrid.length;

        for (let i = 0; i < pathCount; i++) {
            // --- SMART LOGIC: Choose starting point based on mode ---
            let startPoint;
            if (mode === 'subtractive') {
                startPoint = this.#findSolidSpot(dataGrid, prng);
            } else { // Additive mode
                startPoint = this.#findEmptySpot(dataGrid, prng);
            }

            if (startPoint === null) continue;

            const directions = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'];
            const targetDirection = directions[Math.floor(prng.next() * directions.length)];

            let currentPoint = startPoint;
            const pathLength = size * 1.5;

            for (let step = 0; step < pathLength; step++) {
                // --- SMART LOGIC: Draw or Carve based on mode ---
                if (mode === 'subtractive') {
                    this.#drawBrush(outputGrid, currentPoint, pathWidth, 0); // Draw with value '0' to erase.
                } else {
                    this.#drawBrush(outputGrid, currentPoint, pathWidth, 1); // Draw with value '1' to add.
                }

                let nextMove;
                if (prng.next() < pathStraightness) {
                    nextMove = this.#getBiasedMove(targetDirection);
                } else {
                    nextMove = this.#getRandomMove(prng);
                }

                const nextPoint = { x: currentPoint.x + nextMove.dx, y: currentPoint.y + nextMove.dy };

                // --- SMART LOGIC: Check validity based on mode ---
                if (this.#isValidMove(dataGrid, nextPoint, mode)) {
                    currentPoint = nextPoint;
                } else {
                    break;
                }
            }
        }

        return outputGrid;
    }

    /**
     * Finds a random coordinate that is "solid" (value > 0).
     * @param {number[][]} grid - The grid to search.
     * @param {SeededRandom} prng - Random number generator.
     * @returns {object|null} The coordinate {x, y} or null if not found.
     * @private
     */
    #findSolidSpot(grid, prng) {
        const size = grid.length;
        let attempts = 0;
        const maxAttempts = size * size;

        while (attempts < maxAttempts) {
            const x = Math.floor(prng.next() * size);
            const y = Math.floor(prng.next() * size);
            if (grid[y][x] > 0) {
                return { x, y };
            }
            attempts++;
        }
        return null; // Return null if no solid spot is found
    }

    /**
     * Finds a random coordinate that is "empty" (value === 0).
     * @param {number[][]} grid - The grid to search.
     * @param {SeededRandom} prng - Random number generator.
     * @returns {object|null} The coordinate {x, y} or null if not found.
     * @private
     */
    #findEmptySpot(grid, prng) {
        const size = grid.length;
        let attempts = 0;
        const maxAttempts = size * size;

        while (attempts < maxAttempts) {
            const x = Math.floor(prng.next() * size);
            const y = Math.floor(prng.next() * size);
            if (grid[y][x] === 0) {
                return { x, y };
            }
            attempts++;
        }
        return null; // Return null if no empty spot is found
    }

    /**
     * Returns a movement delta biased towards a specific direction.
     * @param {string} direction - The target direction.
     * @returns {object} The movement delta {dx, dy}.
     * @private
     */
    #getBiasedMove(direction) {
        const moves = {
            'up': { dx: 0, dy: -1 }, 'down': { dx: 0, dy: 1 }, 'left': { dx: -1, dy: 0 }, 'right': { dx: 1, dy: 0 },
            'up-left': { dx: -1, dy: -1 }, 'up-right': { dx: 1, dy: -1 }, 'down-left': { dx: -1, dy: 1 }, 'down-right': { dx: 1, dy: 1 }
        };
        return moves[direction] || { dx: 0, dy: 0 };
    }

    /**
     * Returns a random movement delta.
     * @param {SeededRandom} prng - Random number generator.
     * @returns {object} The movement delta {dx, dy}.
     * @private
     */
    #getRandomMove(prng) {
        const moves = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];
        return moves[Math.floor(prng.next() * moves.length)];
    }

    /**
     * Checks if a move is valid for the given mode.
     * @param {number[][]} grid - The grid.
     * @param {object} point - The target coordinate {x, y}.
     * @param {string} mode - 'additive' or 'subtractive'.
     * @returns {boolean} True if valid, false otherwise.
     * @private
     */
    #isValidMove(grid, point, mode) {
        const size = grid.length;
        // Check bounds (same for both modes).
        if (point.x < 0 || point.x >= size || point.y < 0 || point.y >= size) {
            return false;
        }

        if (mode === 'subtractive') {
            return grid[point.y][point.x] > 0; // Must move onto a solid pixel to continue carving.
        } else {
            return grid[point.y][point.x] === 0; // Must move onto an empty pixel to continue drawing.
        }
    }

    /**
     * Modifies the grid by drawing a shape at the given point.
     * @param {number[][]} grid - The grid to modify.
     * @param {object} point - The center coordinate {x, y}.
     * @param {number} width - The width of the brush.
     * @param {number} value - The value to set (0 or 1).
     * @private
     */
    #drawBrush(grid, point, width, value) {
        const size = grid.length;
        const halfWidth = Math.floor(width / 2);
        for (let dy = -halfWidth; dy <= halfWidth; dy++) {
            for (let dx = -halfWidth; dx <= halfWidth; dx++) {
                const drawX = point.x + dx;
                const drawY = point.y + dy;
                if (drawX >= 0 && drawX < size && drawY >= 0 && drawY < size) {
                    grid[drawY][drawX] = value;
                }
            }
        }
    }
}
