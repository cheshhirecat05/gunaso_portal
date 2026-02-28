import { useState } from "react";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";

const PER_PAGE = 8;

export default function CDGallery({ user, grievances }) {
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);

  if (!user) return null;

  const myGrievances = (grievances || []).slice();
  const totalPages = Math.ceil(myGrievances.length / PER_PAGE);
  const paged = myGrievances.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="table-card">

      <div className="table-header">
        <div className="table-title">
          My Complain Gallery
        </div>

        <div>
          {myGrievances.length} total
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Subject</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Date</th>
            <th>Attachment</th>
          </tr>
        </thead>

        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                No gallery items found.
              </td>
            </tr>
          ) : (
            paged.map(g => (
              <tr key={g.ticketNo}>
                <td>{g.ticketNo}</td>
                <td>{g.subject}</td>
                <td>{g.category}</td>

                <td>
                  <Badge status={g.priority} />
                </td>

                <td>
                  {new Date(g.date).toLocaleDateString()}
                </td>

                <td>
                  {g.attachment ? (
                    <img
                      src={g.attachment.data}
                      alt=""
                      width={50}
                      style={{
                        cursor: "pointer",
                        borderRadius: 6
                      }}
                      onClick={() =>
                        setPreview(g.attachment.data)
                      }
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
            zIndex: 999
          }}
        >
          <img
            src={preview}
            style={{
              maxWidth: "80%",
              maxHeight: "80%"
            }}
          />
        </div>
      )}
    </div>
  );
}
