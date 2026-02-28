/**
 * ═══════════════════════════════════════════════════════════════
 * Algorithm 3: Trending Issues Detection (Sliding Window + Z-Score)
 * ═══════════════════════════════════════════════════════════════
 *
 * Detects categories and locations experiencing unusual spikes
 * in grievance submissions by comparing recent frequency against
 * historical averages using statistical z-scores.
 *
 * Steps:
 *   1. Define a recent window (last 7 days) and historical window (last 90 days)
 *   2. Count grievances per category/location in each window
 *   3. Compute the historical daily average (μ) and standard deviation (σ)
 *   4. Compute z-score for recent window:
 *
 *              (recent_daily_avg − μ)
 *      z  =  ────────────────────────
 *                     σ
 *
 *   5. Flag items with z > 1.5 as "trending" (configurable)
 *   6. Classify spike intensity: Moderate (z ≥ 1.5), High (z ≥ 2.5), Critical (z ≥ 3.5)
 *
 * Time Complexity:  O(n)  where n = total grievances
 * Space Complexity: O(k)  where k = unique categories + locations
 */

const RECENT_WINDOW_DAYS = 7;
const HISTORICAL_WINDOW_DAYS = 90;
const Z_THRESHOLD = 1.5;

/**
 * Classify spike intensity based on z-score.
 */
function classifySpike(zScore) {
  if (zScore >= 3.5) return 'Critical';
  if (zScore >= 2.5) return 'High';
  if (zScore >= 1.5) return 'Moderate';
  return 'Normal';
}

/**
 * Count occurrences per key in a grievance array using a field extractor.
 * Returns a Map<string, number>.
 */
function countByField(grievances, fieldGetter) {
  const counts = new Map();
  for (const g of grievances) {
    const key = fieldGetter(g);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

/**
 * Compute mean and standard deviation for daily frequency.
 *
 * Given total count over a number of days, the daily average = count / days.
 * For standard deviation, we use a simplified approach:
 * group grievances by actual day, compute per-day counts, then σ from those.
 */
function computeDailyStats(grievances, fieldGetter, key, totalDays) {
  // Build per-day counts for this key
  const dayCounts = new Map();

  for (const g of grievances) {
    if (fieldGetter(g) !== key) continue;
    const dayKey = new Date(g.date).toISOString().slice(0, 10);
    dayCounts.set(dayKey, (dayCounts.get(dayKey) || 0) + 1);
  }

  // Fill missing days with 0
  const counts = [];
  const now = new Date();
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    counts.push(dayCounts.get(dayKey) || 0);
  }

  // Compute mean
  const mean = counts.reduce((s, c) => s + c, 0) / counts.length;

  // Compute standard deviation
  const variance = counts.reduce((s, c) => s + (c - mean) ** 2, 0) / counts.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * Detect trending issues from grievances.
 *
 * @param {Array} allGrievances - All grievance documents
 * @returns {Object} { trendingCategories: [...], trendingLocations: [...] }
 *
 * Each trending item contains:
 *   { name, recentCount, dailyAvgRecent, historicalDailyAvg, zScore, intensity }
 */
function detectTrending(allGrievances) {
  const now = new Date();
  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - RECENT_WINDOW_DAYS);
  const historicalCutoff = new Date(now);
  historicalCutoff.setDate(historicalCutoff.getDate() - HISTORICAL_WINDOW_DAYS);

  // Split into recent and historical
  const recentGrievances = allGrievances.filter(
    (g) => new Date(g.date) >= recentCutoff
  );
  const historicalGrievances = allGrievances.filter(
    (g) => new Date(g.date) >= historicalCutoff
  );

  const categoryGetter = (g) => g.category;
  const locationGetter = (g) => {
    // Normalize location: lowercase, trim
    const loc = (g.location || '').trim().toLowerCase();
    return loc || null;
  };

  const trendingCategories = detectTrendingByField(
    recentGrievances, historicalGrievances, categoryGetter
  );

  const trendingLocations = detectTrendingByField(
    recentGrievances, historicalGrievances, locationGetter
  );

  return {
    trendingCategories,
    trendingLocations,
    analysisWindow: {
      recentDays: RECENT_WINDOW_DAYS,
      historicalDays: HISTORICAL_WINDOW_DAYS,
      totalAnalyzed: allGrievances.length,
      recentCount: recentGrievances.length,
    },
  };
}

/**
 * Detect trending items for a specific field (category or location).
 */
function detectTrendingByField(recentGrievances, historicalGrievances, fieldGetter) {
  const recentCounts = countByField(recentGrievances, fieldGetter);
  const trending = [];

  for (const [key, recentCount] of recentCounts) {
    const dailyAvgRecent = recentCount / RECENT_WINDOW_DAYS;

    // Compute historical daily stats
    const { mean: historicalDailyAvg, stdDev } = computeDailyStats(
      historicalGrievances, fieldGetter, key, HISTORICAL_WINDOW_DAYS
    );

    // Compute z-score (handle zero stdDev)
    let zScore = 0;
    if (stdDev > 0) {
      zScore = (dailyAvgRecent - historicalDailyAvg) / stdDev;
    } else if (dailyAvgRecent > historicalDailyAvg) {
      // If no variance but recent is higher, assign a high z-score
      zScore = dailyAvgRecent > 0 ? 3.0 : 0;
    }

    if (zScore >= Z_THRESHOLD) {
      trending.push({
        name: key,
        recentCount,
        dailyAvgRecent: Math.round(dailyAvgRecent * 100) / 100,
        historicalDailyAvg: Math.round(historicalDailyAvg * 100) / 100,
        zScore: Math.round(zScore * 100) / 100,
        intensity: classifySpike(zScore),
      });
    }
  }

  // Sort by z-score descending
  return trending.sort((a, b) => b.zScore - a.zScore);
}

module.exports = {
  detectTrending,
  classifySpike,
  Z_THRESHOLD,
  RECENT_WINDOW_DAYS,
  HISTORICAL_WINDOW_DAYS,
};
