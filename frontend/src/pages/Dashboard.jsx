import { useState, useEffect } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';
import QuoteCard from '../components/QuoteCard';
import { Avatar } from '../components/Navbar';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { RecommendationsTab } from "./RecommendationsTab";

const TABS = [
  { id: 'feed',            label: '📰 Feed' },
  { id: 'recommendations', label: '✨ Para vos' },
  { id: 'library',         label: '📚 Biblioteca' },
  { id: 'progress',        label: '📖 Leyendo' },
  { id: 'stats',           label: '📊 Stats' },
  { id: 'challenge',       label: '🏆 Reto' },
  { id: 'dnf',             label: '🚫 DNF' },
  { id: 'quotes',          label: '✨ Citas' },
];

export default function Dashboard({ user, token, navigate, updateUser, onAuthClick }) {
  const { isMobile, lt } = useBreakpoint();
  const [tab,             setTab]             = useState('feed');
  const [reviews,         setReviews]         = useState([]);
  const [progress,        setProgress]        = useState([]);
  const [dnf,             setDnf]             = useState([]);
  const [quotes,          setQuotes]          = useState([]);
  const [stats,           setStats]           = useState(null);
  const [feed,            setFeed]            = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showQuote,       setShowQuote]       = useState(false);
  const [goal,            setGoal]            = useState(user?.reading_goal || 0);
  const [editGoal,        setEditGoal]        = useState(false);
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '36px';

  const load = async () => {
    setLoading(true);
    try {
      const [r, p, d, q, s, f, recs] = await Promise.all([
        api.getMyReviews(token),
        api.getProgress(token),
        api.getDNF(token),
        api.getQuotes(token),
        api.getStats(token),
        api.getFeed(token),
        api.getRecommendations(token).catch(() => [])
      ]);
      setReviews(r); setProgress(p); setDnf(d); setQuotes(q); setStats(s); setFeed(f); setRecommendations(recs);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(); }, [token]);

  const saveGoal = async () => {
    await api.updateMe(token, { reading_goal: Number(goal) });
    updateUser({ reading_goal: Number(goal) });
    setEditGoal(false);
  };

  const totalFinished = stats?.total_finished || 0;
  const challengePct  = goal > 0 ? Math.min(100, Math.round((totalFinished / goal) * 100)) : 0;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: `${isMobile ? '32px' : '48px'} ${pad} 24px`, borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Mi Perfil</p>
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar name={user?.username || '?'} color={user?.avatar_color} size={isMobile ? 44 : 56} />
            <div>
              <h1 style={{ fontSize: isMobile ? '22px' : 'clamp(22px,4vw,38px)' }}>
                <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>@{user?.username}</span>
              </h1>
              {/* Link to own profile */}
              <button onClick={() => navigate('profile', user?.username)} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", padding: 0, marginTop: '2px' }}>Ver mi perfil público →</button>
            </div>
          </div>
          {stats && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { v: stats.total_reviews,     l: 'Reseñas' },
                { v: stats.total_finished,    l: 'Terminados' },
                { v: stats.followers_count,   l: 'Seguidores' },
                { v: stats.avg_rating ? `${stats.avg_rating}★` : '—', l: 'Promedio' },
              ].map(({ v, l }) => (
                <div key={l} style={{ textAlign: 'center', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '10px', padding: isMobile ? '8px 10px' : '10px 16px' }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '16px' : '20px', fontWeight: 800 }}>{v}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: `0 ${pad}` }}>
        <div className="tabs-scroll" style={{ padding: '16px 0 0', gap: '4px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: isMobile ? '8px 10px' : '9px 16px', borderRadius: '10px', fontSize: isMobile ? '12px' : '13px', fontWeight: tab === t.id ? '700' : '400', whiteSpace: 'nowrap', background: tab === t.id ? 'var(--accent-sub)' : 'transparent', color: tab === t.id ? 'var(--accent-2)' : 'var(--text-muted)', border: `1px solid ${tab === t.id ? 'var(--border-2)' : 'transparent'}`, cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>{t.label}</button>
          ))}
          <button onClick={() => setShowQuote(true)} style={{ padding: isMobile ? '8px 10px' : '9px 16px', borderRadius: '10px', fontSize: isMobile ? '12px' : '13px', fontWeight: '500', whiteSpace: 'nowrap', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", marginLeft: '4px' }}>🎨 Cita</button>
        </div>
        <div style={{ height: '1px', background: 'var(--border)', margin: '0 0 28px' }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: `0 ${pad} 80px` }}>
        {loading ? <LoadingGrid /> : (
          <>
            {tab === 'feed'            && <FeedTab feed={feed} navigate={navigate} isMobile={isMobile} />}
            {tab === 'recommendations' && <RecommendationsTab recs={recommendations} loading={loading} navigate={navigate} user={user} token={token} onAuthClick={onAuthClick} />}
            {tab === 'library'         && <LibraryTab reviews={reviews} navigate={navigate} isMobile={isMobile} />}
            {tab === 'progress'        && <ProgressTab progress={progress} token={token} onUpdate={load} isMobile={isMobile} />}
            {tab === 'stats'           && <StatsTab stats={stats} isMobile={isMobile} />}
            {tab === 'challenge'       && <ChallengeTab stats={stats} goal={goal} setGoal={setGoal} editGoal={editGoal} setEditGoal={setEditGoal} saveGoal={saveGoal} challengePct={challengePct} totalFinished={totalFinished} isMobile={isMobile} />}
            {tab === 'dnf'             && <DNFTab dnf={dnf} token={token} onUpdate={load} />}
            {tab === 'quotes'          && <QuotesTab quotes={quotes} token={token} onUpdate={load} onNew={() => setShowQuote(true)} isMobile={isMobile} />}
          </>
        )}
      </div>

      {showQuote && <QuoteCard token={token} onClose={() => setShowQuote(false)} />}
    </div>
  );
}

