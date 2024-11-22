// src/languageModel.js

const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateExplanation(studentName, courseNames) {
  const messages = [
    {
      role: 'system',
      content:
        'You are an educational advisor providing detailed explanations for course recommendations.',
    },
    {
      role: 'user',
      content: `Explain why these courses are recommended for ${studentName}: ${courseNames.join(
        ', '
      )}.`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const explanation = response.choices[0].message.content.trim();
    return explanation;
  } catch (error) {
    console.error('Error generating explanation:', error);
    return 'An error occurred while generating the explanation.';
  }
}

module.exports = { generateExplanation };
