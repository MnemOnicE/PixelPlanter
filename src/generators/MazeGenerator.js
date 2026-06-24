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

    #isValidDir(gridData, dim, x, y, dx, dy) {
        const nx = x + dx,
            ny = y + dy;
        return nx > 0 && nx < dim - 1 && ny > 0 && ny < dim - 1 && gridData[ny][nx] === 1;
    }

    #applyMask(gridData, dim, inputMask) {
        if (!inputMask) return;
        for (let r = 0; r < dim; r++) {
            for (let c = 0; c < dim; c++) {
                if (inputMask[r][c] === 0) gridData[r][c] = 0;
            }
        }
    }

    #applyComplexityLoops(gridData, dim, complexity, prng) {
        const loops = Math.floor((complexity / 10) * (dim * dim * 0.05));
        for (let k = 0; k < loops; k++) {
            const rx = Math.floor(prng.next() * (dim - 2)) + 1;
            const ry = Math.floor(prng.next() * (dim - 2)) + 1;
            if (gridData[ry][rx] === 1) gridData[ry][rx] = 0;
        }
    }

    run({ size, complexity = 5 }, prng, inputMask = null) {
        const dim = Math.round(size);
        if (dim < 5)
            return Array(dim)
                .fill(0)
                .map(() => Array(dim).fill(1));

        const gridData = Array(dim)
            .fill(0)
            .map(() => Array(dim).fill(1));

        const pathNodes = [{ x: 1, y: 1 }];
        gridData[1][1] = 0;

        const dirs = [
            [0, -2],
            [2, 0],
            [0, 2],
            [-2, 0],
        ];

        while (pathNodes.length) {
            const head = pathNodes[pathNodes.length - 1];

            const valid = dirs.filter(([dx, dy]) => this.#isValidDir(gridData, dim, head.x, head.y, dx, dy));

            if (valid.length) {
                const [dx, dy] = valid[Math.floor(prng.next() * valid.length)];
                gridData[head.y + dy / 2][head.x + dx / 2] = 0;
                gridData[head.y + dy][head.x + dx] = 0;
                pathNodes.push({ x: head.x + dx, y: head.y + dy });
            } else {
                pathNodes.pop();
            }
        }

        this.#applyMask(gridData, dim, inputMask);
        this.#applyComplexityLoops(gridData, dim, complexity, prng);

        return gridData;
    }
}
