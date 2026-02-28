import { useState, useEffect } from "react";
import { getGrievances, saveGrievances, getUsers } from "../../utils/storage";
import Badge from "../../components/Badge";

export default function ADGrievances() {

  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  useEffect(() => {
    setRows(getGrievances() || []);
    setUsers(getUsers() || []);
  }, []);

  const updateStatus = (ticketNo, newStatus) => {

    const updated = rows.map(g =>
      g.ticketNo === ticketNo
        ? {
            ...g,
            status: newStatus,
            resolvedAt:
              newStatus === "Resolved"
                ? new Date().toISOString()
                : g.resolvedAt
          }
        : g
    );

    saveGrievances(updated);
    setRows(updated);
  };

  const filteredRows = rows.filter(g => {

    const citizen = users.find(u => u.id === g.userId);
    const name = citizen ? citizen.name : "";

    const matchesSearch =
      g.ticketNo?.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      g.subject?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || g.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All Categories" ||
      g.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categoryOptions = [
    "All Categories",
    ...new Set(rows.map(g => g.category).filter(Boolean))
  ];

  return (
    <div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>

        <input
          className="form-input"
          placeholder="Search ticket, citizen, subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 340 }}
        />

        <select
          className="form-input"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ maxWidth: 160 }}
        >
          <option>All Status</option>
          <option>Pending</option>
          <option>In Review</option>
          <option>Resolved</option>
          <option>Urgent</option>
        </select>

        <select
          className="form-input"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ maxWidth: 160 }}
        >
          {categoryOptions.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

      </div>

      <div className="table-card">

        <div className="table-header">
          <div className="table-title">All Grievances</div>
          <div>{filteredRows.length} total</div>
        </div>

        <table>

          <thead>
            <tr>
              <th>Ticket</th>
              <th>Citizen</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Image</th>
            </tr>
          </thead>

          <tbody>

            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                  No grievances found.
                </td>
              </tr>
            ) : (

              filteredRows.map(g => {

                const citizen = users.find(u => u.id === g.userId);
                const name = citizen ? citizen.name : "Unknown";

                return (
                  <tr key={g.ticketNo}>

                    <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {g.ticketNo}
                    </td>

                    <td>{name}</td>
                    <td>{g.subject}</td>
                    <td>{g.category}</td>

                    <td>
                      <Badge status={g.priority || "Normal"} />
                    </td>

                    <td>
                      <Badge status={g.status || "Pending"} />
                    </td>

                    <td>
                      {g.attachment ? (
                        g.attachment.type === "application/pdf" ? (
                          <a
                            href={g.attachment.data}
                            target="_blank"
                            className="btn-outline"
                          >
                            PDF
                          </a>
                        ) : (
                          <img
                            src={g.attachment.data}
                            width={50}
                            style={{ borderRadius: 6 }}
                            alt=""
                          />
                        )
                      ) : "-"}
                    </td>

                  </tr>
                );
              })

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
