const fs = require('fs');
const file = 'tests/MazeGenerator.test.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/run\(\{ size: 15, complexity: 5 \}/g, 'run({ size: 15 })');

fs.writeFileSync(file, content);
console.log('Patched MazeGenerator.test.js');
