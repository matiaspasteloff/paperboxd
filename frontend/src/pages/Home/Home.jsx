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
import StarRating from '../../components/StarRating';
import HeroSection from './HeroSection';
import MoodFilters, { MOOD_FILTERS } from './MoodFilters';

// ── Relative time helper ──────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)   return 'justo ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

// ── Single review card for the home strip ────────────────────────────────────
function ReviewCard({ r, navigate, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="fadeUp"
      style={{
        animationDelay: `${index * 0.04}s`,
        minWidth: '260px',
        maxWidth: '260px',
        background: hov ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`,
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        flexShrink: 0,
      }}
      onClick={() => navigate('book', {
        key: `/works/${r.open_library_work_id}`,
        title: r.book_title,
        cover_url: r.cover_url,
        author_name: [],
      })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Cover strip */}
      <div style={{ height: '6px', background: 'linear-gradient(90deg, var(--accent), var(--accent-3))' }} />

      <div style={{ padding: '14px 14px 12px', display: 'flex', gap: '10px' }}>
        {/* Cover thumbnail */}
        <div style={{
          width: '44px', height: '62px', borderRadius: '5px', overflow: 'hidden',
          flexShrink: 0, background: 'var(--surface-3)', border: '1px solid var(--border)',
        }}>
          {r.cover_url
            ? <img src={r.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📖</div>
          }
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Syne',sans-serif", fontSize: '12px', fontWeight: '700',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: '4px', color: 'var(--text)',
          }}>
            {r.book_title || 'Libro'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <StarRating value={Math.round(r.rating)} size="sm" />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              @{r.username}
            </span>
          </div>

          {r.review_text && (
            <p style={{
              fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.55,
              fontStyle: 'italic',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              "{r.review_text}"
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {r.genre && (
            <span style={{
              fontSize: '10px', padding: '2px 7px', borderRadius: '100px',
              background: 'var(--accent-sub)', color: 'var(--accent-2)',
              border: '1px solid var(--border-2)',
            }}>
              {r.genre}
            </span>
          )}
          {r.mood_tags?.split(',').filter(Boolean).slice(0, 1).map(m => (
            <span key={m} style={{
              fontSize: '10px', padding: '2px 7px', borderRadius: '100px',
              background: 'var(--surface-3)', color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              {m}
            </span>
          ))}
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
          {timeAgo(r.created_at)}
        </span>
      </div>
    </div>
  );
}

// ── Latest reviews strip ──────────────────────────────────────────────────────
function LatestReviewsStrip({ reviews, loading, navigate }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ minWidth: '260px', height: '140px', borderRadius: '14px', flexShrink: 0 }} />
        ))}
      </div>
    );
  }
  if (!reviews.length) return null;
  return (
    <div style={{
      display: 'flex', gap: '12px',
      overflowX: 'auto', paddingBottom: '8px',
      scrollbarWidth: 'none',
    }}>
      <style>{`.latest-strip::-webkit-scrollbar{display:none}`}</style>
      <div className="latest-strip" style={{ display: 'flex', gap: '12px' }}>
        {reviews.map((r, i) => (
          <ReviewCard key={r.id} r={r} navigate={navigate} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home({ user, token, onAuthClick, navigate }) {
  const { isMobile, lt } = useBreakpoint();
  const { toast, showToast } = useToast();
  const [query,         setQuery]        = useState('');
  const [results,       setResults]      = useState([]);
  const [loading,       setLoading]      = useState(false);
  const [searched,      setSearched]     = useState(false);
  const [featured,      setFeatured]     = useState([]);
  const [featLoad,      setFeatLoad]     = useState(true);
  const [activeMood,    setActiveMood]   = useState(null);
  const [selected,      setSelected]     = useState(null);
  const [progBook,      setProgBook]     = useState(null);
  const [latestReviews, setLatestReviews]= useState([]);
  const [latestLoad,    setLatestLoad]   = useState(true);
  const resultsRef = useRef(null);
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '40px';

  useEffect(() => {
    api.getTrending()
      .then(d => setFeatured((d.works || []).slice(0, 10)))
      .catch(() => {})
      .finally(() => setFeatLoad(false));

    api.getLatestReviews()
      .then(data => setLatestReviews(data))
      .catch(() => {})
      .finally(() => setLatestLoad(false));
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

      {/* Latest community reviews — only when not searching */}
      {!searched && (latestLoad || latestReviews.length > 0) && (
        <section style={{ padding: `48px ${pad} 0`, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <SectionHeader title="Lo que está leyendo la comunidad" />
          <LatestReviewsStrip
            reviews={latestReviews}
            loading={latestLoad}
            navigate={navigate}
          />
        </section>
      )}

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