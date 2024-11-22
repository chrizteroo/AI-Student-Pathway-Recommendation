// utils/helpers.js

function cosineSimilarity(vecA, vecB) {
  // Ensure both vectors are of the same length
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length');
  }

  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Handle division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Calculate cosine similarity
  return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = { cosineSimilarity };
