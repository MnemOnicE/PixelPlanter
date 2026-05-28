/**
 * @file GameSpriteGenerator.js
 * @description Encapsulates the complete generative pipeline for game-ready sprites.
 */
import { NoiseGenerator } from './NoiseGenerator.js';
import { SymmetryGenerator } from './SymmetryGenerator.js';
import { CellularAutomataGenerator } from './CellularAutomataGenerator.js';
import { DespeckleModifier } from '../modifiers/DespeckleModifier.js';
import { OutlineModifier } from '../modifiers/OutlineModifier.js';

/**
 * A composite generator that runs a strict pipeline to produce a game-ready sprite:
 * 1. Generates noise
 * 2. Mirrors it for symmetry
 * 3. Applies Cellular Automata for organic silhouette clumping
 * 4. Masks a fresh noise texture to the silhouette
 * 5. Despeckles (removes 1x1 islands)
 * 6. Outlines the final shape
 */
export class GameSpriteGenerator {
    /**
     * Parameter definitions for the UI (if this ever needs to be exposed).
     * @type {object}
     */
    static params = {
        iterations: {
            label: 'CA Iterations',
            type: 'slider',
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 3,
        },
        textureScale: {
            label: 'Texture Scale',
            type: 'slider',
            min: 1,
            max: 50,
            step: 1,
            defaultValue: 20,
        },
    };

    constructor() {
        this.noiseGen = new NoiseGenerator();
        this.symmetryGen = new SymmetryGenerator();
        this.caGen = new CellularAutomataGenerator();
        this.despeckleMod = new DespeckleModifier();
        this.outlineMod = new OutlineModifier();
    }

    /**
     * Runs the sprite generation pipeline entirely headless.
     *
     * @param {object} config - Configuration object.
     * @param {number} config.size - The grid size.
     * @param {number} [config.iterations=3] - CA iterations for silhouette smoothing.
     * @param {number} [config.textureScale=20] - Noise scale for the texture pass.
     * @param {SeededRandom} prng - The pseudo-random number generator to ensure determinism.
     * @returns {number[][]} The composited, fully outlined sprite grid.
     */
    run(config, prng) {
        const { size, iterations = 3, textureScale = 20 } = config;

        // 1. Generate base noise for the structure
        const structureNoise = this.noiseGen.run({
            size,
            noiseScale: 30, // Dense enough to provide good seed material
            noiseThreshold: 0.6 // Sparse enough so CA doesn't overgrow the whole canvas
        }, prng);

        // 2. Apply symmetry to the random noise BEFORE CA
        const mirroredNoise = this.symmetryGen.run({
            size,
            mirrorAxis: 'vertical'
        }, prng, null, structureNoise);

        // 3. Apply CA to meld the mirrored noise into a cohesive silhouette
        // (Initial chance is ignored here because we are passing mirroredNoise as a mask?
        // Wait, CA generator's run method ignores the existing grid and uses inputMask or random.
        // We need CA to *process* mirroredNoise.
        // Let's create a custom CA step or adapt since CA run() overwrites.
        // Ah, CA run() initializes randomly inside inputMask.
        // Let's just do manual CA on the mirrored noise for the organic spine.)

        let silhouette = mirroredNoise;
        for (let i = 0; i < iterations; i++) {
            silhouette = this.#applyCAStep(silhouette, size, 4, 3);
        }

        // 4. Generate detail texture
        const texture = this.noiseGen.run({
            size,
            noiseScale: textureScale,
            noiseThreshold: 0.4
        }, prng);

        // Mask texture using the silhouette
        // 1 = silhouette base, 2 = texture detail (or we can just keep 1)
        const composited = Array.from({ length: size }, () => Array(size).fill(0));
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (silhouette[y][x] > 0) {
                    // It's part of the ship/creature
                    // We give the base silhouette a value of 1, and textured areas a value of 2
                    composited[y][x] = texture[y][x] > 0 ? 2 : 1;
                }
            }
        }

        // 5. Despeckle (remove isolated pixels to prevent artifact outlining)
        const cleaned = this.despeckleMod.apply(composited, { maxIslandSize: 1 });

        // 6. Outline
        const finalSprite = this.outlineMod.apply(cleaned, {});

        return finalSprite;
    }

    /**
     * Helper to run a CA step over an existing grid.
     */
    #applyCAStep(oldGrid, size, birthLimit, deathLimit) {
        const newGrid = Array.from({ length: size }, () => Array(size).fill(0));
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let neighbors = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const nx = x + i;
                        const ny = y + j;
                        // Treat bounds as dead space to prevent sticking to edges
                        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                            if (oldGrid[ny][nx] > 0) neighbors++;
                        }
                    }
                }

                if (oldGrid[y][x] > 0) {
                    newGrid[y][x] = neighbors < deathLimit ? 0 : 1;
                } else {
                    newGrid[y][x] = neighbors > birthLimit ? 1 : 0;
                }
            }
        }
        return newGrid;
    }
}
