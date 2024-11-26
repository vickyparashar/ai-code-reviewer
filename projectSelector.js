const readline = require('readline');
const fs = require('fs');
const path = require('path');
const checkoutRepository = require('./checkout'); // Import checkout function
const scanProject = require('./scan'); // Import scan function

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Prompt the user for input.
 * @param {string} question - The question to ask the user.
 * @returns {Promise<string>} - The user's input.
 */
function prompt(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

/**
 * List existing projects in the `project/` directory with `-review` suffix.
 * @returns {string[]} - Array of project paths.
 */
function listExistingProjects() {
    const projectDir = path.join(__dirname, 'project/code-scan');
    if (!fs.existsSync(projectDir)) {
        console.log('No project directory found.');
        return [];
    }

    const projects = fs.readdirSync(projectDir).filter((dir) => dir.endsWith('-review'));
    if (projects.length === 0) {
        console.log('No existing projects found.');
    }

    return projects;
}

/**
 * Select a project from the list.
 * @param {string[]} projects - List of project directories.
 * @returns {Promise<string>} - The selected project name.
 */
async function selectExistingProject(projects) {
    console.log('Available projects:');
    projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project}`);
    });

    const choice = await prompt('Enter the number of the project you want to select: ');
    const index = parseInt(choice, 10) - 1;

    if (index >= 0 && index < projects.length) {
        return projects[index];
    } else {
        console.log('Invalid selection. Please try again.');
        return selectExistingProject(projects);
    }
}

/**
 * Ask the user whether the project is new or existing.
 * If new, trigger the checkout process, otherwise list and select existing projects.
 */
async function projectSelector() {
    try {
        const projectType = await prompt('Is this a new project or an existing one? (new/existing): ');

        if (projectType.toLowerCase() === 'new') {
            console.log('Proceeding with checkout...');
            const configFolderPath = await checkoutRepository(); // Call checkout if it's a new project
            await scanProject(configFolderPath); // Start scanning the selected project
        } else if (projectType.toLowerCase() === 'existing') {
            const projects = listExistingProjects();
            if (projects.length > 0) {
                const selectedProject = await selectExistingProject(projects);
                const projectPath = path.join(__dirname, 'project/code-scan', selectedProject);
                console.log(`Starting scan for selected project: ${selectedProject}`);
                await scanProject(projectPath); // Start scanning the selected project
            }
        } else {
            console.log('Invalid input. Please type "new" or "existing".');
            await projectSelector(); // Ask again if input is invalid
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
    }
}

module.exports = projectSelector; // Export projectSelector function
