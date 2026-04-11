export default function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div
      className="fadeUp"
      style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--surface-2)',
        border: '1px solid var(--success)',
        borderRadius: '10px',
        padding: '12px 22px',
        color: 'var(--success)',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: 300,
        whiteSpace: 'nowrap',
      }}
    >
      ✓ {msg}
    </div>
  );
}