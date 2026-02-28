import { useState, useEffect } from "react";
import * as api from "../../utils/api";

export default function ADReports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getReportsData()
      .then(setData)
      .catch(err => console.error('Failed to load reports:', err));
  }, []);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Loading...</div>;

  const { months, resolutionRate, avgDays } = data;
  const maxValue = Math.max(...months.map(x => x.count), 1);

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