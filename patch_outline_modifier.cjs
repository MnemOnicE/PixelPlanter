const fs = require('fs');

const outlinePath = 'src/modifiers/OutlineModifier.js';
let outlineContent = fs.readFileSync(outlinePath, 'utf8');

// Modify the signature to accept activeMask
outlineContent = outlineContent.replace(
    /apply\(dataGrid, config = \{\}\) \{/,
    `apply(dataGrid, config = {}, prng = null, readBelowGrid = null, activeMask = null) {`
);

// Modify the application loop to respect the activeMask
outlineContent = outlineContent.replace(
    /if \(dataGrid\[y\]\[x\] === 0\) \{/,
    `// If there's an active mask, only apply outline if the current cell is within the mask.
                if (activeMask && activeMask[y] && activeMask[y][x] === 0) {
                    continue; // Skip masked-out areas
                }

                // IF the current cell's value is 0 (it's empty space):
                if (dataGrid[y][x] === 0) {`
);

fs.writeFileSync(outlinePath, outlineContent);
console.log('OutlineModifier.js updated to respect activeMask!');
