const fs = require('fs');
const file = 'src/style.css';
let content = fs.readFileSync(file, 'utf8');

const css = `
/* --- Collapsible Sections --- */
.collapsible {
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.collapsible::after {
    content: '\\25BC'; /* Down arrow */
    font-size: 0.8em;
    transition: transform 0.3s;
}

.collapsible.collapsed::after {
    transform: rotate(-90deg);
}

.section-content {
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
}

.section-content.collapsed {
    display: none;
}
`;

content += css;
fs.writeFileSync(file, content);
