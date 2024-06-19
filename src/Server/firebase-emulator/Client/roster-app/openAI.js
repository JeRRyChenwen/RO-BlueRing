require('dotenv').config();

// Import OpenAI API
const Configuration = require('openai');
const OpenAI = require('openai');
const fs = require('fs');

// Set color codes
const reset = '\x1b[0m';
const green = '\x1b[32m';

// Define a function to get a response from the OpenAI API.
// Documentation: https://platform.openai.com/docs/guides/chat
const getResponse = async (openai, request) => {
  const completion = await openai.chat.completions.create(request);

  const review = completion.choices[0]?.message?.content;
  return review;
};

// Get the file path from the command line.
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path.');
  process.exit(1);
}

// Read the file and get the code.
const code = fs.readFileSync(filePath, 'utf-8');

// Build the prompt for OpenAI API.
const prompt = `
Review the code below and provide feedback on how to improve it.

${code}
`
if (prompt == null) {
  console.error('Please provide a valid command.');
  process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,// This is also the default, can be omitted
});

// Get a response from OpenAI API.
getResponse(openai, {
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: prompt
    }
  ]
})
  .then((response) => {
    console.log(`${green}Review ${filePath}:${reset}\n${response}${reset}\n`);
  })
  .catch((error) => {
    console.error(error);
  })