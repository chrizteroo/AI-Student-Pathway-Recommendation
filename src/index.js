require('dotenv').config();
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const dataLoader = require('./dataLoader');
const preprocess = require('./preprocess');
const recommendationEngine = require('./recommendationEngine');
const careers = require(path.join(__dirname, '../data/careers.json')); // Load careers.json

const feedbackPath = path.join(__dirname, '../data/feedback.json');
const processedPath = path.join(__dirname, '../data/processed_students.json');

// Function to save feedback to feedback.json
function saveFeedback(feedback) {
  const existingFeedback = fs.existsSync(feedbackPath)
    ? JSON.parse(fs.readFileSync(feedbackPath, 'utf-8') || '[]')
    : [];
  existingFeedback.push(feedback);
  fs.writeFileSync(feedbackPath, JSON.stringify(existingFeedback, null, 2));
}

// Function to save processed students
function saveProcessedStudent(studentId) {
  const processed = fs.existsSync(processedPath)
    ? JSON.parse(fs.readFileSync(processedPath, 'utf-8') || '[]')
    : [];
  processed.push(studentId);
  fs.writeFileSync(processedPath, JSON.stringify(processed, null, 2));
}

// Function to collect feedback
async function collectFeedback(studentId, studentName) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `What do you think about the recommendations for ${studentName} (ID: ${studentId})? (1-5): `,
      (rating) => {
        const feedback = { studentId, studentName, rating: parseInt(rating, 10) };
        console.log(`Thank you for your feedback!`);
        saveFeedback(feedback); // Save feedback immediately
        rl.close();
        resolve(feedback);
      }
    );
  });
}

// Main application logic
(async () => {
  try {
    // Load data
    const data = await dataLoader.loadData();

    // Preprocess data
    const preprocessedData = preprocess.preprocessData(data);

    // Load processed students
    const processedStudents = fs.existsSync(processedPath)
      ? new Set(JSON.parse(fs.readFileSync(processedPath, 'utf-8') || '[]'))
      : new Set();

    // Process each student
    for (const student of preprocessedData.students) {
      const { student_id: studentId, name: studentName } = student;

      // Skip already processed students
      if (processedStudents.has(studentId)) {
        console.log(`Skipping already processed student: ${studentName} (ID: ${studentId})`);
        continue;
      }

      console.log(`Processing recommendations for ${studentName} (ID: ${studentId})...`);

      const recommendations = await recommendationEngine.generateRecommendations(
        preprocessedData,
        studentId
      );

      // Map recommended course IDs to career paths
      const careerPaths = recommendations.recommendations.reduce((acc, courseId) => {
        acc[courseId] = careers[courseId] || []; // Default to empty array if no mapping exists
        return acc;
      }, {});

      recommendations.careerPaths = careerPaths;

      // Output recommendations
      console.log(`Recommendations for ${studentName} (ID: ${studentId}):`);
      console.log(JSON.stringify(recommendations, null, 2));
      console.log('-----------------------------');

      // Collect feedback
      await collectFeedback(studentId, studentName);

      // Save processed student
      saveProcessedStudent(studentId);

      // Optional delay
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
