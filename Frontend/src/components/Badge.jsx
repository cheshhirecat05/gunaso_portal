const classMap = {
  Pending: 'badge-pending',
  'In Review': 'badge-review',
  Resolved: 'badge-resolved',
  Urgent: 'badge-urgent',
  Active: 'badge-resolved',
  High: 'badge-urgent',
  Normal: 'badge-review',
};

export default function Badge({ status }) {
  return <span className={`badge ${classMap[status] || 'badge-pending'}`}>{status}</span>;
}