const fs = require('fs');
const file = 'src/style.css';
let content = fs.readFileSync(file, 'utf8');

const css = `
/* --- Palette Swatches --- */
.palette-swatches {
    min-height: 15px; /* Prevent jumping when empty */
}

.swatch {
    width: 15px;
    height: 15px;
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
`;

content += css;
fs.writeFileSync(file, content);
