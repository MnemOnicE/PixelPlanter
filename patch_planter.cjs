const fs = require('fs');

const planterContent = fs.readFileSync('src/Planter.js', 'utf8');

// Add import
let updatedContent = planterContent.replace(
    /import { ParticleModifier } from '\.\/modifiers\/ParticleModifier\.js';/,
    `import { ParticleModifier } from './modifiers/ParticleModifier.js';\nimport { FilterModifier } from './modifiers/FilterModifier.js';`
);

// Register default module
updatedContent = updatedContent.replace(
    /this\.registerModifier\('particle-deposition', new ParticleModifier\(\)\);/,
    `this.registerModifier('particle-deposition', new ParticleModifier());\n        this.registerModifier('filter', new FilterModifier());`
);

fs.writeFileSync('src/Planter.js', updatedContent);
console.log('Planter.js updated with FilterModifier import and registry!');
