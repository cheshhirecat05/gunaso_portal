export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 6, marginTop: 20, flexWrap: 'wrap'
        }}>
            <button
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: 13 }}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ← Prev
            </button>

            {start > 1 && (
                <>
                    <button className="btn-outline" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => onPageChange(1)}>1</button>
                    {start > 2 && <span style={{ color: 'var(--text-light)' }}>…</span>}
                </>
            )}

            {pages.map(p => (
                <button
                    key={p}
                    className={p === page ? 'btn-primary' : 'btn-outline'}
                    style={{ padding: '4px 10px', fontSize: 13, minWidth: 34 }}
                    onClick={() => onPageChange(p)}
                >
                    {p}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span style={{ color: 'var(--text-light)' }}>…</span>}
                    <button className="btn-outline" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}

            <button
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: 13 }}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next →
            </button>
        </div>
    );
}
