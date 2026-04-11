import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../api';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useToast } from '../../hooks/useToast';
import BookCard from '../../components/BookCard';
import ReviewModal from '../../components/ReviewModal';
import ProgressModal from '../../components/ProgressModal';
import Toast from '../../components/ui/Toast';
import SectionHeader from '../../components/ui/SectionHeader';
import Spinner from '../../components/ui/Spinner';
import HeroSection from './HeroSection';
import MoodFilters, { MOOD_FILTERS } from './MoodFilters';

export default function Home({ user, token, onAuthClick, navigate }) {
  const { isMobile, lt } = useBreakpoint();
  const { toast, showToast } = useToast();
  const [query,      setQuery]     = useState('');
  const [results,    setResults]   = useState([]);
  const [loading,    setLoading]   = useState(false);
  const [searched,   setSearched]  = useState(false);
  const [featured,   setFeatured]  = useState([]);
  const [featLoad,   setFeatLoad]  = useState(true);
  const [activeMood, setActiveMood]= useState(null);
  const [selected,   setSelected]  = useState(null);
  const [progBook,   setProgBook]  = useState(null);
  const resultsRef = useRef(null);
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '40px';

  useEffect(() => {
    api.getTrending()
      .then(d => setFeatured((d.works || []).slice(0, 10)))
      .catch(() => {})
      .finally(() => setFeatLoad(false));
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

  const handleMoodClick = async (mood) => {
    if (activeMood === mood.id) {
      setActiveMood(null); setSearched(false); setResults([]); return;
    }
    setActiveMood(mood.id); setSearched(true); setLoading(true); setResults([]);
    try {
      const data = await api.searchBooks(mood.query);
      setResults(data.docs || []);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const clearResults = () => { setSearched(false); setActiveMood(null); setResults([]); setQuery(''); };

  const activeMoodLabel = activeMood ? MOOD_FILTERS.find(m => m.id === activeMood)?.label : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Toast msg={toast} />

      <HeroSection
        query={query} setQuery={setQuery}
        onSearch={() => search()}
        user={user} hasResults={results.length > 0}
        onAuthClick={onAuthClick} isMobile={isMobile}
      />

      {/* Mood filters */}
      <section style={{ padding: `0 ${pad}`, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <SectionHeader title="Explorar por mood" />
        <MoodFilters activeMood={activeMood} onMoodClick={handleMoodClick} />
      </section>

      {/* Featured — only when no active search */}
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

      {/* Search results */}
      {searched && (
        <section ref={resultsRef} style={{ padding: `48px ${pad} 80px`, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', gap: '12px', color: 'var(--text-muted)' }}>
              <Spinner /> Buscando libros...
            </div>
          ) : results.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: isMobile ? '18px' : '22px' }}>{activeMoodLabel || 'Resultados'}</h2>
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

      {selected  && token && <ReviewModal  book={selected}  token={token} onClose={() => setSelected(null)}  onSuccess={() => { setSelected(null);  showToast('Reseña guardada ✓'); }} />}
      {progBook  && token && <ProgressModal book={progBook} token={token} onClose={() => setProgBook(null)} onSuccess={() => { setProgBook(null); showToast('Progreso actualizado ✓'); }} />}
    </div>
  );
}