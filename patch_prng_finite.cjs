const fs = require('fs');
let content = fs.readFileSync('src/utils/PRNG.js', 'utf8');
content = content.replace("        } else if (typeof seed === 'number') {", "        } else if (typeof seed === 'number' && Number.isFinite(seed)) {");
fs.writeFileSync('src/utils/PRNG.js', content);
