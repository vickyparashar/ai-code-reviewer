const projectSelector = require('./projectSelector');  // Import projectSelector function

async function main() {
    try {
        console.log('Welcome to the AI Code Reviewer Tool!');
        await projectSelector();  // Call the projectSelector component
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the main function
main();
