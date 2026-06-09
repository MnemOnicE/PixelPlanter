const fs = require('fs');
const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /                    <select id="palette-select"><\/select>\n                <\/div>/,
    `                    <select id="palette-select"></select>\n                    <div id="palette-swatches" class="palette-swatches" style="display:flex; gap:2px; margin-top:5px; flex-wrap:wrap;"></div>\n                </div>`
);

fs.writeFileSync(file, content);
