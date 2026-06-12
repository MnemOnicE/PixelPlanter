import re

with open('src/UIManager.js', 'r') as f:
    content = f.read()

# 1. Update bindDOM
bind_dom_target = "        this.#controls.showPresetsBtn = document.getElementById('show-presets-btn');"
bind_dom_insert = """        this.#controls.showPresetsBtn = document.getElementById('show-presets-btn');
        this.#controls.showTutorialsBtn = document.getElementById('show-tutorials-btn');
        this.#tutorialsModal = document.getElementById('tutorials-modal');
        this.#tutorialGallery = document.getElementById('tutorial-gallery');
        this.#closeTutorialsBtn = this.#tutorialsModal.querySelector('.close-button');"""

content = content.replace(bind_dom_target, bind_dom_insert)

# 2. Update attachEventListeners
events_target = "        this.#controls.showPresetsBtn.addEventListener('click', () => this.#handleShowPresets());"
events_insert = """        this.#controls.showPresetsBtn.addEventListener('click', () => this.#handleShowPresets());

        this.#controls.showTutorialsBtn.addEventListener('click', () => this.#handleShowTutorials());
        this.#closeTutorialsBtn.addEventListener('click', () => (this.#tutorialsModal.style.display = 'none'));
        window.addEventListener('click', (event) => {
            if (event.target == this.#tutorialsModal) {
                this.#tutorialsModal.style.display = 'none';
            }
        });

        this.#tutorialGallery.addEventListener('click', (event) => {
            const tutorialItem = event.target.closest('.tutorial-item');
            if (tutorialItem) {
                const tutorialId = tutorialItem.dataset.id;
                this.#tutorialsModal.style.display = 'none';
                TutorialManager.startTutorial(tutorialId);
            }
        });"""

content = content.replace(events_target, events_insert)

# 3. Add handleShowTutorials
handle_presets_target = "    async #handleShowPresets() {"
handle_tutorials_insert = """    /**
     * Loads and displays the tutorials modal.
     * Fetches tutorials from `src/tutorials.json` if not already loaded.
     * @private
     */
    async #handleShowTutorials() {
        if (this.#tutorialGallery.children.length === 0) {
            try {
                const response = await fetch('./src/tutorials.json');
                const tutorials = await response.json();
                this.#populateTutorialGallery(tutorials);
            } catch (error) {
                console.error('Failed to load tutorials:', error);
                this.#tutorialGallery.textContent = '';
                const p = document.createElement('p');
                p.textContent = 'Could not load tutorials.';
                this.#tutorialGallery.appendChild(p);
            }
        }
        this.#tutorialsModal.style.display = 'block';
    }

    /**
     * Populates the tutorial gallery with items.
     * @param {object[]} tutorials - List of tutorial objects.
     * @private
     */
    #populateTutorialGallery(tutorials) {
        this.#tutorialGallery.innerHTML = '';
        tutorials.forEach((tutorial) => {
            const div = document.createElement('div');
            div.className = 'tutorial-item';
            div.dataset.id = tutorial.id;
            div.style.cssText = `
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 10px;
                cursor: pointer;
                background-color: var(--surface);
                text-align: center;
                transition: transform 0.2s;
            `;

            div.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">${tutorial.title}</div>
                <div style="font-size: 0.8em; color: var(--text-muted);">${tutorial.description}</div>
            `;

            div.addEventListener('mouseover', () => (div.style.transform = 'scale(1.05)'));
            div.addEventListener('mouseout', () => (div.style.transform = 'scale(1)'));

            this.#tutorialGallery.appendChild(div);
        });
    }

    async #handleShowPresets() {"""

content = content.replace(handle_presets_target, handle_tutorials_insert)

# 4. Declare private properties at the top of the class
props_target = "    #presetGallery;"
props_insert = """    #presetGallery;
    #tutorialsModal;
    #tutorialGallery;
    #closeTutorialsBtn;"""

content = content.replace(props_target, props_insert)

with open('src/UIManager.js', 'w') as f:
    f.write(content)

print("Patched UIManager.js successfully.")
