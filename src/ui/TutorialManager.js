import { driver } from 'driver.js';

/**
 * Manages guided interactive tutorials using driver.js.
 */
export const TutorialManager = {
    /**
     * Starts a specific tutorial by its ID.
     * @param {string} tutorialId - The ID of the tutorial to start.
     */
    startTutorial: (tutorialId) => {
        let steps = [];

        switch (tutorialId) {
            case 'basic-sprite':
                steps = [
                    {
                        element: '#generator-select',
                        popover: {
                            title: '1. Select Generator',
                            description: 'Start by choosing a base algorithm. Select "symmetry" from the dropdown.',
                        },
                    },
                    {
                        element: '#symmetry-select',
                        popover: {
                            title: '2. Set Symmetry',
                            description: 'Change the symmetry mode to "vertical" to create a sword-like shape.',
                        },
                    },
                    {
                        element: '#palette-select',
                        popover: {
                            title: '3. Pick a Palette',
                            description: 'Choose a nice palette for your weapon, like "monochrome" or "cyberpunk".',
                        },
                    },
                    {
                        element: '#add-layer-btn',
                        popover: {
                            title: '4. Add a Layer',
                            description: 'Click here to add the base layer for our sword.',
                        },
                    },
                    {
                        element: '#generate-btn',
                        popover: {
                            title: '5. Generate!',
                            description: 'Click to generate your first symmetric shape. Keep clicking until you find a shape you like!',
                        },
                    }
                ];
                break;
            default:
                console.warn(`Tutorial with ID "${tutorialId}" not found.`);
                return;
        }

        const driverObj = driver({
            showProgress: true,
            steps: steps,
        });

        driverObj.drive();
    }
};
