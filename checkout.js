const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const extractFilesForScanning = require('./extractFilesForScanning'); // Import the module

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function checkoutRepository() {
    return new Promise(async (resolve, reject) => {
        try {
            // Prompt for repository details
            const repoUrl = await prompt('Enter the repository URL: ');
            const branch = await prompt('Enter the branch name: ');

            // Derive the project name from the repository URL (or from any other logic you prefer)
            const projectName = path.basename(repoUrl, '.git'); // Assuming the repo URL ends with '.git'

            // Define the repository path
            const repoPath = path.resolve('./project/code', projectName);

            // Remove existing folder if it exists, to ensure clean checkout
            if (fs.existsSync(repoPath)) {
                console.log(`Removing existing folder: ${repoPath}`);
                fs.rmSync(repoPath, { recursive: true, force: true });
            }

            // Create a new folder
            fs.mkdirSync(repoPath, { recursive: true });

            // Git clone command
            const command = `git clone --branch ${branch} ${repoUrl} ${repoPath}`;
            console.log(`Cloning repository to ${repoPath}...`);

            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error checking out repository: ${stderr}`);
                    rl.close();
                    reject(new Error(stderr));
                    return;
                }

                console.log('Checkout successful.');

                try {
                    // Define the scan folder path under the project-specific folder
                    const scanProjectFolderPath = path.resolve(repoPath, 'code-scan');

                    // Call the extractFilesForScanning module
                    const configFolderPath = await extractFilesForScanning(repoPath, scanProjectFolderPath);

                    console.log(`Configuration folder created at: ${configFolderPath}`);
                    rl.close();
                    resolve(configFolderPath); // Resolve the Promise with the config folder path
                } catch (extractionError) {
                    console.error('Error during file extraction:', extractionError.message);
                    rl.close();
                    reject(extractionError);
                }
            });
        } catch (error) {
            console.error('Error:', error.message);
            rl.close();
            reject(error);
        }
    });
}

module.exports = checkoutRepository; // Export as a function
