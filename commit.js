const { exec } = require('child_process');
const fs = require('fs');

async function commitChanges(reviewFolderPath) {
    try {
        // Read the project path from the projectpath.txt file
        const projectPath = fs.readFileSync(`${reviewFolderPath}/projectpath.txt`, 'utf-8').trim();

        exec(`cd ${projectPath} && git add . && git commit -m "applied ai code reviewer changes" && git push`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error committing changes: ${stderr}`);
            } else {
                console.log('Changes committed and pushed successfully.');
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Export the function so it can be called from outside
module.exports = commitChanges;
