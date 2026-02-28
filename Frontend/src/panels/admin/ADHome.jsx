import { getUsers, getGrievances } from "../../utils/storage";
import Badge from "../../components/Badge";

export default function ADHome() {
  const users = getUsers() || [];
  const grievances = getGrievances() || [];

  const total = grievances.length;
  const pending = grievances.filter(g => g.status === "Pending").length;
  const resolved = grievances.filter(g => g.status === "Resolved").length;

  const recentGrievances = [...grievances].slice(-5).reverse();

  // Dynamic Category Calculation
  const categoryMap = {};
  grievances.forEach(g => {
    categoryMap[g.category] = (categoryMap[g.category] || 0) + 1;
  });
  const categories = Object.keys(categoryMap).map(cat => ({
    name: cat,
    pct: total === 0 ? 0 : Math.round((categoryMap[cat] / total) * 100)
  }));

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-cards">
        {[
          ['📋', total, 'Total Grievances', 'red'],
          ['⏳', pending, 'Pending', 'gold'],
          ['✅', resolved, 'Resolved', 'green'],
          ['👥', users.length, 'Registered Citizens', 'blue']
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
                recentGrievances.map(g => {
                  // Get user name from userId
                  const citizen = users.find(u => u.id === g.userId);
                  const name = citizen ? citizen.name : "Unknown";

                  // Use the actual ticket number from CDHome
                  const ticket = g.ticketNo || "No Ticket";

                  return (
                    <tr key={g.ticketNo || g.id}>
                      <td><span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{ticket}</span></td>
                      <td>{name}</td>
                      <td>{g.category || "-"}</td>
                      <td><Badge status={g.status || "Pending"} /></td>
                    </tr>
                  );
                })
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
    </div>
  );
}