import { useState, useEffect } from "react";
import * as api from "../../utils/api";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";

export default function ADGrievances() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGrievances = async () => {
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== "All Status") params.status = statusFilter;
      if (categoryFilter !== "All Categories") params.category = categoryFilter;
      const data = await api.getAllGrievances(params);
      setRows(data.grievances || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch grievances:', err);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [search, statusFilter, categoryFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const updateStatus = async (ticketNo, newStatus) => {
    try {
      await api.updateGrievanceStatus(ticketNo, newStatus);
      setRows(prevRows =>
        prevRows.map(g =>
          g.ticketNo === ticketNo
            ? { ...g, status: newStatus, resolvedAt: newStatus === "Resolved" ? new Date().toISOString() : g.resolvedAt }
            : g
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const categoryOptions = ["All Categories", "Healthcare", "Education", "Infrastructure", "Environment", "Other"];

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="Search by ticket, name, subject..."
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

      {/* Table */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">All Grievances</div>
          <div>{total} total</div>
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
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                  No grievances found.
                </td>
              </tr>
            ) : (
              rows.map(g => (
                <tr key={g.ticketNo}>
                  <td>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{g.ticketNo}</span>
                  </td>
                  <td>{g.userName || "Unknown"}</td>
                  <td>{g.subject || "-"}</td>
                  <td>{g.category || "-"}</td>
                  <td>
                    <Badge status={g.priority || "Normal"} />
                  </td>
                  <td>
                    <Badge status={g.status || "Pending"} />
                  </td>
                  <td>
                    <select
                      value={g.status || "Pending"}
                      onChange={e => updateStatus(g.ticketNo, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>In Review</option>
                      <option>Resolved</option>
                      <option>Urgent</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}