// ── FEED TAB ─────────────────────────────────────────────────────────────────
function FeedTab({ feed, navigate, isMobile }) {
  if (!feed.length) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '18px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Tu feed está vacío</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Seguí a otros lectores para ver sus reseñas acá.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {feed.map((item, i) => (
        <div key={item.id} className="fadeUp" style={{ animationDelay: `${i * 0.04}s`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: isMobile ? '16px' : '20px 24px', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <button onClick={() => navigate('profile', item.username)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
              <Avatar name={item.username} color={item.avatar_color} size={36} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <button onClick={() => navigate('profile', item.username)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: '700', fontSize: '14px', color: 'var(--accent-2)' }}>@{item.username}</button>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>reseñó un libro</span>
                <StarRating value={item.rating} size="sm" />
                {item.created_at && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(item.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>}
              </div>
              {item.review_text && (
                <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '10px' }}>"{item.review_text}"</p>
              )}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {item.mood_tags?.split(',').filter(Boolean).map(m => (
                  <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '100px' }}>{m}</span>
                ))}
                {item.genre && <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--accent-sub)', color: 'var(--accent-2)', border: '1px solid var(--border-2)', borderRadius: '100px' }}>📚 {item.genre}</span>}
                <button onClick={() => navigate('book', { key: `/works/${item.open_library_work_id}`, title: 'Ver libro', cover_i: null })} style={{ fontSize: '11px', padding: '2px 8px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border-2)', borderRadius: '100px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", marginLeft: 'auto' }}>Ver libro →</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LIBRARY TAB ──────────────────────────────────────────────────────────────
function LibraryTab({ reviews, navigate, isMobile }) {
  if (!reviews.length) return <Empty icon="📚" title="Tu biblioteca está vacía" sub="Buscá un libro y dejá tu primera reseña." />;
  return (
    <div className="card-grid">
      {reviews.map((r, i) => (
        <div key={r.id} className="fadeUp" onClick={() => navigate('book', { key: `/works/${r.open_library_work_id}`, title: r.book.title, cover_i: r.book.cover_url?.match(/\/b\/id\/(\d+)/)?.[1] })}
          style={{ animationDelay: `${i * 0.04}s`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ position: 'relative', paddingTop: '145%', background: 'var(--surface-2)' }}>
            {r.book.cover_url ? <img src={r.book.cover_url} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>📖</div>}
            <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', borderRadius: '7px', padding: '3px 8px', fontSize: '12px', fontWeight: '700', color: 'var(--star)' }}>★ {r.rating}</div>
          </div>
          <div style={{ padding: '12px' }}>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '700', lineHeight: 1.3, color: 'var(--text)', marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.book.title}</p>
            <StarRating value={r.rating} size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PROGRESS TAB ─────────────────────────────────────────────────────────────
function ProgressTab({ progress, token, onUpdate, isMobile }) {
  const reading = progress.filter(p => p.status === 'reading');
  const want    = progress.filter(p => p.status === 'want');
  if (!progress.length) return <Empty icon="📖" title="Nada en progreso" sub="Buscá un libro y marcalo como 'Leyendo'." />;
  return (
    <div>
      {reading.length > 0 && <>
        <h3 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--text-dim)' }}>📖 Leyendo ahora ({reading.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {reading.map(p => <ProgressCard key={p.id} p={p} token={token} onUpdate={onUpdate} isMobile={isMobile} />)}
        </div>
      </>}
      {want.length > 0 && <>
        <h3 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--text-dim)' }}>🔖 Quiero leer ({want.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
          {want.map(p => <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '50px', borderRadius: '5px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
              {p.cover_url ? <img src={p.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '14px' }}>📚</span>}
            </div>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '700', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.book_title}</p>
          </div>)}
        </div>
      </>}
    </div>
  );
}

function ProgressCard({ p, token, onUpdate, isMobile }) {
  const [cur, setCur]     = useState(p.current_page);
  const [saving, setSaving] = useState(false);
  const pct = p.total_pages > 0 ? Math.min(100, Math.round((cur / p.total_pages) * 100)) : 0;
  const save = async () => { setSaving(true); await api.updateProgress(token, p.id, { current_page: cur }).catch(() => {}); setSaving(false); onUpdate(); };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: isMobile ? '14px' : '18px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div style={{ width: isMobile ? '42px' : '52px', height: isMobile ? '60px' : '74px', borderRadius: '7px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
        {p.cover_url ? <img src={p.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '18px' }}>📖</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '13px' : '14px', fontWeight: '700', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.book_title}</p>
        <div style={{ height: '7px', background: 'var(--surface-3)', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: '4px', boxShadow: '0 0 8px var(--accent-glow)', transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input type="number" min="0" max={p.total_pages} value={cur} onChange={e => setCur(Number(e.target.value))} style={{ width: '64px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', padding: '4px 8px', outline: 'none', fontFamily: "'Figtree',sans-serif" }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/ {p.total_pages}</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginLeft: 'auto' }}>{pct}%</span>
          <button onClick={save} disabled={saving} style={{ padding: '5px 12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>{saving ? '...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}

// ── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab({ stats, isMobile }) {
  if (!stats) return null;
  const genres  = Object.entries(stats.genres || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const moods   = Object.entries(stats.mood_counts || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const months  = Object.entries(stats.monthly_books || {}).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  const maxM    = Math.max(...months.map(([, v]) => v), 1);
  const maxG    = Math.max(...genres.map(([, v]) => v), 1);

  return (
    <div className="stats-grid">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>📅 Libros por mes</h3>
        {months.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aún sin datos</p> : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '110px' }}>
            {months.map(([k, v]) => {
              const h = (v / maxM) * 100;
              const [y, m] = k.split('-');
              const lbl = new Date(y, m - 1).toLocaleString('es', { month: 'short' });
              return (
                <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: '600' }}>{v}</span>
                  <div style={{ width: '100%', height: `${h}%`, minHeight: '4px', background: 'linear-gradient(to top, var(--accent), var(--accent-3))', borderRadius: '3px 3px 0 0' }} />
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{lbl}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>🏷 Géneros favoritos</h3>
        {genres.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Etiquetá tus reseñas con géneros.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {genres.map(([g, c]) => (
              <div key={g}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{g}</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{c}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--surface-3)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(c / maxG) * 100}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: '3px', transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>🌀 Moods más leídos</h3>
        {moods.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Etiquetá tus reseñas con moods.</p> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {moods.map(([m, c]) => <span key={m} style={{ padding: '6px 14px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '100px', fontSize: '13px', color: 'var(--accent-2)', fontWeight: '500' }}>{m} <span style={{ fontWeight: '800', color: 'var(--accent)' }}>·{c}</span></span>)}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>⭐ Distribución de ratings</h3>
        {[5, 4, 3, 2, 1].map(star => {
          const c = stats.rating_dist?.[star] || 0;
          const maxD = Math.max(...Object.values(stats.rating_dist || {}), 1);
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '12px', textAlign: 'right' }}>{star}</span>
              <span style={{ color: 'var(--star)', fontSize: '12px' }}>★</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(c / maxD) * 100}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '18px' }}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── READING CHALLENGE ─────────────────────────────────────────────────────────
function ChallengeTab({ stats, goal, setGoal, editGoal, setEditGoal, saveGoal, challengePct, totalFinished, isMobile }) {
  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: isMobile ? '28px 20px' : '36px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '14px' }}>🏆</div>
        <h2 style={{ fontSize: isMobile ? '22px' : '26px', marginBottom: '6px' }}>Reto de Lectura {new Date().getFullYear()}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>Tu meta personal de libros para este año</p>

        {goal > 0 ? (
          <div style={{ position: 'relative', marginBottom: '22px' }}>
            <svg viewBox="0 0 200 200" style={{ width: isMobile ? '150px' : '180px', height: isMobile ? '150px' : '180px', margin: '0 auto', display: 'block' }}>
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--surface-3)" strokeWidth="12" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#grad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 80}`} strokeDashoffset={`${2 * Math.PI * 80 * (1 - challengePct / 100)}`} style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dashoffset 1s ease' }} />
              <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--accent)" /><stop offset="100%" stopColor="var(--accent-3)" /></linearGradient></defs>
              <text x="100" y="94" textAnchor="middle" style={{ fontSize: '26px', fontWeight: '800', fill: 'var(--text)', fontFamily: "'Syne',sans-serif" }}>{challengePct}%</text>
              <text x="100" y="114" textAnchor="middle" style={{ fontSize: '11px', fill: 'var(--text-muted)', fontFamily: "'Figtree',sans-serif" }}>{totalFinished} / {goal}</text>
            </svg>
          </div>
        ) : (
          <div style={{ padding: '20px', background: 'var(--surface-2)', borderRadius: '12px', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Configurá una meta para trackear tu reto anual.</p>
          </div>
        )}

        {editGoal ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input type="number" min="1" max="365" value={goal} onChange={e => setGoal(e.target.value)} style={{ width: '90px', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '8px', color: 'var(--text)', fontSize: '18px', fontWeight: '700', padding: '8px 12px', textAlign: 'center', outline: 'none', fontFamily: "'Syne',sans-serif" }} />
            <span style={{ lineHeight: '42px', color: 'var(--text-muted)', fontSize: '14px' }}>libros</span>
            <button onClick={saveGoal} style={{ padding: '8px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>Guardar</button>
            <button onClick={() => setEditGoal(false)} className="btn-ghost" style={{ padding: '8px 14px' }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setEditGoal(true)} className="btn-ghost">{goal > 0 ? '⚙️ Cambiar meta' : '⚙️ Configurar meta'}</button>
        )}
      </div>
    </div>
  );
}

// ── DNF TAB ──────────────────────────────────────────────────────────────────
function DNFTab({ dnf, token, onUpdate }) {
  const remove = async (id) => { await api.deleteDNF(token, id).catch(() => {}); onUpdate(); };
  if (!dnf.length) return <Empty icon="🚫" title="Sin libros abandonados" sub="Podés marcar un libro como DNF desde su página." />;
  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '18px' }}>Los libros DNF no afectan tus estadísticas ni tu reto anual.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dnf.map(d => (
          <div key={d.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px' }}>
            <div style={{ width: '36px', height: '52px', borderRadius: '5px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
              {d.cover_url ? <img src={d.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '14px' }}>📚</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.book_title}</p>
              {d.reason && <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>"{d.reason}"</p>}
            </div>
            <span style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '100px', flexShrink: 0 }}>DNF</span>
            <button onClick={() => remove(d.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── QUOTES TAB ───────────────────────────────────────────────────────────────
function QuotesTab({ quotes, token, onUpdate, onNew, isMobile }) {
  const remove = async (id) => { await api.deleteQuote(token, id).catch(() => {}); onUpdate(); };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tus frases guardadas</p>
        <button onClick={onNew} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>✨ Nueva tarjeta</button>
      </div>
      {quotes.length === 0 ? <Empty icon="💬" title="Sin citas guardadas" sub="Creá una tarjeta de cita con el botón de arriba." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {quotes.map(q => (
            <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', position: 'relative' }}>
              <button onClick={() => remove(q.id)} style={{ position: 'absolute', top: '10px', right: '12px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>×</button>
              <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{q.book_title}</p>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic', fontSize: '14px', lineHeight: 1.7, color: 'var(--text)', marginBottom: '10px' }}>"{q.quote_text}"</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— {q.author_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '18px' }}>
      <div style={{ fontSize: '48px', marginBottom: '14px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{sub}</p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="card-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ paddingTop: '145%', borderRadius: '10px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '13px', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  );
}