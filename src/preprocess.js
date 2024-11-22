// src/preprocess.js

function preprocessData(data) {
  data.students.forEach((student) => {
    // Parse subjects
    if (student.subjects) {
      student.subjects = student.subjects.split(',').map((subject) => subject.trim());
    } else {
      student.subjects = [];
    }

    // Parse interests
    if (student.interests) {
      student.interests = student.interests.split(',').map((interest) => interest.trim());
    } else {
      student.interests = [];
    }
  });

  data.careers.forEach((career, index) => {
    try {
      // Parse related courses
      if (career.related_courses) {
        career.related_courses = career.related_courses.split(',').map((courseId) => courseId.trim());
      } else {
        career.related_courses = [];
      }
    } catch (error) {
      console.error(`Error processing career at index ${index}:`, error);
      career.related_courses = []; // Default to an empty array if parsing fails
    }
  });

  data.courses.forEach((course, index) => {
    try {
      // Ensure course fields are in correct format (add similar checks as needed)
      if (!course.course_id) {
        throw new Error(`Missing course_id for course at index ${index}`);
      }
    } catch (error) {
      console.error(`Error processing course at index ${index}:`, error);
    }
  });

  // Additional preprocessing for enrollments, courses, careers if needed
  // ...

  return data;
}

module.exports = { preprocessData };
