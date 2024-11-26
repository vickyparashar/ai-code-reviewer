const axios = require('axios');
const https = require('https');
require('dotenv').config();

const apiKey = process.env.GROK_API_KEY;

/**
 * Sends file content to the review API and retrieves the updated content.
 * @param {string} content - The original file content.
 * @returns {Promise<string>} - The formatted and reviewed file content.
 */
async function reviewFileContent(filename, content) {
  try {
    const inputText = content;
    const xaiApiKey = apiKey;
    const jsonPayload = {
      messages: [
        {
          role: "system",
          content: `Your task is to add clear and concise comments to the provided code. Return the updated code with comments and no other text, explanation, or additional data.`
        },
        {
          role: "user",
          content: `Add concise comments to the following code file named ${filename}:\n${content}\n\nYour task is to:\n1. Use the appropriate commenting style.\n2. Add clear and concise comments relevant to the code and its logic.\n3. Return only the updated code with comments, without any additional explanation or data.`
        }
      ],
      model: "grok-beta",
      stream: false,
      temperature: 0
    };

    // Create an HTTPS agent that disables SSL certificate validation
    const agent = new https.Agent({
      rejectUnauthorized: false, // Disable SSL certificate validation
    });

    // Make the API call to Grok-Beta
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      jsonPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${xaiApiKey}`
        },
        httpsAgent: agent // Use the insecure agent
      }
    );

    // Extract the generated PowerShell code from the response
    let responseContent = response.data.choices[0].message.content;
    return formatReviewedContent(responseContent);

  } catch (error) {
    console.error('Error reviewing file content:', error.message);
    throw error;
  }
}

/**
 * Formats the reviewed file content for display.
 * @param {string} reviewedContent - The content received after review.
 * @returns {string} - The formatted "under review" file content.
 */
function formatReviewedContent(reviewedContent) {
  const parts = reviewedContent.split(/```[a-zA-Z0-9- ]*/);
  
  // Return the second part of the split array (index 1)
  return parts[1] || null; // Fallback to null if the index doesn't exist
}

module.exports = { reviewFileContent };
