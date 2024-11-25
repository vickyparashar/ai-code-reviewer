const fs = require('fs');
const path = require('path');
const processFiles = require('./processFiles'); 
const extractFilesForScanning = require('./extractFilesForScanning');
/**
 * Scan the project files. If the project is existing, check if scanning was already done.
 * @param {string} reviewFolderPath - The root path of the project.
 * @param {string} projectType - Indicates if the project is new or existing.
 */
async function scanProject(orginalProjectPath,reviewFolderPath, projectType) {
    try {
        if (projectType.toLowerCase() === 'new') {
            console.log('Starting fresh scan for the new project.');
            await startScanning(orginalProjectPath);
        } else if (projectType.toLowerCase() === 'existing') {
            const reviewFolderPath = reviewFolderPath
            if (fs.existsSync(reviewFolderPath)) {
                const processedFilePath = path.join(reviewFolderPath, 'processedfiles.txt');
                const scanFilePath = path.join(reviewFolderPath, 'scanfiles.txt');

                if (fs.existsSync(processedFilePath) && fs.existsSync(scanFilePath)) {
                    console.log('Found existing scan files. Resuming scan...');
                    await resumeScanning(processedFilePath, scanFilePath);
                } else {
                    console.log('No previous scan data found.');
                   
                }
            } else {
                console.log('Review folder not found.');
               
            }
        } else {
            console.log('Invalid project type.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

/**
 * Start scanning the project files from scratch.
 * @param {string} reviewFolderPath - The root path of the project.
 */
async function startScanning(orginalProjectPath,scanProjectFolderPath) {
    await extractFilesForScanning(originalProjectPath, scanProjectFolderPath);
    console.log(`Scanning folder: ${orginalProjectPath}`);
    // Add scanning logic here
}

/**
 * Resume scanning the project by reading the existing scan files.
 * @param {string} processedFilePath - Path to the processed files list.
 * @param {string} scanFilePath - Path to the scan files list.
 */
async function resumeScanning(processedFilePath, scanFilePath) {
    console.log(`Resuming scan using files: ${processedFilePath} and ${scanFilePath}`);
    await  processFiles(scanFilePath,processedFilePath);
    // Add resumption logic here
}

module.exports = scanProject;
