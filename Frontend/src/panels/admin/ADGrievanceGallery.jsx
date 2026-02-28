import { useState, useEffect } from "react";
import * as api from "../../utils/api";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";

export default function ADGrievanceGallery() {

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (statusFilter !== "All Status") params.status = statusFilter;
    if (categoryFilter !== "All Categories") params.category = categoryFilter;
    api.getAllGrievances(params)
      .then(data => {
        setRows(data.grievances || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch(err => console.error('Failed to load grievances:', err));
  }, [search, statusFilter, categoryFilter, page]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter]);

  const categoryOptions = ["All Categories", "Healthcare", "Education", "Infrastructure", "Environment", "Other"];

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
              <th>Image</th>
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

                  <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {g.ticketNo}
                  </td>

                  <td>{g.userName || "Unknown"}</td>
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
                      <img
                        src={g.attachment.data}
                        width={50}
                        style={{ borderRadius: 6, cursor: "pointer" }}
                        alt=""
                        onClick={() => setPreview(g.attachment.data)}
                      />
                    ) : "-"}
                  </td>

                </tr>
              ))

            )}

          </tbody>

        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            cursor: "pointer"
          }}
        >
          <img
            src={preview}
            style={{ maxWidth: "80%", maxHeight: "80%", borderRadius: 8 }}
            alt=""
          />
        </div>
      )}
    </div>
  );
}
