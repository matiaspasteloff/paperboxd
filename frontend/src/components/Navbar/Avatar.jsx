const COLORS = ['#388bfd', '#cc88ff', '#55cc88', '#ff8855', '#ffcc44', '#ff5577', '#44cccc'];

export default function Avatar({ name, color, size = 36 }) {
  const bg = color || COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.42}px`,
        fontWeight: '700',
        color: '#fff',
        fontFamily: "'Syne',sans-serif",
        flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.1)',
      }}
    >
      {name[0].toUpperCase()}
    </div>
  );
}