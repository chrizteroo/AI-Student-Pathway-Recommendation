const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(`Error reading file ${filePath}: ${error}`));
  });
}

async function loadData() {
  try {
    // Resolve paths to ensure compatibility across environments
    const studentsPath = path.resolve(__dirname, '../data/students.csv');
    const coursesPath = path.resolve(__dirname, '../data/courses.csv');
    const enrollmentsPath = path.resolve(__dirname, '../data/enrollments.csv');
    const careersPath = path.resolve(__dirname, '../data/careers.csv');

    // Load CSV data
    const students = await loadCSV(studentsPath);
    const courses = await loadCSV(coursesPath);
    const enrollments = await loadCSV(enrollmentsPath);
    const careers = await loadCSV(careersPath);

    // Log stats for debugging
    console.log('Loaded Students:', students.length);
    console.log('Loaded Courses:', courses.length);
    console.log('Loaded Enrollments:', enrollments.length);
    console.log('Loaded Careers:', careers.length);

    // Return all loaded data as an object
    return { students, courses, enrollments, careers };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error; // Re-throw error to be handled by the caller
  }
}

module.exports = { loadData };
