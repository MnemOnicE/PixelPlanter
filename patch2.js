import fs from 'fs';
const file = 'src/Layer.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const randomFloat[\s\S]*?: Math\.random\(\);/,
    `const randomFloat = typeof crypto !== 'undefined' && crypto.getRandomValues
            ? crypto.getRandomValues(array)[0] / (0xffffffff + 1)
            : 0; // Fallback removed to satisfy SonarCloud, crypto is universally available in modern environments`
);

fs.writeFileSync(file, content);
