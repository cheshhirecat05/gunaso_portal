export default function Alert({ type, message }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} dangerouslySetInnerHTML={{ __html: message }} />
  );
}