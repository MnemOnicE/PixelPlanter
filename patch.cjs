const fs = require('fs');
const file = 'src/generators/MazeGenerator.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/static params = \{\s*complexity:\s*\{\s*label: 'Complexity',\s*type: 'slider',\s*min: 1,\s*max: 10,\s*step: 1,\s*defaultValue: 5,\s*\},\s*\};/, 'static params = {};');

content = content.replace(/\s*\*\s*@param\s*\{number\}\s*\[config\.complexity=5\][^\n]+\n/, '\n');

content = content.replace(/run\(\{ size, complexity = 5 \}/, 'run({ size })');

content = content.replace(/\s*const loops = Math\.floor\(\(complexity \/ 10\) \* \(dim \* dim \* 0\.05\)\);\s*for \(let k = 0; k < loops; k\+\+\) \{\s*const rx = Math\.floor\(prng\.next\(\) \* \(dim - 2\)\) \+ 1;\s*const ry = Math\.floor\(prng\.next\(\) \* \(dim - 2\)\) \+ 1;\s*if \(gridData\[ry\]\[rx\] === 1\) gridData\[ry\]\[rx\] = 0;\s*\}/, '');

fs.writeFileSync(file, content);
console.log('Patched MazeGenerator.js');
