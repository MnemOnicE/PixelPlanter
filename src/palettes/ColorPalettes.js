/**
 * @file ColorPalettes.js
 * @description A collection of multi-color palette modules.
 */

/**
 * A palette with classic vaporwave/outrun colors.
 * Maps binary grid values to a set of predefined colors.
 */
export class VaporwavePalette {
    /**
     * Creates an instance of VaporwavePalette.
     * Initializes the color array.
     */
    constructor() {
        // First color is the background for "off" pixels (value 0).
        // The rest are for "on" pixels (value 1).
        this.colors = [
            '#0D0221', // Deep Purple Background
            '#FF00A5', // Hot Pink
            '#F9B628', // Gold
            '#22E4E0', // Cyan
        ];
    }

    /**
     * Maps the data grid to this palette.
     *
     * @param {number[][]} dataGrid - The grid from the generator.
     * @returns {string[][]} A 2D array of color strings.
     */
    map(dataGrid) {
        const backgroundColor = this.colors[0];
        const foregroundColors = this.colors.slice(1); // All colors except the first

        return dataGrid.map((row) => {
            return row.map((value) => {
                // If the pixel is "off" (0), use the background color.
                if (value === 0) {
                    return backgroundColor;
                }
                // If the pixel is "on" (1), pick a random color from the foreground list.
                const randomIndex = Math.floor(Math.random() * foregroundColors.length);
                return foregroundColors[randomIndex];
            });
        });
    }
}

/**
 * A palette with earthy greens and browns.
 * Maps binary grid values to a set of nature-inspired colors.
 */
export class ForestPalette {
    /**
     * Creates an instance of ForestPalette.
     * Initializes the color array.
     */
    constructor() {
        this.colors = [
            '#2F1B05', // Dark Brown Background
            '#3E6928', // Forest Green
            '#7A8E30', // Moss Green
            '#B39839', // Light Brown
        ];
    }

    /**
     * Maps the data grid to this palette.
     *
     * @param {number[][]} dataGrid - The grid from the generator.
     * @returns {string[][]} A 2D array of color strings.
     */
    map(dataGrid) {
        const backgroundColor = this.colors[0];
        const foregroundColors = this.colors.slice(1);

        return dataGrid.map((row) => {
            return row.map((value) => {
                if (value === 0) return backgroundColor;
                const randomIndex = Math.floor(Math.random() * foregroundColors.length);
                return foregroundColors[randomIndex];
            });
        });
    }
}
