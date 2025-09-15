// CLASS SeededRandom
// A simple pseudo-random number generator based on a Linear Congruential Generator (LCG).
export class SeededRandom {
    #seed;
    #m = 2**31; // Modulus
    #a = 1103515245; // Multiplier
    #c = 12345; // Increment

    /**
     * Creates an instance of SeededRandom.
     * @param {string|number} seed - The initial seed value.
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
     * @returns {number} A floating-point number between 0 (inclusive) and 1 (exclusive).
     */
    next() {
        this.#seed = (this.#a * this.#seed + this.#c) % this.#m;
        return this.#seed / this.#m;
    }
}
