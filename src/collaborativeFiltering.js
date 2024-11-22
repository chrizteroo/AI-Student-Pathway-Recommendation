// collaborativeFiltering.js

function buildUserItemMatrix(enrollments) {
  const userItemMatrix = {};

  enrollments.forEach((enrollment) => {
    const userId = enrollment.student_id;
    const itemId = enrollment.course_id;

    if (!userItemMatrix[userId]) {
      userItemMatrix[userId] = {};
    }

    userItemMatrix[userId][itemId] = 1;
  });

  console.log('User-Item Matrix:', userItemMatrix);

  return userItemMatrix;
}

function getSimilarStudents(userItemMatrix, targetUserId) {
  // Implementation
}

function getRecommendations(userItemMatrix, similarUsers, targetUserId) {
  // Implementation
}

module.exports = {
  buildUserItemMatrix,
  getSimilarStudents,
  getRecommendations,
};
