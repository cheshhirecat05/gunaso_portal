import { getUsers, getGrievances } from "../../utils/storage";

export default function ADReports() {
  const users = getUsers() || [];
  const grievances = getGrievances() || [];

  // -------------------------
  // 1️⃣ Monthly Registration Count
  // -------------------------
  const monthMap = {};

  users.forEach(user => {
    if (!user.registeredAt) return;

    const date = new Date(user.registeredAt);
    const month = date.toLocaleString("default", { month: "short" });

    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  const months = Object.keys(monthMap).map(m => ({
    m,
    count: monthMap[m]
  }));

  const maxValue = Math.max(...months.map(x => x.count), 1);

  // -------------------------
  // 2️⃣ Resolution Rate
  // -------------------------
  const total = grievances.length;
  const resolved = grievances.filter(
    g => g.status === "Resolved"
  ).length;

  const resolutionRate =
    total === 0
      ? 0
      : ((resolved / total) * 100).toFixed(1);

  // -------------------------
  // 3️⃣ Average Resolution Time
  // -------------------------
  const resolvedGrievances = grievances.filter(
    g => g.status === "Resolved" &&
         g.createdAt &&
         g.resolvedAt
  );

  let avgDays = 0;

  if (resolvedGrievances.length > 0) {
    const totalDays = resolvedGrievances.reduce(
      (sum, g) => {
        const created = new Date(g.createdAt);
        const resolvedDate = new Date(g.resolvedAt);
        const diff =
          (resolvedDate - created) /
          (1000 * 60 * 60 * 24);

        return sum + diff;
      },
      0
    );

    avgDays = (
      totalDays / resolvedGrievances.length
    ).toFixed(1);
  }

  return (
    <div>
      {/* Top Stats */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="mini-card">
          <div className="mini-card-title">
            Resolution Rate
          </div>
          <div className="mini-card-val">
            {resolutionRate}%
          </div>
        </div>

        <div className="mini-card">
          <div className="mini-card-title">
            Average Resolution Time
          </div>
          <div className="mini-card-val">
            {avgDays} days
          </div>
        </div>
      </div>

      {/* Monthly Registration Chart */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 28,
          border: "1px solid rgba(0,0,0,0.06)"
        }}
      >
        <div
          style={{
            fontSize: 20,
            marginBottom: 20
          }}
        >
          Monthly Citizen Registration Trend
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            height: 160,
            paddingBottom: 20,
            borderBottom: "2px solid #eee"
          }}
        >
          {months.length === 0 ? (
            <div>No registration data yet.</div>
          ) : (
            months.map(({ m, count }) => {
              const height =
                (count / maxValue) * 140;

              return (
                <div
                  key={m}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      background:
                        "linear-gradient(to top,#c1121f,#fca311)",
                      borderRadius:
                        "4px 4px 0 0",
                      height
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "#777"
                    }}
                  >
                    {m}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}