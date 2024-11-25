// scan.js

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function scanProject() {
    try {
        const scanType = await prompt('Do you want to scan the whole project or a specific folder? (whole/specific): ');
        const folderPath = await prompt('Enter the folder path: ');

        if (!fs.existsSync(folderPath)) {
            console.error('Folder path does not exist.');
            rl.close();
            return;
        }

        const ignorePaths = fs.existsSync(path.join(folderPath, '.gitignore'))
            ? fs.readFileSync(path.join(folderPath, '.gitignore'), 'utf-8').split('\n').map((line) => line.trim())
            : [];

        const processedFiles = fs.existsSync('processedfiles.txt')
            ? fs.readFileSync('processedfiles.txt', 'utf-8').split('\n')
            : [];

        const files = [];

        function gatherFiles(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.resolve(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!ignorePaths.includes(entry.name)) gatherFiles(fullPath);
                } else if (!ignorePaths.includes(entry.name) && !processedFiles.includes(fullPath)) {
                    files.push(fullPath);
                }
            }
        }

        if (scanType === 'whole') {
            gatherFiles(folderPath);
        } else {
            const specificFolder = await prompt('Enter the specific folder to scan: ');
            gatherFiles(path.resolve(folderPath, specificFolder));
        }

        fs.writeFileSync('scanfiles.txt', files.join('\n'), 'utf-8');
        console.log('scanfiles.txt generated successfully.');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
    }
}

module.exports = scanProject;  // Export as a function
