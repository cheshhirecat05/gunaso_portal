/**
 * ═══════════════════════════════════════════════════════════════
 * Algorithm 1: Priority Auto-Scoring (Weighted Multi-Factor)
 * ═══════════════════════════════════════════════════════════════
 *
 * Computes a dynamic priority score (0–100) for each grievance
 * using a weighted combination of four factors:
 *
 *   Score = (K × 0.30) + (C × 0.20) + (A × 0.30) + (P × 0.20)
 *
 * Where:
 *   K = Keyword urgency score    (0–100)
 *   C = Category weight score    (0–100)
 *   A = Age score (days pending) (0–100)
 *   P = Citizen-set priority     (0–100)
 *
 * Time Complexity:  O(n × m)  where n = grievances, m = avg words per desc
 * Space Complexity: O(n)
 */

// Urgency keywords mapped to scores (higher = more urgent)
const URGENCY_KEYWORDS = {
  // Critical
  'emergency': 100, 'danger': 100, 'life-threatening': 100, 'death': 100, 'collapse': 95,
  'flood': 95, 'fire': 95, 'accident': 90, 'hazard': 90, 'toxic': 90,
  // High
  'urgent': 80, 'critical': 80, 'severe': 75, 'broken': 70, 'blocked': 70,
  'overflow': 70, 'contaminated': 75, 'disease': 80, 'epidemic': 85,
  // Medium
  'damaged': 50, 'leaking': 50, 'delay': 40, 'complaint': 35, 'poor': 40,
  'missing': 45, 'shortage': 45, 'dirty': 35, 'noise': 30,
  // Low
  'request': 15, 'suggestion': 10, 'feedback': 10, 'inquiry': 10,
};

// Category importance weights
const CATEGORY_WEIGHTS = {
  'Healthcare': 90,
  'Infrastructure': 75,
  'Environment': 70,
  'Education': 60,
  'Other': 40,
};

// Citizen-set priority mapping
const PRIORITY_WEIGHTS = {
  'Urgent': 100,
  'High': 70,
  'Normal': 30,
};

/**
 * Compute keyword urgency score from subject + description text.
 * Scans for known urgency keywords and returns the max found.
 * Falls back to 20 if no keywords match.
 */
function keywordScore(text) {
  if (!text) return 20;
  const words = text.toLowerCase().split(/\W+/);
  let maxScore = 0;

  for (const word of words) {
    if (URGENCY_KEYWORDS[word] && URGENCY_KEYWORDS[word] > maxScore) {
      maxScore = URGENCY_KEYWORDS[word];
    }
  }

  return maxScore || 20; // baseline score of 20
}

/**
 * Compute age score — older pending grievances get higher scores.
 * Uses logarithmic scaling to avoid runaway scores.
 * Caps at 100 (reached at ~90 days).
 */
function ageScore(dateCreated) {
  const now = new Date();
  const created = new Date(dateCreated);
  const daysPending = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));

  // Logarithmic scaling: score = 22 × ln(days + 1), capped at 100
  return Math.min(100, Math.round(22 * Math.log(daysPending + 1)));
}

/**
 * Compute the overall priority score for a single grievance.
 * Returns an object with the final score and individual factor scores.
 */
function computePriorityScore(grievance) {
  const kScore = keywordScore(`${grievance.subject} ${grievance.desc}`);
  const cScore = CATEGORY_WEIGHTS[grievance.category] || 40;
  const aScore = grievance.status === 'Resolved' ? 0 : ageScore(grievance.date);
  const pScore = PRIORITY_WEIGHTS[grievance.priority] || 30;

  const finalScore = Math.round(
    (kScore * 0.30) + (cScore * 0.20) + (aScore * 0.30) + (pScore * 0.20)
  );

  return {
    score: finalScore,
    factors: {
      keyword: kScore,
      category: cScore,
      age: aScore,
      priority: pScore,
    },
  };
}

/**
 * Rank an array of grievances by computed priority score (descending).
 * Attaches `priorityScore` and `priorityFactors` to each grievance object.
 */
function rankGrievances(grievances) {
  return grievances
    .map((g) => {
      const gObj = g.toObject ? g.toObject() : { ...g };
      const { score, factors } = computePriorityScore(gObj);
      gObj.priorityScore = score;
      gObj.priorityFactors = factors;
      return gObj;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

module.exports = {
  computePriorityScore,
  rankGrievances,
  URGENCY_KEYWORDS,
  CATEGORY_WEIGHTS,
};
