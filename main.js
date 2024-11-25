// main.js

(async () => {
    const projectSelector = require('./projectSelector');  // Import the project selector
    await projectSelector();  // Ask user whether to create a new project or use an existing one

    await require('./scan')();  // Proceed with scanning after project selection
    await require('./process')();  // Proceed with file processing
    await require('./commit')();  // Proceed with commit
})();
