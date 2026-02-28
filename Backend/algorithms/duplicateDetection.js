/**
 * ═══════════════════════════════════════════════════════════════
 * Algorithm 2: Duplicate Detection (TF-IDF Cosine Similarity)
 * ═══════════════════════════════════════════════════════════════
 *
 * Detects similar/duplicate grievances when a new one is submitted.
 * Uses Term Frequency–Inverse Document Frequency (TF-IDF) to
 * vectorize text, then computes Cosine Similarity between the
 * new grievance and existing ones.
 *
 * Steps:
 *   1. Tokenize & normalize all documents (subject + description)
 *   2. Build IDF (Inverse Document Frequency) from the corpus
 *   3. Compute TF-IDF vectors for each document
 *   4. Calculate cosine similarity between new doc and each existing doc
 *   5. Return matches above the similarity threshold
 *
 * Time Complexity:  O(n × m)  where n = existing docs, m = unique terms
 * Space Complexity: O(n × m)  for TF-IDF matrix
 *
 * Similarity Threshold: 0.40 (configurable)
 */

const SIMILARITY_THRESHOLD = 0.40;

// Common English stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up', 'down',
  'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him',
  'his', 'she', 'her', 'they', 'them', 'their', 'this', 'that', 'these',
  'those', 'am', 'what', 'which', 'who', 'whom',
]);

/**
 * Tokenize text: lowercase, remove punctuation, filter stop words,
 * keep words with 2+ characters.
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/**
 * Compute Term Frequency for a single document.
 * TF(t, d) = count(t in d) / |d|
 * Returns a Map<string, number>.
 */
function computeTF(tokens) {
  const freq = new Map();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  const len = tokens.length || 1;
  for (const [term, count] of freq) {
    freq.set(term, count / len);
  }
  return freq;
}

/**
 * Compute Inverse Document Frequency from multiple documents.
 * IDF(t) = ln(N / (1 + df(t)))   where df = docs containing term t
 * Returns a Map<string, number>.
 */
function computeIDF(documents) {
  const N = documents.length;
  const docFreq = new Map();

  for (const tokens of documents) {
    const seen = new Set(tokens);
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) || 0) + 1);
    }
  }

  const idf = new Map();
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log(N / (1 + df)));
  }

  return idf;
}

/**
 * Compute TF-IDF vector for a document given pre-computed IDF.
 * Returns a Map<string, number>.
 */
function computeTFIDF(tf, idf) {
  const tfidf = new Map();
  for (const [term, tfVal] of tf) {
    const idfVal = idf.get(term) || 0;
    tfidf.set(term, tfVal * idfVal);
  }
  return tfidf;
}

/**
 * Cosine Similarity between two TF-IDF vectors.
 *
 *             Σ (A_i × B_i)
 * cos(θ) = ─────────────────────
 *           ‖A‖ × ‖B‖
 *
 * Returns a value between 0 (no similarity) and 1 (identical).
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Iterate the smaller vector for efficiency
  for (const [term, valA] of vecA) {
    normA += valA * valA;
    const valB = vecB.get(term);
    if (valB) dotProduct += valA * valB;
  }

  for (const [, valB] of vecB) {
    normB += valB * valB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Find grievances similar to a new submission.
 *
 * @param {Object} newGrievance - { subject, desc, category, location }
 * @param {Array}  existingGrievances - Array of grievance documents
 * @param {number} threshold - Similarity threshold (default: 0.40)
 * @returns {Array} Array of { grievance, similarity } sorted by similarity desc
 */
function findSimilarGrievances(newGrievance, existingGrievances, threshold = SIMILARITY_THRESHOLD) {
  if (!existingGrievances || existingGrievances.length === 0) return [];

  // Build corpus: new doc + existing docs
  const newText = `${newGrievance.subject || ''} ${newGrievance.desc || ''} ${newGrievance.location || ''}`;
  const newTokens = tokenize(newText);

  const existingTokens = existingGrievances.map((g) => {
    const gObj = g.toObject ? g.toObject() : g;
    return tokenize(`${gObj.subject || ''} ${gObj.desc || ''} ${gObj.location || ''}`);
  });

  // All token lists (new doc first)
  const allTokenLists = [newTokens, ...existingTokens];

  // Compute IDF across the entire corpus
  const idf = computeIDF(allTokenLists);

  // Compute TF-IDF for the new document
  const newTF = computeTF(newTokens);
  const newTFIDF = computeTFIDF(newTF, idf);

  // Compare with each existing document
  const matches = [];

  for (let i = 0; i < existingGrievances.length; i++) {
    // Also filter by same category for relevance
    const gObj = existingGrievances[i].toObject
      ? existingGrievances[i].toObject()
      : existingGrievances[i];

    const existTF = computeTF(existingTokens[i]);
    const existTFIDF = computeTFIDF(existTF, idf);

    const similarity = cosineSimilarity(newTFIDF, existTFIDF);

    if (similarity >= threshold) {
      matches.push({
        ticketNo: gObj.ticketNo,
        subject: gObj.subject,
        category: gObj.category,
        status: gObj.status,
        similarity: Math.round(similarity * 100),
      });
    }
  }

  // Sort by similarity descending, return top 5
  return matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

module.exports = {
  findSimilarGrievances,
  cosineSimilarity,
  tokenize,
  computeTF,
  computeIDF,
  SIMILARITY_THRESHOLD,
};
