import { useTheme } from '../../App';

const THEMES = [
  { id: 'parchment', label: 'Parchment',  dot: '#c8943a', dark: true  },
  { id: 'midnight',  label: 'Midnight',   dot: '#4d9fff', dark: true  },
  { id: 'obsidian',  label: 'Obsidian',   dot: '#b8ff00', dark: true  },
  { id: 'crimson',   label: 'Crimson',    dot: '#d44040', dark: true  },
  { id: 'forest',    label: 'Forest',     dot: '#44cc66', dark: true  },
  { id: 'aurora',    label: 'Aurora',     dot: '#9955ff', dark: true  },
  { id: 'paper',     label: 'Paper',      dot: '#8b4a18', dark: false },
  { id: 'slate',     label: 'Slate',      dot: '#2266cc', dark: false },
];

export default function ThemeDropdown({ onClose }) {
  const { theme, setTheme } = useTheme();
  const dark  = THEMES.filter(t => t.dark);
  const light = THEMES.filter(t => !t.dark);

  return (
    <div
      className="scaleIn"
      style={{
        position: 'fixed',
        top: '66px',
        right: '16px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-2)',
        borderRadius: '14px',
        padding: '10px',
        minWidth: '200px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
        zIndex: 300,
      }}
    >
      <p style={{
        fontSize: '10px', fontWeight: '700', letterSpacing: '1.4px',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        padding: '4px 8px 8px', fontFamily: "'Lato', sans-serif",
      }}>
        Oscuros
      </p>
      {dark.map(t => (
        <ThemeBtn key={t.id} t={t} active={theme === t.id} onClick={() => { setTheme(t.id); onClose(); }} />
      ))}
      <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
      <p style={{
        fontSize: '10px', fontWeight: '700', letterSpacing: '1.4px',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        padding: '4px 8px 8px', fontFamily: "'Lato', sans-serif",
      }}>
        Claros
      </p>
      {light.map(t => (
        <ThemeBtn key={t.id} t={t} active={theme === t.id} onClick={() => { setTheme(t.id); onClose(); }} />
      ))}
    </div>
  );
}

function ThemeBtn({ t, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '8px 10px',
        background: active ? 'var(--accent-sub)' : 'transparent',
        border: active ? '1px solid var(--border-2)' : '1px solid transparent',
        borderRadius: '8px',
        color: active ? 'var(--accent-2)' : 'var(--text-dim)',
        fontSize: '13px',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: "'Lato', sans-serif",
        fontWeight: active ? '700' : '400',
        marginBottom: '2px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.15s',
      }}
    >
      <span style={{
        width: '12px', height: '12px', borderRadius: '50%',
        background: t.dot, flexShrink: 0,
        boxShadow: active ? `0 0 6px ${t.dot}` : 'none',
        border: '1px solid rgba(255,255,255,0.15)',
      }} />
      {t.label}
      {active && (
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--accent)' }}>
          &#10003;
        </span>
      )}
    </button>
  );
}