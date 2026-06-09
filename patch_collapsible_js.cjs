const fs = require('fs');
const file = 'src/UIManager.js';
let content = fs.readFileSync(file, 'utf8');

const js = `
        // Collapsible sections
        document.querySelectorAll('.collapsible').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                const content = header.nextElementSibling;
                if (content && content.classList.contains('section-content')) {
                    content.classList.toggle('collapsed');
                }
            });
        });
`;

content = content.replace(
    /        \/\/ Mobile Sidebar Toggles/,
    `${js}\n        // Mobile Sidebar Toggles`
);

fs.writeFileSync(file, content);
