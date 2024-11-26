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

// Helper function to remove a directory with retries
async function removeDirectoryWithRetry(dirPath, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(`Successfully removed: ${dirPath}`);
                return;
            }
        } catch (error) {
            if (error.code === 'EBUSY' && attempt < retries) {
                console.warn(`Retrying to remove locked directory: ${dirPath} (Attempt ${attempt})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

async function checkoutRepository() {
    return new Promise(async (resolve, reject) => {
        try {
            // Prompt for repository details
            const repoUrl = await prompt('Enter the repository URL: ');
            const branch = await prompt('Enter the branch name: ');
            const scanfolder = await prompt('Enter the scan folder relative path: ');

            // Derive the project name from the repository URL
            const projectName = path.basename(repoUrl, '.git'); // Assuming the repo URL ends with '.git'

            // Define the repository path
            const repoPath = path.resolve('./project/code', projectName);

            // Remove existing folder if it exists
            console.log(`Checking if folder exists: ${repoPath}`);
            await removeDirectoryWithRetry(repoPath);

            // Create a new folder
            fs.mkdirSync(repoPath, { recursive: true });
            console.log(`Created directory: ${repoPath}`);

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
                    const scanProjectFolderPath = path.resolve(repoPath, scanfolder);

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
