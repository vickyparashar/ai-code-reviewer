const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function commitChanges() {
    try {
        const repoPath = await prompt('Enter the repository path: ');

        exec(`cd ${repoPath} && git add . && git commit -m "Code changes reviewed and updated" && git push`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error committing changes: ${stderr}`);
            } else {
                console.log('Changes committed and pushed successfully.');
            }
            rl.close();
        });
    } catch (error) {
        console.error('Error:', error.message);
        rl.close();
    }
}

commitChanges();
