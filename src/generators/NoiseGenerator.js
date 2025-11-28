/**
 * @file NoiseGenerator.js
 * @description Generates a grid based on Simplex Noise.
 */
import { createNoise2D } from 'simplex-noise';

/**
 * Generates organic-looking patterns using Simplex Noise.
 */
export class NoiseGenerator {
    /**
     * Parameter definitions for the UI.
     * @type {object}
     */
    static params = {
        noiseScale: {
            label: 'Scale', // How "zoomed in" the noise is.
            type: 'slider',
            min: 1,
            max: 50,
            step: 1,
            defaultValue: 20
        },
        noiseThreshold: {
            label: 'Threshold', // The cutoff point to decide if a pixel is on or off.
            type: 'slider',
            min: 0.1,
            max: 0.9,
            step: 0.05,
            defaultValue: 0.5
        }
    }

    /**
     * The noise function from simplex-noise.
     * @type {function}
     * @private
     */
    #noise2D;

    /**
     * Creates an instance of NoiseGenerator.
     * Initializes the Simplex Noise generator.
     */
    constructor() {
        this.#noise2D = createNoise2D();
    }

    /**
     * Runs the noise generation algorithm.
     *
     * @param {object} config - The configuration object.
     * @param {number} config.size - The grid size.
     * @param {number} [config.noiseScale=20] - Controls the zoom level of the noise. Higher values zoom out (more detail).
     * @param {number} [config.noiseThreshold=0.5] - The cutoff value (0-1). Values above this become active pixels.
     * @param {SeededRandom} prng - The pseudo-random number generator.
     * @returns {number[][]} A 2D array representing the generated noise grid.
     */
    run({ size, noiseScale = 20, noiseThreshold = 0.5 }, prng) {
        // Create an empty grid to store our data.
        const dataGrid = Array.from({ length: size }, () => Array(size).fill(0));

        // The PRNG passed from Planter can be used to add a random offset to the noise.
        // This ensures that different seeds produce different noise patterns.
        const xOffset = prng.next() * 1000;
        const yOffset = prng.next() * 1000;

        // Loop over every cell in the grid.
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Calculate the coordinates to sample from the noise field.
                const sampleX = (x / size) * noiseScale + xOffset;
                const sampleY = (y / size) * noiseScale + yOffset;

                // Get the noise value from the library. This is between -1 and 1.
                const noiseValue = this.#noise2D(sampleX, sampleY);

                // Normalize the value to be between 0 and 1.
                const normalizedValue = (noiseValue + 1) / 2;

                // Check if the value is above the user-defined threshold.
                if (normalizedValue > noiseThreshold) {
                    // If it is, turn the pixel "on".
                    dataGrid[y][x] = 1;
                }
            }
        }

        // Return the final grid to the Planter.
        return dataGrid;
    }
}
