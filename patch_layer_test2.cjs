const fs = require('fs');

const testPath = 'tests/Layer.test.js';
let testContent = fs.readFileSync(testPath, 'utf8');

testContent = testContent.replace(
    /expect\(mockModifier\.apply\)\.toHaveBeenCalledWith\(initialGrid, \{ name: 'mod1', val: 10 \}, mockPRNG, null\);/,
    `expect(mockModifier.apply).toHaveBeenCalledWith(initialGrid, { name: 'mod1', val: 10 }, mockPRNG, null, null);`
);

fs.writeFileSync(testPath, testContent);
console.log('Layer.test.js patched again!');
