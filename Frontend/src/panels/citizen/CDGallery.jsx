import { useState } from "react";
import Badge from "../../components/Badge";

export default function CDGallery({ user, grievances }) {
  const [preview, setPreview] = useState(null);

  if (!user) return null;

  const myGrievances = (grievances || [])
    .filter(g => g.userId === user.id)
    .reverse();

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
          {myGrievances.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                No gallery items found.
              </td>
            </tr>
          ) : (
            myGrievances.map(g => (
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
                    g.attachment.type === "application/pdf" ? (
                      <a
                        href={g.attachment.data}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline"
                      >
                        View PDF
                      </a>
                    ) : (
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
                    )
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
