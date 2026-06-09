/**
 * @file MazeGenerator.js
 * @description Generates a perfect maze using recursive backtracking.
 */

export class MazeGenerator {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {
        complexity: {
            label: 'Complexity',
            type: 'slider',
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 5,
        },
    };

    /**
     * Identifies this generator as producing solid structural shapes rather than noisy patterns.
     * @returns {boolean}
     */
    get isStructural() {
        return true;
    }

    /**
     * Runs the maze generation algorithm (recursive backtracking).
     *
     * @param {object} config - The configuration object.
     * @param {number} config.size - The grid size.
     * @param {number} [config.complexity=5] - Unused directly in standard perfect maze, but keeps API consistent.
     * @param {SeededRandom} prng - The pseudo-random number generator.
     * @param {number[][]} [inputMask] - Optional mask.
     * @returns {number[][]} A 2D array representing the generated maze.
     */
    run({ size, complexity = 5 }, prng, inputMask = null) {
        const gridSize = Math.floor(size);
        if (gridSize < 5) {
            // Too small for a meaningful maze, return a solid block or empty
            return Array.from({ length: gridSize }, () => Array(gridSize).fill(1));
        }

        // Initialize grid with 1s (walls)
        const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(1));

        // Start carving paths (0s)
        // Maze generation typically works best on odd-sized grids if we consider paths and walls as 1 cell each.
        // We will carve starting from (1, 1).

        const stack = [];
        let current = { x: 1, y: 1 };
        grid[current.y][current.x] = 0; // 0 is path
        stack.push(current);

        const directions = [
            { dx: 0, dy: -2 }, // Up
            { dx: 2, dy: 0 },  // Right
            { dx: 0, dy: 2 },  // Down
            { dx: -2, dy: 0 }  // Left
        ];

        while (stack.length > 0) {
            current = stack[stack.length - 1];

            // Find unvisited neighbors
            const unvisited = [];
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                // Check bounds (must be inside grid, leaving an outer wall)
                if (nx > 0 && nx < gridSize - 1 && ny > 0 && ny < gridSize - 1) {
                    // Check if it's a wall (unvisited)
                    if (grid[ny][nx] === 1) {
                        unvisited.push(dir);
                    }
                }
            }

            if (unvisited.length > 0) {
                // Choose a random unvisited neighbor
                const dir = unvisited[Math.floor(prng.next() * unvisited.length)];

                // Carve through the wall
                grid[current.y + dir.dy / 2][current.x + dir.dx / 2] = 0;
                // Carve the destination
                grid[current.y + dir.dy][current.x + dir.dx] = 0;

                stack.push({ x: current.x + dir.dx, y: current.y + dir.dy });
            } else {
                stack.pop();
            }
        }

        // Apply mask if provided
        if (inputMask) {
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (inputMask[y][x] === 0) {
                        grid[y][x] = 0; // If masked out, force it to be 0
                    } else if (inputMask[y][x] > 0) {
                        // Invert the maze logic for visual consistency:
                        // The maze algorithm uses 0 for path and 1 for walls.
                        // Our standard expects 1 to be "drawn".
                        // So walls = 1, paths = 0.
                        // Masking means "only draw walls where mask is 1".
                        if (grid[y][x] === 1) {
                            grid[y][x] = 1;
                        }
                    }
                }
            }
        } else {
             // Invert is not strictly needed since 1 is wall and 0 is path,
             // which visually looks like a maze when drawn.
        }

        // Add some complexity (randomly removing some walls to create loops)
        const loopsToRemove = Math.floor((complexity / 10) * (gridSize * gridSize * 0.05));
        for (let i = 0; i < loopsToRemove; i++) {
            const rx = Math.floor(prng.next() * (gridSize - 2)) + 1;
            const ry = Math.floor(prng.next() * (gridSize - 2)) + 1;
            if (grid[ry][rx] === 1) {
                grid[ry][rx] = 0;
            }
        }

        return grid;
    }
}
