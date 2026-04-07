import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';
import ProgressModal from '../components/ProgressModal';
import { useBreakpoint } from '../hooks/useBreakpoint';

const MOOD_FILTERS = [
  { id: 'oscuro',      label: '🌑 Oscuro',       query: 'dark literature' },
  { id: 'emotivo',     label: '💧 Emotivo',       query: 'emotional fiction' },
  { id: 'relajante',   label: '🌿 Relajante',     query: 'cozy slice of life' },
  { id: 'épico',       label: '⚔️ Épico',         query: 'epic fantasy adventure' },
  { id: 'misterioso',  label: '🔍 Misterioso',    query: 'mystery thriller' },
  { id: 'filosófico',  label: '🧠 Filosófico',    query: 'philosophy essays' },
  { id: 'romántico',   label: '💕 Romántico',     query: 'romance love story' },
  { id: 'humorístico', label: '😄 Humor',         query: 'humor comedy fiction' },
];

export default function Home({ user, token, onAuthClick, navigate }) {
  const { isMobile, lt } = useBreakpoint();
  const [query,     setQuery]    = useState('');
  const [results,   setResults]  = useState([]);
  const [loading,   setLoading]  = useState(false);
  const [searched,  setSearched] = useState(false);
  const [featured,  setFeatured] = useState([]);
  const [featLoad,  setFeatLoad] = useState(true);
  // ✅ Fix: activeMood is togglable — clicking again deselects
  const [activeMood, setActiveMood] = useState(null);
  const [selected,  setSelected] = useState(null);
  const [progBook,  setProgBook] = useState(null);
  const [toast,     setToast]    = useState('');
  const resultsRef = useRef(null);

  useEffect(() => {
    api.getTrending().then(d => {
      const works = (d.works || []).filter(w => w.cover_id).slice(0, 10).map(w => ({
        key: w.key, title: w.title,
        author_name: w.authors?.map(a => a.name),
        cover_i: w.cover_id,
        first_publish_year: w.first_publish_year,
      }));
      setFeatured(works);
    }).catch(() => {}).finally(() => setFeatLoad(false));
  }, []);

  const search = useCallback(async (q = query) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setResults([]);
    try {
      const data = await api.searchBooks(q.trim());
      setResults(data.docs || []);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [query]);

  // ✅ Fix: clicking the same mood deselects and clears results
  const handleMoodClick = async (mood) => {
    if (activeMood === mood.id) {
      // Deselect
      setActiveMood(null);
      setSearched(false);
      setResults([]);
      return;
    }
    setActiveMood(mood.id);
    setSearched(true);
    setLoading(true); setResults([]);
    try {
      const data = await api.searchBooks(mood.query);
      setResults(data.docs || []);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const clearResults = () => {
    setSearched(false); setActiveMood(null); setResults([]); setQuery('');
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '40px';

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes glow{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      {toast && <Toast msg={toast} />}

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `80px ${isMobile ? '20px' : '24px'} 40px`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 70% 50% at 50% 20%, var(--accent-sub) 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px)`, backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)' }} />

        <div className="fadeUp badge" style={{ animationDelay: '0.05s', marginBottom: '24px' }}>✦ Tu diario de lectura personal</div>

        <h1 className="fadeUp" style={{ animationDelay: '0.15s', fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '42px' : 'clamp(46px,9vw,96px)', fontWeight: 800, letterSpacing: isMobile ? '-1.5px' : '-2px', lineHeight: 0.95, marginBottom: '18px' }}>
          Los libros<br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>que te forman</span>
        </h1>

        <p className="fadeUp" style={{ animationDelay: '0.25s', fontSize: isMobile ? '15px' : '17px', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.7, marginBottom: '36px' }}>
          Registrá, calificá, reseñá y descubrí qué opinan otros lectores.
        </p>

        <div className="fadeUp" style={{ animationDelay: '0.35s', width: '100%', maxWidth: '540px' }}>
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
            {!isMobile && <span style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '16px' }}>🔍</span>}
            <input
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: isMobile ? '16px' : '15px', padding: isMobile ? '14px 14px' : '16px 14px', outline: 'none', fontFamily: "'Figtree',sans-serif" }}
              placeholder={isMobile ? 'Buscá un libro...' : 'Buscá un título, autor o ISBN...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <button onClick={() => search()} style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '14px', padding: '0 20px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
              {isMobile ? '🔍' : 'Buscar'}
            </button>
          </div>
          {!user && results.length > 0 && (
            <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <span onClick={onAuthClick} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}>Ingresá</span> para reseñar libros
            </p>
          )}
        </div>
      </section>

      {/* ── MOOD FILTERS ── */}
      <section style={{ padding: `0 ${pad}`, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <SectionHeader title="Explorar por mood" />
        <div className="tabs-scroll">
          {MOOD_FILTERS.map(m => (
            <button
              key={m.id}
              onClick={() => handleMoodClick(m)}
              style={{
                padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
                background: activeMood === m.id ? 'var(--accent)' : 'var(--surface)',
                color: activeMood === m.id ? '#fff' : 'var(--text-dim)',
                border: `1px solid ${activeMood === m.id ? 'var(--accent)' : 'var(--border-2)'}`,
                cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s',
                boxShadow: activeMood === m.id ? '0 0 16px var(--accent-glow)' : 'none',
              }}
            >
              {m.label}
              {/* ✅ Show X when active to make it clear it's deselectable */}
              {activeMood === m.id && <span style={{ marginLeft: '6px', opacity: 0.8 }}>×</span>}
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED ── */}
      {!searched && (
        <section style={{ padding: `48px ${pad}`, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <SectionHeader title="📈 Tendencias esta semana" />
          {featLoad ? (
            <div className="book-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ paddingTop: '148%', borderRadius: '10px' }} />)}</div>
          ) : (
            <div className="book-grid">
              {featured.map((book, i) => (
                <div key={book.key || i} className="fadeUp" style={{ animationDelay: `${i * 0.04}s` }}>
                  <BookCard book={book} onNavigate={b => navigate('book', b)} onRate={b => { if (!user) { onAuthClick(); return; } setSelected(b); }} loggedIn={!!user} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── RESULTS ── */}
      {searched && (
        <section ref={resultsRef} style={{ padding: `48px ${pad} 80px`, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', gap: '12px', color: 'var(--text-muted)' }}>
              <Spin /> Buscando libros...
            </div>
          ) : results.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: isMobile ? '18px' : '22px' }}>
                  {activeMood ? MOOD_FILTERS.find(m => m.id === activeMood)?.label : 'Resultados'}
                </h2>
                <span className="badge">{results.length}</span>
                <button onClick={clearResults} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', padding: '5px 12px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>✕ Limpiar</button>
              </div>
              <div className="book-grid">
                {results.map((book, i) => (
                  <div key={book.key || i} className="fadeUp" style={{ animationDelay: `${i * 0.03}s` }}>
                    <BookCard book={book} onNavigate={b => navigate('book', b)} onRate={b => { if (!user) { onAuthClick(); return; } setSelected(b); }} loggedIn={!!user} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>Sin resultados. Probá con otro término.</p>
            </div>
          )}
        </section>
      )}

      {selected && token && <ReviewModal book={selected} token={token} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); showToast('Reseña guardada ✓'); }} />}
      {progBook  && token && <ProgressModal book={progBook} token={token} onClose={() => setProgBook(null)} onSuccess={() => { setProgBook(null); showToast('Progreso actualizado ✓'); }} />}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
      <h2 style={{ whiteSpace: 'nowrap' }}>{title}</h2>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}

function Spin() {
  return <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid var(--border-2)', borderTop: `2px solid var(--accent)`, borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />;
}

function Toast({ msg }) {
  return <div className="fadeUp" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-2)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px 22px', color: 'var(--success)', fontSize: '14px', fontWeight: '600', zIndex: 300, whiteSpace: 'nowrap' }}>✓ {msg}</div>;
}