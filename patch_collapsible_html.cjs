const fs = require('fs');
const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

// Generator
content = content.replace(
    /                <h3><i class="fa-solid fa-seedling"><\/i> Generator<\/h3>\n\n                <div class="control-group">/,
    `                <h3 class="collapsible"><i class="fa-solid fa-seedling"></i> Generator</h3>\n                <div class="section-content">\n                <div class="control-group">`
);
content = content.replace(
    /                <\/div>\n\n                <hr \/>\n\n                <h3><i class="fa-solid fa-palette"><\/i> Style<\/h3>/,
    `                </div>\n                </div>\n\n                <hr />\n\n                <h3 class="collapsible"><i class="fa-solid fa-palette"></i> Style</h3>`
);

// Style
content = content.replace(
    /                <h3 class="collapsible"><i class="fa-solid fa-palette"><\/i> Style<\/h3>\n\n                <div class="control-group">/,
    `                <h3 class="collapsible"><i class="fa-solid fa-palette"></i> Style</h3>\n                <div class="section-content">\n                <div class="control-group">`
);
content = content.replace(
    /                <\/div>\n\n                <hr \/>\n\n                <h3><i class="fa-solid fa-paintbrush"><\/i> Tools<\/h3>/,
    `                </div>\n                </div>\n\n                <hr />\n\n                <h3 class="collapsible"><i class="fa-solid fa-paintbrush"></i> Tools</h3>`
);

// Tools
content = content.replace(
    /                <h3 class="collapsible"><i class="fa-solid fa-paintbrush"><\/i> Tools<\/h3>\n                <div class="control-group">/,
    `                <h3 class="collapsible"><i class="fa-solid fa-paintbrush"></i> Tools</h3>\n                <div class="section-content">\n                <div class="control-group">`
);
content = content.replace(
    /                <\/div>\n\n                <button id="generate-btn" style="margin-top: auto">REGENERATE \(Space\)<\/button>\n            <\/aside>/,
    `                </div>\n                </div>\n\n                <button id="generate-btn" style="margin-top: auto">REGENERATE (Space)</button>\n            </aside>`
);

// Layers
content = content.replace(
    /                <h3><i class="fa-solid fa-layer-group"><\/i> Layers<\/h3>\n\n                <div id="layer-panel">/,
    `                <h3 class="collapsible"><i class="fa-solid fa-layer-group"></i> Layers</h3>\n                <div class="section-content">\n                <div id="layer-panel">`
);
content = content.replace(
    /                <\/div>\n\n                <hr \/>\n\n                <h3><i class="fa-solid fa-wand-magic-sparkles"><\/i> Modifiers<\/h3>/,
    `                </div>\n                </div>\n\n                <hr />\n\n                <h3 class="collapsible"><i class="fa-solid fa-wand-magic-sparkles"></i> Modifiers</h3>`
);

// Modifiers
content = content.replace(
    /                <h3 class="collapsible"><i class="fa-solid fa-wand-magic-sparkles"><\/i> Modifiers<\/h3>\n                <div\n                    id="modifiers-container"/,
    `                <h3 class="collapsible"><i class="fa-solid fa-wand-magic-sparkles"></i> Modifiers</h3>\n                <div class="section-content">\n                <div\n                    id="modifiers-container"`
);
content = content.replace(
    /                <\/div>\n\n                <hr \/>\n\n                <h3>Actions<\/h3>/,
    `                </div>\n                </div>\n\n                <hr />\n\n                <h3 class="collapsible">Actions</h3>`
);

// Actions
content = content.replace(
    /                <h3 class="collapsible">Actions<\/h3>\n                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px">/,
    `                <h3 class="collapsible">Actions</h3>\n                <div class="section-content">\n                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px">`
);
content = content.replace(
    /                <\/div>\n\n                <!-- Elements hidden in Studio mode but kept for compatibility or specific tools -->/,
    `                </div>\n                </div>\n\n                <!-- Elements hidden in Studio mode but kept for compatibility or specific tools -->`
);

fs.writeFileSync(file, content);
