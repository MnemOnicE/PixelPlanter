/**
 * @file PRNG.js
 * @description Provides a seeded pseudo-random number generator implementation.
 */

/**
 * A robust pseudo-random number generator based on PCG32 (Permuted Congruential Generator).
 * Ensures deterministic, cross-platform 1:1 pixel parity using 64-bit integer math via BigInt.
 * Outputs standard 32-bit floating point numbers in the range [0.0, 1.0).
 */
export class SeededRandom {
    /**
     * Internal 64-bit state.
     * @type {bigint}
     * @private
     */
    #state;

    /**
     * Internal 64-bit stream/increment constant.
     * @type {bigint}
     * @private
     */
    #inc;

    /**
     * Creates an instance of SeededRandom.
     *
     * @param {string|number} seed - The initial seed value. Can be a string or a number.
     *                               Defaults to `Date.now()`.
     */
    constructor(seed = Date.now()) {
        let seedBigInt;

        if (typeof seed === 'string') {
            // Hash the string to a 32-bit unsigned integer, then convert to BigInt
            seedBigInt = BigInt(this.#hashCode(seed) >>> 0);
        } else if (typeof seed === 'number' && Number.isFinite(seed)) {
            // Take the integer part of the number, ensure it's positive and fits in 32 bits
            seedBigInt = BigInt(Math.floor(Math.abs(seed))) & 0xFFFFFFFFn;
        } else {
            seedBigInt = 0n;
        }

        // Initialize PCG32 state
        this.#state = 0n;
        // Increment must be odd
        this.#inc = (seedBigInt << 1n) | 1n;

        // Advance the internal state to mix in the initial seed
        this.#nextState();
        this.#state = (this.#state + seedBigInt) & 0xFFFFFFFFFFFFFFFFn;
        this.#nextState();
    }

    /**
     * A simple string hashing function to convert a string seed into a 32-bit integer.
     *
     * @param {string} str - The string to hash.
     * @returns {number} The hashed 32-bit signed integer.
     * @private
     */
    #hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash | 0; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * Advances the internal LCG state and returns the old state.
     *
     * @returns {bigint} The internal state before advancing.
     * @private
     */
    #nextState() {
        const oldState = this.#state;
        // Multiplier: 6364136223846793005
        this.#state = (oldState * 6364136223846793005n + this.#inc) & 0xFFFFFFFFFFFFFFFFn;
        return oldState;
    }

    /**
     * Generates the next pseudo-random number in the sequence.
     *
     * @returns {number} A floating-point number between 0 (inclusive) and 1 (exclusive).
     */
    next() {
        const oldState = this.#nextState();

        // PCG32 output function: RXS-M-XS (Randomized Xorshift, Multiply, Xorshift)
        // Extract the top 32 bits shifted right by 18, XOR with the top 32 bits, then shift right by 27
        const xorshifted = Number(((oldState >> 18n) ^ oldState) >> 27n) >>> 0;

        // Extract the rotation value from the very top 5 bits
        const rot = Number(oldState >> 59n);

        // Perform a 32-bit bitwise right rotation
        const result = ((xorshifted >>> rot) | (xorshifted << ((32 - rot) & 31))) >>> 0;

        // Convert to a float in [0.0, 1.0)
        return result / 4294967296.0;
    }
}
