/**
 * @file MazeGenerator.js
 * @description Generates a perfect maze using recursive backtracking.
 */

export class MazeGenerator {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {};

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
     * @param {SeededRandom} prng - The pseudo-random number generator.
     * @param {number[][]} [inputMask] - Optional mask.
     * @returns {number[][]} A 2D array representing the generated maze.
     */

    run({ size }, prng, inputMask = null) {
        const dim = Math.round(size);
        if (dim < 5) return Array(dim).fill(0).map(() => Array(dim).fill(1));

        const gridData = Array(dim).fill(0).map(() => Array(dim).fill(1));

        const pathNodes = [{ x: 1, y: 1 }];
        gridData[1][1] = 0;

        const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

        while (pathNodes.length) {
            const head = pathNodes[pathNodes.length - 1];

            const valid = dirs.filter(([dx, dy]) => {
                const nx = head.x + dx, ny = head.y + dy;
                return nx > 0 && nx < dim - 1 && ny > 0 && ny < dim - 1 && gridData[ny][nx] === 1;
            });

            if (valid.length) {
                const [dx, dy] = valid[Math.floor(prng.next() * valid.length)];
                gridData[head.y + dy / 2][head.x + dx / 2] = 0;
                gridData[head.y + dy][head.x + dx] = 0;
                pathNodes.push({ x: head.x + dx, y: head.y + dy });
            } else {
                pathNodes.pop();
            }
        }

        if (inputMask) {
            for (let r = 0; r < dim; r++) {
                for (let c = 0; c < dim; c++) {
                    if (inputMask[r][c] === 0) gridData[r][c] = 0;
                }
            }
        }

        return gridData;
    }
}
