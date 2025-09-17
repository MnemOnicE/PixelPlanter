// Filename: src/modifiers/PathfinderModifier.js

export class PathfinderModifier {
    // --- PARAMETER DEFINITIONS ---
    static params = {
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

    // --- APPLY METHOD ---
    apply(dataGrid, { pathCount = 3, pathWidth = 1, pathStraightness = 0.7 }, prng) {
        // Create a copy of the grid to draw on.
        const outputGrid = JSON.parse(JSON.stringify(dataGrid));
        const size = dataGrid.length;

        // Run the pathfinding logic for the desired number of paths.
        for (let i = 0; i < pathCount; i++) {
            // 1. Find a valid, empty starting point for the path.
            const startPoint = this.#findEmptySpot(dataGrid, prng);
            if (startPoint === null) continue; // No empty space found.

            // 2. Determine a target direction. This gives the path a general goal.
            const directions = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'];
            const targetDirection = directions[Math.floor(prng.next() * directions.length)];

            // 3. Perform a "random walk" from the starting point.
            let currentPoint = startPoint;
            const pathLength = size * 1.5; // Allow path to be long.

            for (let step = 0; step < pathLength; step++) {
                // Draw the "brush" at the current point.
                this.#drawBrush(outputGrid, currentPoint, pathWidth, 1); // Draw with value '1'.

                // Decide the next move.
                let nextMove;
                if (prng.next() < pathStraightness) {
                    nextMove = this.#getBiasedMove(targetDirection);
                } else {
                    nextMove = this.#getRandomMove(prng);
                }

                // Check if the next position is valid (within bounds and not hitting a solid pixel).
                const nextPoint = { x: currentPoint.x + nextMove.dx, y: currentPoint.y + nextMove.dy };

                if (this.#isValidMove(dataGrid, nextPoint)) {
                    currentPoint = nextPoint;
                } else {
                    // If the path hits a wall, stop this walk.
                    break;
                }
            }
        }

        return outputGrid;
    }

    // --- HELPER METHODS ---
    #findEmptySpot(grid, prng) {
        const size = grid.length;
        let attempts = 0;
        const maxAttempts = size * size; // Limit attempts to find an empty spot

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

    #getBiasedMove(direction) {
        const moves = {
            'up': { dx: 0, dy: -1 },
            'down': { dx: 0, dy: 1 },
            'left': { dx: -1, dy: 0 },
            'right': { dx: 1, dy: 0 },
            'up-left': { dx: -1, dy: -1 },
            'up-right': { dx: 1, dy: -1 },
            'down-left': { dx: -1, dy: 1 },
            'down-right': { dx: 1, dy: 1 }
        };
        return moves[direction] || { dx: 0, dy: 0 };
    }

    #getRandomMove(prng) {
        const moves = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];
        return moves[Math.floor(prng.next() * moves.length)];
    }

    #isValidMove(grid, point) {
        const size = grid.length;
        // Check bounds
        if (point.x < 0 || point.x >= size || point.y < 0 || point.y >= size) {
            return false;
        }
        // Check if the cell is empty (value is 0)
        if (grid[point.y][point.x] !== 0) {
            return false;
        }
        return true;
    }

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
