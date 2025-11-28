/**
 * @file PRNG.js
 * @description Provides a seeded pseudo-random number generator implementation.
 */

// CLASS SeededRandom
// A simple pseudo-random number generator based on a Linear Congruential Generator (LCG).
/**
 * A simple pseudo-random number generator based on a Linear Congruential Generator (LCG).
 * Useful for creating deterministic random sequences based on a seed.
 */
export class SeededRandom {
    /**
     * The internal state seed.
     * @type {number}
     * @private
     */
    #seed;

    /**
     * The modulus constant for the LCG (2^31).
     * @type {number}
     * @private
     */
    #m = 2**31;

    /**
     * The multiplier constant for the LCG.
     * @type {number}
     * @private
     */
    #a = 1103515245;

    /**
     * The increment constant for the LCG.
     * @type {number}
     * @private
     */
    #c = 12345;

    /**
     * Creates an instance of SeededRandom.
     *
     * @param {string|number} seed - The initial seed value. Can be a string or a number.
     *                               Defaults to `Date.now()`.
     */
    constructor(seed = Date.now()) {
        if (typeof seed === 'string') {
            this.#seed = this.#hashCode(seed);
        } else {
            this.#seed = seed;
        }
        // Ensure the initial seed is within the valid range.
        this.#seed = this.#seed % this.#m;
        if (this.#seed < 0) {
            this.#seed += this.#m;
        }
    }

    /**
     * A simple string hashing function to convert a string seed into a number.
     *
     * @param {string} str - The string to hash.
     * @returns {number} The hashed number.
     * @private
     */
    #hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * Generates the next pseudo-random number in the sequence.
     *
     * @returns {number} A floating-point number between 0 (inclusive) and 1 (exclusive).
     */
    next() {
        this.#seed = (this.#a * this.#seed + this.#c) % this.#m;
        return this.#seed / this.#m;
    }
}
