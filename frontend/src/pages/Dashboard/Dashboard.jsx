import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/Navbar/Avatar';
import QuoteCard from '../../components/QuoteCard';
import Toast from '../../components/ui/Toast';
import FeedTab from './FeedTab';
import LibraryTab from './LibraryTab';
import ProgressTab from './ProgressTab';
import StatsTab from './StatsTab';
import ChallengeTab from './ChallengeTab';
import DNFTab from './DNFTab';
import QuotesTab from './QuotesTab';
import { RecommendationsTab } from '../RecommendationsTab';

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

export default function Dashboard({ user, token, navigate, updateUser, onAuthClick }) {
  const { isMobile, lt } = useBreakpoint();
  const { toast, showToast } = useToast();
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
        api.getRecommendations(token).catch(() => []),
      ]);
      setReviews(r); setProgress(p); setDnf(d); setQuotes(q);
      setStats(s); setFeed(f); setRecommendations(recs);
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
      <Toast msg={toast} />

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
              <button onClick={() => navigate('profile', user?.username)} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", padding: 0, marginTop: '2px' }}>Ver mi perfil público →</button>
            </div>
          </div>
          {stats && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { v: stats.total_reviews,   l: 'Reseñas' },
                { v: stats.total_finished,  l: 'Terminados' },
                { v: stats.followers_count, l: 'Seguidores' },
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
            {tab === 'library'         && <LibraryTab reviews={reviews} navigate={navigate} />}
            {tab === 'progress'        && <ProgressTab progress={progress} token={token} onUpdate={load} isMobile={isMobile} />}
            {tab === 'stats'           && <StatsTab stats={stats} />}
            {tab === 'challenge'       && <ChallengeTab goal={goal} setGoal={setGoal} editGoal={editGoal} setEditGoal={setEditGoal} saveGoal={saveGoal} challengePct={challengePct} totalFinished={totalFinished} isMobile={isMobile} />}
            {tab === 'dnf'             && <DNFTab dnf={dnf} token={token} onUpdate={load} />}
            {tab === 'quotes'          && <QuotesTab quotes={quotes} token={token} onUpdate={load} onNew={() => setShowQuote(true)} isMobile={isMobile} />}
          </>
        )}
      </div>

      {showQuote && <QuoteCard token={token} onClose={() => setShowQuote(false)} />}
    </div>
  );
}