const fs = require('fs');
const path = require('path');
const processFiles = require('./processFiles'); 
const extractFilesForScanning = require('./extractFilesForScanning');
/**
 * Scan the project files. If the project is existing, check if scanning was already done.
 * @param {string} reviewFolderPath - The root path of the project.
 * @param {string} projectType - Indicates if the project is new or existing.
 */


async function scanProject(reviewFolderPath) {
    try {
        if (!reviewFolderPath) {
            console.log('Review folder path not provided.');
            return;
        }

        if (fs.existsSync(reviewFolderPath)) {
            const processedFilePath = path.join(reviewFolderPath, 'processedfiles.txt');
            const scanFilePath = path.join(reviewFolderPath, 'scanfiles.txt');

            if (fs.existsSync(processedFilePath) && fs.existsSync(scanFilePath)) {
                console.log('Found existing scan files. scan...');
                await startScanning(reviewFolderPath,processedFilePath, scanFilePath);
            } else {
                console.log('No previous scan data found.');
               
            }
        } else {
            console.log('Review folder not found.');
            
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}



/**
 * Resume scanning the project by reading the existing scan files.
 * @param {string} processedFilePath - Path to the processed files list.
 * @param {string} scanFilePath - Path to the scan files list.
 */
async function startScanning(reviewFolderPath,processedFilePath, scanFilePath) {
    console.log(`scan using files: ${processedFilePath} and ${scanFilePath}`);
    await  processFiles(reviewFolderPath,scanFilePath,processedFilePath);
    // Add resumption logic here
}

module.exports = scanProject;
