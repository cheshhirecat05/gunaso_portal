import { useState, useEffect } from "react";
import * as api from "../../utils/api";
import Badge from "../../components/Badge";

export default function ADHome() {
  const [stats, setStats] = useState(null);
  const [ranked, setRanked] = useState([]);

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err));
    api.getRankedGrievances()
      .then(setRanked)
      .catch(err => console.error('Failed to load ranked:', err));
  }, []);

  if (!stats) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Loading...</div>;

  const { totalGrievances: total, pending, resolved, totalUsers, categories, recentGrievances, trending } = stats;

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-cards">
        {[
          ['📋', total, 'Total Grievances', 'red'],
          ['⏳', pending, 'Pending', 'gold'],
          ['✅', resolved, 'Resolved', 'green'],
          ['👥', totalUsers, 'Registered Citizens', 'blue']
        ].map(([icon, num, label, accent]) => (
          <div className="stat-card" key={label}>
            <div className={`stat-card-accent accent-${accent}`}></div>
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-num">{num}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Grievances */}
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Recent Grievances</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Citizen</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentGrievances.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>
                    No grievances yet.
                  </td>
                </tr>
              ) : (
                recentGrievances.map(g => (
                  <tr key={g.ticketNo}>
                    <td><span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{g.ticketNo}</span></td>
                    <td>{g.citizenName || g.userName || 'Unknown'}</td>
                    <td>{g.category || "-"}</td>
                    <td><Badge status={g.status || "Pending"} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Issues by Category */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 18, marginBottom: 20 }}>
            Issues by Category
          </div>

          {categories.map(c => (
            <div className="cat-bar" key={c.name}>
              <div className="cat-bar-top">
                <span>{c.name}</span>
                <span>{c.pct}%</span>
              </div>
              <div className="cat-bar-fill">
                <div
                  className="cat-bar-inner"
                  style={{ width: `${c.pct}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm 3: Trending Issues */}
      {trending && (trending.trendingCategories?.length > 0 || trending.trendingLocations?.length > 0) && (
        <div style={{
          background: 'white', borderRadius: 16, padding: 24,
          marginTop: 20, border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            📈 Trending Issues
            <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 400 }}>
              (Sliding Window Z-Score Analysis — last {trending.analysisWindow?.recentDays} days vs {trending.analysisWindow?.historicalDays}-day baseline)
            </span>
          </div>

          {trending.trendingCategories?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Trending Categories</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {trending.trendingCategories.map(t => (
                  <div key={t.name} style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 13,
                    background: t.intensity === 'Critical' ? '#ffebee' : t.intensity === 'High' ? '#fff3e0' : '#e8f5e9',
                    border: `1px solid ${t.intensity === 'Critical' ? '#ef9a9a' : t.intensity === 'High' ? '#ffcc80' : '#a5d6a7'}`
                  }}>
                    <strong>{t.name}</strong>
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#666' }}>
                      z={t.zScore} · {t.recentCount} recent · {t.intensity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trending.trendingLocations?.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Trending Locations</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {trending.trendingLocations.map(t => (
                  <div key={t.name} style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 13,
                    background: t.intensity === 'Critical' ? '#ffebee' : t.intensity === 'High' ? '#fff3e0' : '#e8f5e9',
                    border: `1px solid ${t.intensity === 'Critical' ? '#ef9a9a' : t.intensity === 'High' ? '#ffcc80' : '#a5d6a7'}`
                  }}>
                    <strong>{t.name}</strong>
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#666' }}>
                      z={t.zScore} · {t.recentCount} recent · {t.intensity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Algorithm 1: Priority-Ranked Grievances */}
      {ranked.length > 0 && (
        <div className="table-card" style={{ marginTop: 20 }}>
          <div className="table-header">
            <div className="table-title">
              🎯 Priority-Ranked Grievances
              <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 400, marginLeft: 8 }}>
                (Weighted Multi-Factor Scoring Algorithm)
              </span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Score</th>
                <th>Ticket</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Factors</th>
              </tr>
            </thead>
            <tbody>
              {ranked.slice(0, 10).map(g => (
                <tr key={g.ticketNo}>
                  <td>
                    <span style={{
                      display: 'inline-block', width: 36, height: 36, lineHeight: '36px',
                      textAlign: 'center', borderRadius: '50%', fontWeight: 700, fontSize: 13,
                      background: g.priorityScore >= 70 ? '#c62828' : g.priorityScore >= 45 ? '#ef6c00' : '#2e7d32',
                      color: 'white'
                    }}>
                      {g.priorityScore}
                    </span>
                  </td>
                  <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{g.ticketNo}</span></td>
                  <td>{g.subject}</td>
                  <td>{g.category}</td>
                  <td><Badge status={g.priority || 'Normal'} /></td>
                  <td><Badge status={g.status || 'Pending'} /></td>
                  <td style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    K:{g.priorityFactors?.keyword} C:{g.priorityFactors?.category} A:{g.priorityFactors?.age} P:{g.priorityFactors?.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}