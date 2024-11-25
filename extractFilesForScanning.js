const fs = require('fs').promises;
const path = require('path');
const ignore = require('ignore'); // Install with npm: `npm install ignore`

async function extractFilesForScanning(originalProjectPath, scanProjectFolderPath) {
    try {
        console.log(`Scanning folder: ${originalProjectPath}`);

        // Derive review folder name
        const projectName = path.basename(originalProjectPath);
        const reviewFolderPath = path.join('project/code-scan', `${projectName}-review`);

        // Recreate the review folder
        await fs.rm(reviewFolderPath, { recursive: true, force: true });
        await fs.mkdir(reviewFolderPath, { recursive: true });

        // Prepare paths for files
        const processedFilesPath = path.join(reviewFolderPath, 'processedfiles.txt');
        const projectPathFilePath = path.join(reviewFolderPath, 'projectpath.txt');
        const scanFilesFilePath = path.join(reviewFolderPath, 'scanfiles.txt');

        // Write scanProjectFolderPath to projectpath.txt
        await fs.writeFile(projectPathFilePath, scanProjectFolderPath);

        // Determine the actual start folder path
        const scanFolderPath = scanProjectFolderPath.trim() === '' || scanProjectFolderPath === '\\'
            ? originalProjectPath // Start scanning from root if empty or '\'
            : path.resolve(originalProjectPath, scanProjectFolderPath); // Resolve relative path

        console.log(`Scanning from: ${scanFolderPath}`);

        // Load .gitignore rules if present
        const gitignorePath = path.join(originalProjectPath, '.gitignore');
        let ig = ignore();
        try {
            const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
            ig = ignore().add(gitignoreContent);
        } catch (err) {
            console.error('.gitignore file not found. Scanning without exclusions.');
            throw new Error('.gitignore file is missing, and no exclusions will be applied.');
        }

        // Recursively list all files and filter with .gitignore rules
        const allFiles = await listFiles(scanFolderPath, ig, originalProjectPath);

        // Write all file paths to scanfiles.txt
        await fs.writeFile(scanFilesFilePath, allFiles.join('\n'));

        // Create an empty processedfiles.txt
        await fs.writeFile(processedFilesPath, '');

        console.log(`Scanning completed. Review folder created at: ${reviewFolderPath}`);

        // Return the review folder path
        return reviewFolderPath;
    } catch (error) {
        console.error(`Error during scanning: ${error.message}`);
        throw error; // Rethrow the error so the caller can handle it appropriately
    }
}

async function listFiles(dir, ig, baseDir = dir) {
    let files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        // Ignore .git and any files or directories matched by .gitignore
        if (relativePath.includes('.git') || ig.ignores(relativePath)) {
            continue;
        }

        if (entry.isDirectory()) {
            const nestedFiles = await listFiles(fullPath, ig, baseDir);
            files = files.concat(nestedFiles);
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

module.exports = extractFilesForScanning;
