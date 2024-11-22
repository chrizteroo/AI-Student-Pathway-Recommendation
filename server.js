require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const recommendationEngine = require('./src/recommendationEngine');
const preprocess = require('./src/preprocess');
const dataLoader = require('./src/dataLoader');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

// Paths to JSON files
const careersPath = path.join(__dirname, './data/careers.json');
const feedbackPath = path.join(__dirname, './data/feedback.json');

// Variables to hold loaded data
let preprocessedData;
let careers;

// Initialize data asynchronously
async function initializeData() {
  try {
    console.log('Loading data...');
    const data = await dataLoader.loadData(); // Asynchronously load data
    preprocessedData = preprocess.preprocessData(data); // Preprocess data
    careers = JSON.parse(fs.readFileSync(careersPath, 'utf-8')); // Load career mappings
    console.log('Data successfully loaded and preprocessed.');
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1); // Exit process if initialization fails
  }
}

// Endpoint: Get recommendations for a student by name
app.post('/api/recommend', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Student name is required' });
  }

  // Find student in preprocessed data
  const student = preprocessedData.students.find((s) => s.name.toLowerCase() === name.toLowerCase());

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  try {
    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations(
      preprocessedData,
      student.student_id
    );

    // Map recommended courses to career paths
    recommendations.careerPaths = recommendations.recommendations.reduce((acc, courseId) => {
      acc[courseId] = careers[courseId] || [];
      return acc;
    }, {});

    res.json({ student, recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Endpoint: Submit feedback
app.post('/api/feedback', (req, res) => {
  const { studentId, studentName, rating } = req.body;

  if (!studentId || !studentName || rating == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const feedback = { studentId, studentName, rating: Number(rating) };
    const existingFeedback = fs.existsSync(feedbackPath)
      ? JSON.parse(fs.readFileSync(feedbackPath, 'utf-8') || '[]')
      : [];
    existingFeedback.push(feedback);
    fs.writeFileSync(feedbackPath, JSON.stringify(existingFeedback, null, 2));

    res.json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// Start the server after initializing data
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
