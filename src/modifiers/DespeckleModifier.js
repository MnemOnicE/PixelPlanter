/**
 * @file DespeckleModifier.js
 * @description Removes disconnected 1x1 pixel islands from the grid to clean up artifacts.
 */

/**
 * Removes tiny floating pixel clusters (like 1x1 islands) from the data grid.
 * Useful for cleaning up noise before applying outlines or boundaries.
 */
export class DespeckleModifier {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {
        maxIslandSize: {
            label: 'Max Island Size',
            type: 'slider',
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 1,
        },
    };

    /**
     * Applies the despeckle modification.
     *
     * @param {number[][]} dataGrid - The incoming 2D array from the generator.
     * @param {object} config - Configuration object.
     * @param {number} [config.maxIslandSize=1] - Clusters equal to or smaller than this size are removed.
     * @param {SeededRandom} [prng] - Unused, required by strict interface.
     * @param {number[][]} [readBelowGrid] - Unused, required by strict interface.
     * @param {number[][]} activeMask - Optional mask array.
     * @returns {number[][]} A new, cleaned up 2D array.
     */
    // eslint-disable-next-line no-unused-vars
    apply(dataGrid, config = {}, prng = null, readBelowGrid = null, activeMask = null) {
        const height = dataGrid.length;
        if (height === 0) return [];
        const width = dataGrid[0].length;
        if (width === 0) return [];

        const maxIslandSize = config.maxIslandSize !== undefined ? config.maxIslandSize : 1;

        // Deep copy the input grid
        const outputGrid = dataGrid.map((row) => [...row]);

        // Keep track of visited pixels to avoid redundant checks
        const visited = Array.from({ length: height }, () => Array(width).fill(false));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (activeMask && activeMask[y] && activeMask[y][x] === 0) {
                    continue; // Skip masked-out areas
                }

                // If it's an "on" pixel and we haven't checked it yet
                if (outputGrid[y][x] > 0 && !visited[y][x]) {
                    // Find all connected pixels in this cluster
                    const cluster = this.#floodFill(outputGrid, x, y, width, height, visited);

                    // If the cluster size is less than or equal to the threshold, remove it
                    if (cluster.length <= maxIslandSize) {
                        for (const p of cluster) {
                            outputGrid[p.y][p.x] = 0;
                        }
                    }
                }
            }
        }

        return outputGrid;
    }

    /**
     * Finds all connected pixels in a cluster using an iterative flood fill.
     *
     * @private
     */
    #floodFill(grid, startX, startY, width, height, visited) {
        const cluster = [];
        const stack = [{ x: startX, y: startY }];
        visited[startY][startX] = true;

        while (stack.length > 0) {
            const { x, y } = stack.pop();
            cluster.push({ x, y });

            // Check 4-way neighbors
            const neighbors = [
                { x: x, y: y - 1 }, // Up
                { x: x, y: y + 1 }, // Down
                { x: x - 1, y: y }, // Left
                { x: x + 1, y: y }, // Right
            ];

            for (const n of neighbors) {
                if (
                    n.x >= 0 && n.x < width &&
                    n.y >= 0 && n.y < height &&
                    grid[n.y][n.x] > 0 &&
                    !visited[n.y][n.x]
                ) {
                    visited[n.y][n.x] = true;
                    stack.push(n);
                }
            }
        }

        return cluster;
    }
}
