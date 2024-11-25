const fs = require('fs');
const path = require('path');
const { reviewFileContent } = require('./reviewer');

/**
 * Process files based on the given project configuration folder path.
 * @param {string} scanFilesPath - The root folder of the project config.
*  @param {string} processedFilesPath - The root folder of the project config.
 */
async function processFiles(scanFilesPath,processedFilesPath) {
    try {
  

        // Check if scanfiles.txt exists
        if (!fs.existsSync(scanFilesPath)) {
            console.log('No files to process.');
            return;
        }

        // Read files to scan and already processed files
        const scanFiles = fs.readFileSync(scanFilesPath, 'utf-8').split('\n').filter(Boolean);
        const processedFiles = fs.existsSync(processedFilesPath)
            ? fs.readFileSync(processedFilesPath, 'utf-8').split('\n').filter(Boolean)
            : [];

        // Process each file in scanFiles
        for (const file of scanFiles) {
            console.log(`Processing file: ${file}`);
            
            // Ensure the file exists before attempting to process
            const filePath =file;
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf-8');

            // Review and update file content
            const updatedContent = await reviewFileContent(content);
            fs.writeFileSync(filePath, updatedContent, 'utf-8');
            console.log(`Updated file: ${filePath}`);

            processedFiles.push(file); // Add to processed files
        }

        // Update processed and remaining files lists
        fs.writeFileSync(processedFilesPath, processedFiles.join('\n'), 'utf-8');
        const remainingFiles = scanFiles.filter((file) => !processedFiles.includes(file));
        fs.writeFileSync(scanFilesPath, remainingFiles.join('\n'), 'utf-8');

        console.log('Processing completed.');
    } catch (error) {
        console.error('Error processing files:', error.message);
    }
}

// Export the function for use in other modules
module.exports = processFiles;

