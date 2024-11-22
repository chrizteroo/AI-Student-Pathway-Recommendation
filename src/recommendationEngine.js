// src/recommendationEngine.js

const collaborativeFiltering = require('./collaborativeFiltering');
const contentBasedFiltering = require('./contentBasedFiltering');
const knowledgeGraph = require('./knowledgeGraph');
const languageModel = require('./languageModel');
const sequenceModeling = require('./sequenceModeling');


// Helper function to get the last course taken by a student
function getLastCourseTaken(enrollments, studentId) {
  const studentEnrollments = enrollments
    .filter((enrollment) => enrollment.student_id === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by descending date

  return studentEnrollments.length > 0 ? studentEnrollments[0].course_id : null;
}

// Helper function to get the course sequence for a student
function getStudentCourseSequence(enrollments, studentId) {
  const studentEnrollments = enrollments
    .filter((enrollment) => enrollment.student_id === studentId)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by ascending date

  return studentEnrollments.map((enrollment) => enrollment.course_id);
}

// Helper function to get a course name by its ID
function getCourseNameById(courseId, courses) {
  const course = courses.find((c) => c.course_id === courseId);
  return course ? course.name : 'Unknown Course';
}

// Main function to generate recommendations
async function generateRecommendations(data, studentId) {
  const { students, courses, enrollments, careers } = data;

  // Get the student's data
  const student = students.find((s) => s.student_id === studentId);
  if (!student) {
    console.error(`Student with ID ${studentId} not found.`);
    return null;
  }

  console.log(`Processing recommendations for ${student.name} (ID: ${studentId})...`);

  // Collaborative Filtering
  const userItemMatrix = collaborativeFiltering.buildUserItemMatrix(enrollments);
  const similarStudents = collaborativeFiltering.getSimilarStudents(userItemMatrix, studentId);
  const cfRecommendations = 
    collaborativeFiltering.getRecommendations(userItemMatrix, similarStudents, studentId) || [];

  // Content-Based Filtering
  const lastCourseTaken = getLastCourseTaken(enrollments, studentId);
  const tfidfModel = contentBasedFiltering.buildTFIDFModel(courses);
  const cbfRecommendations = 
    contentBasedFiltering.getRecommendations(tfidfModel, lastCourseTaken, studentId) || [];

  // Sequence Modeling
  const model = await sequenceModeling.loadModel();
  const courseSequence = getStudentCourseSequence(enrollments, studentId);
  const nextCourse = 
    (await sequenceModeling.predictNextCourse(model, courseSequence, studentId)) || null;

  // Combine Recommendations
  const combinedRecommendations = [
    ...new Set([
      ...cfRecommendations,
      ...cbfRecommendations,
      ...(nextCourse ? [nextCourse] : []),
    ]),
  ];

  // Knowledge Graph
  const graphData = knowledgeGraph.buildGraph(courses, careers);
  const careerPaths = combinedRecommendations.reduce((acc, courseId) => {
    acc[courseId] = knowledgeGraph.findCareerPaths(graphData, courseId);
    return acc;
  }, {});

  // Get Student Name and Interests
  const studentName = student.name;
  const studentInterests = student.interests || [];

  // Get Course Names
  const courseNames = combinedRecommendations.map((courseId) =>
    getCourseNameById(courseId, courses)
  );

  // Generate Explanation
  const explanation = await languageModel.generateExplanation(
    studentName,
    courseNames,
    studentInterests
  );

  // Return the final recommendations
  return {
    recommendations: combinedRecommendations,
    careerPaths,
    explanation,
  };
}

module.exports = { generateRecommendations };
