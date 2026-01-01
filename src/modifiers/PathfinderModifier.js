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
        },
        searchMethod: {
            label: 'Search Method',
            type: 'select',
            options: ['smart', 'quick', 'precise'],
            defaultValue: 'smart'
        },
        useDynamicGrid: {
            label: 'Dynamic Grid',
            type: 'checkbox',
            defaultValue: false
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
     * @param {string} [config.searchMethod='smart'] - 'quick', 'precise', or 'smart'.
     * @param {boolean} [config.useDynamicGrid=false] - Whether new paths respect changes made by previous paths in the same batch.
     * @param {SeededRandom} prng - The pseudo-random number generator.
     * @returns {number[][]} A new grid with paths applied.
     */
    apply(dataGrid, {
        mode = 'additive',
        pathCount = 3,
        pathWidth = 1,
        pathStraightness = 0.7,
        searchMethod = 'smart',
        useDynamicGrid = false
    }, prng) {
        // Create the output grid. If dynamic grid is NOT used, we need a reference to the original state
        // for checking start conditions, but we always draw to outputGrid.
        // Actually, if dynamicGrid is FALSE, we verify against dataGrid (original).
        // If TRUE, we verify against outputGrid (current state).
        const outputGrid = JSON.parse(JSON.stringify(dataGrid));
        const size = dataGrid.length;

        for (let i = 0; i < pathCount; i++) {
            // Select the grid to search for a starting point
            const searchGrid = useDynamicGrid ? outputGrid : dataGrid;

            // Determine what value we are looking for
            // Additive: starts on empty (0)
            // Subtractive: starts on solid (>0)
            const targetPredicate = mode === 'subtractive'
                ? (val) => val > 0
                : (val) => val === 0;

            const startPoint = this.#findSpot(searchGrid, targetPredicate, searchMethod, prng);

            if (startPoint === null) continue;

            const directions = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'];
            const targetDirection = directions[Math.floor(prng.next() * directions.length)];

            let currentPoint = startPoint;
            const pathLength = size * 1.5;

            for (let step = 0; step < pathLength; step++) {
                // --- Draw or Carve ---
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

                // --- Check validity ---
                // If using dynamic grid, we check the CURRENT state (outputGrid).
                // If not, we check the ORIGINAL state (dataGrid).
                const checkGrid = useDynamicGrid ? outputGrid : dataGrid;

                if (this.#isValidMove(checkGrid, nextPoint, mode)) {
                    currentPoint = nextPoint;
                } else {
                    break;
                }
            }
        }

        return outputGrid;
    }

    /**
     * Finds a spot on the grid matching the predicate using the specified strategy.
     * @param {number[][]} grid - The grid to search.
     * @param {function} predicate - Function returning true for valid cell values.
     * @param {string} method - 'quick', 'precise', or 'smart'.
     * @param {SeededRandom} prng - Random number generator.
     * @returns {object|null} The coordinate {x, y} or null if not found.
     */
    #findSpot(grid, predicate, method, prng) {
        if (method === 'quick') {
            return this.#findSpotRandom(grid, predicate, prng);
        } else if (method === 'precise') {
            return this.#findSpotExhaustive(grid, predicate, prng);
        } else {
            // Smart: Try random, fallback to exhaustive
            const randomAttempt = this.#findSpotRandom(grid, predicate, prng, 50); // Limit random attempts
            if (randomAttempt) return randomAttempt;
            return this.#findSpotExhaustive(grid, predicate, prng);
        }
    }

    /**
     * Finds a spot using random sampling (Rejection Sampling).
     * @param {number[][]} grid - The grid.
     * @param {function} predicate - Validation function.
     * @param {SeededRandom} prng - PRNG.
     * @param {number} [maxAttempts] - Optional limit. Defaults to size*size.
     */
    #findSpotRandom(grid, predicate, prng, maxAttempts) {
        const size = grid.length;
        const limit = maxAttempts || (size * size);
        let attempts = 0;

        while (attempts < limit) {
            const x = Math.floor(prng.next() * size);
            const y = Math.floor(prng.next() * size);
            if (predicate(grid[y][x])) {
                return { x, y };
            }
            attempts++;
        }
        return null;
    }

    /**
     * Finds a spot by scanning all pixels (Exhaustive Search).
     * @param {number[][]} grid - The grid.
     * @param {function} predicate - Validation function.
     * @param {SeededRandom} prng - PRNG.
     */
    #findSpotExhaustive(grid, predicate, prng) {
        const size = grid.length;
        const candidates = [];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (predicate(grid[y][x])) {
                    candidates.push({ x, y });
                }
            }
        }

        if (candidates.length === 0) return null;
        return candidates[Math.floor(prng.next() * candidates.length)];
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
