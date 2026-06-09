const fs = require('fs');
const file = 'src/palettes/MonochromePalette.js';
let content = fs.readFileSync(file, 'utf8');

const newContent = content.replace('export class MonochromePalette {', `export class MonochromePalette {
    /**
     * Creates an instance of MonochromePalette.
     * Initializes the color array.
     */
    constructor() {
        this.colors = ['#FFFFFF', '#000000'];
    }`).replace(`        const colors = ['#FFFFFF', '#000000']; // 0 = White, 1 = Black

        // Use the .map() array method for a clean transformation.
        // This iterates through each row of the dataGrid.
        return dataGrid.map((row) => {
            // Then iterates through each value in the current row.
            return row.map((value) => {
                // If value is 0, return white. Otherwise, for any non-zero value, return black.
                return value === 0 ? colors[0] : colors[1];
            });
        });`, `        // Use the .map() array method for a clean transformation.
        // This iterates through each row of the dataGrid.
        return dataGrid.map((row) => {
            // Then iterates through each value in the current row.
            return row.map((value) => {
                // If value is 0, return white. Otherwise, for any non-zero value, return black.
                return value === 0 ? this.colors[0] : this.colors[1];
            });
        });`);

fs.writeFileSync(file, newContent);
