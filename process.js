const fs = require('fs');
const { reviewFileContent } = require('./reviewer');

async function processFiles() {
    try {
        if (!fs.existsSync('scanfiles.txt')) {
            console.log('No files to process.');
            return;
        }

        const scanFiles = fs.readFileSync('scanfiles.txt', 'utf-8').split('\n').filter(Boolean);
        const processedFiles = fs.existsSync('processedfiles.txt')
            ? fs.readFileSync('processedfiles.txt', 'utf-8').split('\n').filter(Boolean)
            : [];

        for (const file of scanFiles) {
            console.log(`Processing file: ${file}`);
            const content = fs.readFileSync(file, 'utf-8');

            const updatedContent = await reviewFileContent(content); // Call to reviewer.js

            fs.writeFileSync(file, updatedContent, 'utf-8');
            console.log(`Updated file: ${file}`);

            processedFiles.push(file);
        }

        fs.writeFileSync('processedfiles.txt', processedFiles.join('\n'), 'utf-8');
        fs.writeFileSync('scanfiles.txt', scanFiles.filter((file) => !processedFiles.includes(file)).join('\n'), 'utf-8');
    } catch (error) {
        console.error('Error processing files:', error.message);
    }
}

processFiles();
