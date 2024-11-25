// checkout.js

const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function checkoutRepository() {
    try {
        const repoUrl = await prompt('Enter the repository URL: ');
        const branch = await prompt('Enter the branch name: ');
        const folder = await prompt('Enter the folder name to check out the repository: ');

        const repoPath = path.resolve(folder);

        // Create folder if it doesn't exist
        if (!fs.existsSync(repoPath)) {
            fs.mkdirSync(repoPath, { recursive: true });
        }

        const command = `git clone --branch ${branch} ${repoUrl} ${repoPath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error checking out repository: ${stderr}`);
            } else {
                console.log('Checkout successful');
            }
            rl.close();
        });
    } catch (error) {
        console.error('Error:', error.message);
        rl.close();
    }
}

module.exports = checkoutRepository;  // Export as a function
