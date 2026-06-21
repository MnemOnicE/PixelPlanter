const fs = require('fs');
const file = 'src/generators/MazeGenerator.js';
let content = fs.readFileSync(file, 'utf8');

// Remove complexity from static params
content = content.replace(/complexity:\s*\{[^}]+\},\s*/g, '');
// Since it was the only property, the static params might be empty, or we could remove static params entirely if it's empty, but let's check
if (content.match(/static params = \{\s*\};/)) {
    // If it's empty we should leave it as an empty object since it might be required by UI or base class
}

// Remove complexity from JSDoc
content = content.replace(/\s*\*\s*@param\s*\{number\}\s*\[config\.complexity=5\][^\n]+\n/g, '\n');

// Remove from run signature
content = content.replace(/run\(\{ size, complexity = 5 \}/g, 'run({ size })');

// Remove loops logic block
content = content.replace(/\s*const loops = Math\.floor\(\(complexity \/ 10\) \* \(dim \* dim \* 0\.05\)\);\s*for \(let k = 0; k < loops; k\+\+\) \{\s*const rx = Math\.floor\(prng\.next\(\) \* \(dim - 2\)\) \+ 1;\s*const ry = Math\.floor\(prng\.next\(\) \* \(dim - 2\)\) \+ 1;\s*if \(gridData\[ry\]\[rx\] === 1\) gridData\[ry\]\[rx\] = 0;\s*\}/g, '');

fs.writeFileSync(file, content);
console.log('Patched MazeGenerator.js');
