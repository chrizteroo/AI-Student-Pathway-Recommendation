// src/contentBasedFiltering.js

/**
 * Builds a TF-IDF model for the given courses.
 * @param {Array} courses - List of course objects.
 * @returns {Object} A TF-IDF model with course_id as keys and relevant data.
 */
function buildTFIDFModel(courses) {
  const tfidfModel = {};

  // Build a simple representation of courses as the TF-IDF model
  courses.forEach((course) => {
    tfidfModel[course.course_id] = {
      name: course.name,
      description: course.description,
    };
  });

  return tfidfModel;
}

/**
 * Generates recommendations based on the last course taken using the TF-IDF model.
 * @param {Object} tfidfModel - The TF-IDF model built from courses.
 * @param {String} lastCourseTaken - The ID of the last course the student took.
 * @param {String} studentId - The ID of the student (for logging/debugging).
 * @returns {Array} A list of recommended course IDs.
 */
function getRecommendations(tfidfModel, lastCourseTaken, studentId) {
  console.log('Last Course Taken by', studentId, ':', lastCourseTaken);

  if (!lastCourseTaken || !tfidfModel[lastCourseTaken]) {
    console.warn('No valid last course taken or course not found in TF-IDF model.');
    return [];
  }

  // Dummy logic: Recommend other courses excluding the last one taken
  const recommendations = Object.keys(tfidfModel).filter(
    (courseId) => courseId !== lastCourseTaken
  );

  // For example, return up to 3 recommendations
  return recommendations.slice(0, 3);
}

module.exports = { buildTFIDFModel, getRecommendations };
