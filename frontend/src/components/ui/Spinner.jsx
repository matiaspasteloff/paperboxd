export default function Spinner({ size = 18 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        border: '2px solid var(--border-2)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }}
    />
  );
}