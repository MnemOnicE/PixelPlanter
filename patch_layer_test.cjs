const fs = require('fs');

const testPath = 'tests/Layer.test.js';
let testContent = fs.readFileSync(testPath, 'utf8');

// The test expects 4 arguments but we added a 5th (activeMask = null)
testContent = testContent.replace(
    /expect\(mockModifier\.apply\)\.toHaveBeenCalledWith\(initialGrid, \{ name: 'mod1', val: 10 \}, \{\}, null\);/,
    `expect(mockModifier.apply).toHaveBeenCalledWith(initialGrid, { name: 'mod1', val: 10 }, {}, null, null);`
);

fs.writeFileSync(testPath, testContent);
console.log('Layer.test.js patched!');
