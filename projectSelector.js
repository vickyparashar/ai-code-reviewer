const readline = require('readline');
const checkoutRepository = require('./checkout');  // Import checkout function

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
 * Ask the user whether the project is new or existing.
 * If new, trigger the checkout process, otherwise skip it.
 */
async function projectSelector() {
    try {
        const projectType = await prompt('Is this a new project or an existing one? (new/existing): ');

        if (projectType.toLowerCase() === 'new') {
            console.log('Proceeding with checkout...');
            await checkoutRepository();  // Call checkout if it's a new project
        } else if (projectType.toLowerCase() === 'existing') {
            console.log('Skipping checkout for existing project.');
        } else {
            console.log('Invalid input. Please type "new" or "existing".');
            await projectSelector();  // Ask again if input is invalid
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
    }
}

module.exports = projectSelector;  // Export projectSelector function
