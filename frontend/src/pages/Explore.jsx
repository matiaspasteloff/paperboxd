import { useState, useEffect } from 'react';
import { api } from '../api';
import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SUBJECTS = [
  { id: 'science_fiction', label: '🚀 Ciencia Ficción' },
  { id: 'fantasy',         label: '⚔️ Fantasía' },
  { id: 'mystery',         label: '🔍 Misterio' },
  { id: 'romance',         label: '💕 Romance' },
  { id: 'history',         label: '📜 Historia' },
  { id: 'biography',       label: '👤 Biografía' },
  { id: 'horror',          label: '👻 Terror' },
  { id: 'classics',        label: '📖 Clásicos' },
];

export default function Explore({ user, token, onAuthClick, navigate }) {
  const { isMobile, lt } = useBreakpoint();
  const [trending,       setTrending]       = useState([]);
  const [subjects,       setSubjects]       = useState({});
  // ✅ Track which subjects are loaded (for toggle)
  const [loadedSubjects, setLoadedSubjects] = useState(new Set(['science_fiction', 'fantasy']));
  const [loadT,          setLoadT]          = useState(true);
  const [selected,       setSelected]       = useState(null);
  const [toast,          setToast]          = useState('');
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '36px';

  useEffect(() => {
    api.getTrending().then(d => {
      const works = (d.works || []).filter(w => w.cover_id).slice(0, 16).map(w => ({
        key: w.key, title: w.title,
        author_name: w.authors?.map(a => a.name),
        cover_i: w.cover_id,
        first_publish_year: w.first_publish_year,
      }));
      setTrending(works);
    }).catch(() => {}).finally(() => setLoadT(false));

    // Load initial subjects
    ['science_fiction', 'fantasy'].forEach(s => fetchSubject(s));
  }, []);

  const fetchSubject = async (s) => {
    try {
      const d = await api.getSubject(s);
      const works = (d.works || []).filter(w => w.cover_id).slice(0, 8).map(w => ({
        key: `/works/${w.key}`, title: w.title,
        author_name: w.authors?.map(a => a.name) || [],
        cover_i: w.cover_id,
        first_publish_year: w.first_publish_year,
      }));
      setSubjects(prev => ({ ...prev, [s]: works }));
    } catch {}
  };

  // ✅ Fix: toggle subject — if already loaded, remove it
  const toggleSubject = (s) => {
    if (loadedSubjects.has(s)) {
      // Deselect / hide this section
      setLoadedSubjects(prev => { const n = new Set(prev); n.delete(s); return n; });
    } else {
      // Load and show
      setLoadedSubjects(prev => new Set([...prev, s]));
      if (!subjects[s]) fetchSubject(s);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {toast && <div className="fadeUp" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-2)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px 22px', color: 'var(--success)', fontSize: '14px', fontWeight: '600', zIndex: 300 }}>✓ {toast}</div>}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: `${isMobile ? '36px' : '52px'} ${pad} 80px` }}>
        <h1 style={{ fontSize: isMobile ? '26px' : 'clamp(26px,5vw,40px)', marginBottom: '6px' }}>Explorar libros</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Descubrí tendencias y géneros populares</p>

        {/* ✅ Subject chips with clear toggle feedback */}
        <div className="tabs-scroll" style={{ marginBottom: '44px' }}>
          {SUBJECTS.map(s => {
            const active = loadedSubjects.has(s.id);
            return (
              <button key={s.id} onClick={() => toggleSubject(s.id)} style={{
                padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
                background: active ? 'var(--accent)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-dim)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border-2)'}`,
                cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s',
                boxShadow: active ? '0 0 12px var(--accent-glow)' : 'none',
              }}>
                {s.label}
                {active && <span style={{ marginLeft: '6px', opacity: 0.75 }}>×</span>}
              </button>
            );
          })}
        </div>

        {/* Trending */}
        <Section title="📈 Tendencias semanales">
          {loadT ? (
            <div className="book-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ paddingTop: '148%', borderRadius: '10px' }} />)}</div>
          ) : (
            <div className="book-grid">
              {trending.map((book, i) => (
                <div key={book.key || i} className="fadeUp" style={{ animationDelay: `${i * 0.03}s` }}>
                  <BookCard book={book} onNavigate={b => navigate('book', b)} onRate={b => { if (!user) { onAuthClick(); return; } setSelected(b); }} loggedIn={!!user} />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Loaded subjects */}
        {SUBJECTS.filter(s => loadedSubjects.has(s.id) && subjects[s.id]).map(s => (
          <Section key={s.id} title={s.label}>
            <div className="book-grid">
              {subjects[s.id].map((book, i) => (
                <div key={book.key || i} className="fadeUp" style={{ animationDelay: `${i * 0.03}s` }}>
                  <BookCard book={book} onNavigate={b => navigate('book', b)} onRate={b => { if (!user) { onAuthClick(); return; } setSelected(b); }} loggedIn={!!user} />
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>

      {selected && token && <ReviewModal book={selected} token={token} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); showToast('Reseña guardada'); }} />}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <h2 style={{ whiteSpace: 'nowrap' }}>{title}</h2>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>
      {children}
    </div>
  );
}