import { useState, useEffect } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';
import { Avatar } from '../components/Navbar';
import { useBreakpoint } from '../hooks/useBreakpoint';

const AVATAR_COLORS = [
  '#388bfd', '#cc88ff', '#55cc88', '#ff8855', '#ffcc44',
  '#ff5577', '#44cccc', '#ff88aa', '#88bbff', '#ffaa55',
];

const ALL_GENRES = ['ficción', 'no ficción', 'fantasía', 'ciencia ficción', 'romance', 'thriller', 'historia', 'poesía', 'terror', 'autoayuda', 'ensayo', 'clásicos'];
const ALL_MOODS  = ['oscuro', 'emotivo', 'relajante', 'épico', 'misterioso', 'filosófico', 'romántico', 'humorístico'];

export default function Profile({ username, user, token, navigate, updateUser }) {
  const { isMobile, lt } = useBreakpoint();
  const isOwn    = user?.username === username;
  const [profile,    setProfile]   = useState(null);
  const [reviews,    setReviews]   = useState([]);
  const [followers,  setFollowers] = useState([]);
  const [following,  setFollowing] = useState([]);
  const [tab,        setTab]       = useState('reviews');
  const [loading,    setLoading]   = useState(true);
  const [following_, setFollowing_]= useState(false);
  const [toast,      setToast]     = useState('');
  const [editMode,   setEditMode]  = useState(false);
  const [editForm,   setEditForm]  = useState({});
  const [saving,     setSaving]    = useState(false);
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '36px';

  const load = async () => {
    setLoading(true);
    try {
      const [p, r, frs, fwg] = await Promise.all([
        api.getProfile(username, token),
        api.getUserReviews(username),
        api.getFollowers(username),
        api.getFollowing(username),
      ]);
      setProfile(p);
      setReviews(r);
      setFollowers(frs);
      setFollowing(fwg);
      setFollowing_(p.is_following);
      if (isOwn) setEditForm({ bio: p.bio || '', avatar_color: p.avatar_color || '#388bfd', favorite_genres: p.favorite_genres || '', favorite_moods: p.favorite_moods || '', location: p.location || '', website: p.website || '' });
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [username]);

  const toggleFollow = async () => {
    if (!token) return;
    const res = await api.toggleFollow(token, username).catch(() => null);
    if (res) {
      setFollowing_(res.following);
      setProfile(p => ({ ...p, followers_count: p.followers_count + (res.following ? 1 : -1) }));
      showToast(res.following ? `Seguís a @${username}` : `Dejaste de seguir a @${username}`);
      load();
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.updateMe(token, editForm);
      updateUser({ ...editForm });
      setEditMode(false);
      showToast('Perfil actualizado ✓');
      load();
    } catch (err) { showToast('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const toggleTag = (key, val) => {
    const arr = editForm[key] ? editForm[key].split(',').filter(Boolean) : [];
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    setEditForm(f => ({ ...f, [key]: arr.join(',') }));
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return (
    <div style={{ minHeight: '100vh', paddingTop: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin />
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ color: 'var(--text-muted)' }}>Usuario no encontrado.</p>
    </div>
  );

  const favGenres = (editMode ? editForm.favorite_genres : profile.favorite_genres)?.split(',').filter(Boolean) || [];
  const favMoods  = (editMode ? editForm.favorite_moods  : profile.favorite_moods)?.split(',').filter(Boolean)  || [];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {toast && <Toast msg={toast} />}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: `${isMobile ? '28px' : '44px'} ${pad} 80px` }}>

        {/* ── PROFILE HEADER ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: isMobile ? '24px 20px' : '36px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: isMobile ? '16px' : '28px', alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {editMode ? (
                <div>
                  <Avatar name={profile.username} color={editForm.avatar_color} size={isMobile ? 64 : 88} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', maxWidth: isMobile ? '200px' : '120px' }}>
                    {AVATAR_COLORS.map(c => (
                      <button key={c} onClick={() => setEditForm(f => ({ ...f, avatar_color: c }))} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: `3px solid ${editForm.avatar_color === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              ) : (
                <Avatar name={profile.username} color={profile.avatar_color} size={isMobile ? 64 : 88} />
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? '22px' : '30px', lineHeight: 1.1, marginBottom: '4px' }}>@{profile.username}</h1>
                  {profile.location && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {profile.location}</p>}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {isOwn ? (
                    editMode ? (
                      <>
                        <button onClick={() => setEditMode(false)} className="btn-ghost" style={{ padding: '9px 16px', fontSize: '13px' }}>Cancelar</button>
                        <button onClick={saveProfile} disabled={saving} style={{ padding: '9px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
                          {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditMode(true)} className="btn-ghost" style={{ padding: '9px 18px', fontSize: '13px' }}>✏️ Editar perfil</button>
                    )
                  ) : (
                    token && (
                      <button onClick={toggleFollow} style={{ padding: '9px 20px', background: following_ ? 'transparent' : 'var(--accent)', color: following_ ? 'var(--text-dim)' : '#fff', border: following_ ? '1px solid var(--border-2)' : 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.18s', boxShadow: following_ ? 'none' : '0 0 14px var(--accent-glow)' }}>
                        {following_ ? 'Siguiendo ✓' : '+ Seguir'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {[
                  { v: profile.reviews_count,   l: 'reseñas',   action: () => setTab('reviews') },
                  { v: profile.followers_count, l: 'seguidores', action: () => setTab('followers') },
                  { v: profile.following_count, l: 'siguiendo',  action: () => setTab('following') },
                ].map(({ v, l, action }) => (
                  <button key={l} onClick={action} style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: 'var(--text)', display: 'block' }}>{v}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l}</span>
                  </button>
                ))}
              </div>

              {/* Bio */}
              {editMode ? (
                <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={200} placeholder="Contá algo sobre vos..." style={{ width: '100%', minHeight: '70px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', padding: '10px 13px', resize: 'none', fontFamily: "'Figtree',sans-serif", outline: 'none', boxSizing: 'border-box' }} onFocus={e => (e.target.style.borderColor = 'var(--border-3)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              ) : (
                profile.bio && <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.65 }}>{profile.bio}</p>
              )}

              {/* Location / website edit */}
              {editMode && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                  <input className="input-field" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="📍 Ciudad o país" style={{ fontSize: '13px' }} />
                  <input className="input-field" value={editForm.website} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} placeholder="🔗 Website" style={{ fontSize: '13px' }} />
                </div>
              )}

              {/* Website link */}
              {!editMode && profile.website && (
                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '6px', display: 'inline-block' }}>🔗 {profile.website}</a>
              )}

              {/* Joined */}
              {profile.joined_at && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  📅 Miembro desde {new Date(profile.joined_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* ── Genres & Moods ── */}
          {editMode ? (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>Géneros favoritos</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ALL_GENRES.map(g => {
                    const active = favGenres.includes(g);
                    return <Tag key={g} active={active} onClick={() => toggleTag('favorite_genres', g)}>{g}</Tag>;
                  })}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>Moods favoritos</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ALL_MOODS.map(m => {
                    const active = favMoods.includes(m);
                    return <Tag key={m} active={active} onClick={() => toggleTag('favorite_moods', m)}>{m}</Tag>;
                  })}
                </div>
              </div>
            </div>
          ) : (favGenres.length > 0 || favMoods.length > 0) && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {favGenres.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Géneros</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {favGenres.map(g => <span key={g} style={{ fontSize: '12px', padding: '3px 10px', background: 'var(--accent-sub)', color: 'var(--accent-2)', borderRadius: '100px', border: '1px solid var(--border-2)' }}>{g}</span>)}
                  </div>
                </div>
              )}
              {favMoods.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Moods</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {favMoods.map(m => <span key={m} style={{ fontSize: '12px', padding: '3px 10px', background: 'var(--accent-sub)', color: 'var(--accent-2)', borderRadius: '100px', border: '1px solid var(--border-2)' }}>{m}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', padding: '3px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: 'fit-content' }}>
          {[
            { id: 'reviews',   label: `📚 Reseñas (${reviews.length})` },
            { id: 'followers', label: `👥 Seguidores (${followers.length})` },
            { id: 'following', label: `✨ Siguiendo (${following.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: isMobile ? '8px 12px' : '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: tab === t.id ? '700' : '400', background: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: "'Figtree',sans-serif', transition: 'all 0.15s'", whiteSpace: 'nowrap' }}>{t.label}</button>
          ))}
        </div>

        {/* ── REVIEWS TAB ── */}
        {tab === 'reviews' && (
          reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
              <p style={{ color: 'var(--text-dim)' }}>{isOwn ? 'Aún no reseñaste ningún libro.' : `@${username} aún no publicó reseñas.`}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((r, i) => (
                <ReviewRow key={r.id} review={r} index={i} navigate={navigate} username={username} color={profile.avatar_color} />
              ))}
            </div>
          )
        )}

        {/* ── FOLLOWERS TAB ── */}
        {tab === 'followers' && (
          followers.length === 0 ? (
            <EmptyList icon="👥" text={isOwn ? 'Todavía nadie te sigue.' : `@${username} no tiene seguidores aún.`} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {followers.map(u => <UserCard key={u.id} u={u} navigate={navigate} />)}
            </div>
          )
        )}

        {/* ── FOLLOWING TAB ── */}
        {tab === 'following' && (
          following.length === 0 ? (
            <EmptyList icon="✨" text={isOwn ? 'Todavía no seguís a nadie.' : `@${username} no sigue a nadie aún.`} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {following.map(u => <UserCard key={u.id} u={u} navigate={navigate} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ReviewRow({ review, index, navigate, username, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="fadeUp" style={{ animationDelay: `${index * 0.04}s`, background: hov ? 'var(--surface-2)' : 'var(--surface)', border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '14px', padding: '16px 18px', transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => navigate('book', { key: `/works/${review.open_library_work_id}`, title: '...', cover_i: null })}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Avatar name={username} color={color} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <StarRating value={review.rating} size="sm" />
            <span style={{ padding: '2px 8px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '100px', fontSize: '11px', color: 'var(--accent-2)', fontWeight: '600' }}>{review.rating}/5</span>
            {review.created_at && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(review.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
          </div>
          {review.review_text && <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '8px' }}>"{review.review_text}"</p>}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {review.mood_tags?.split(',').filter(Boolean).map(m => <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '100px' }}>{m}</span>)}
            {review.genre && <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--accent-sub)', color: 'var(--accent-2)', border: '1px solid var(--border-2)', borderRadius: '100px' }}>📚 {review.genre}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCard({ u, navigate }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => navigate('profile', u.username)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: hov ? 'var(--surface-2)' : 'var(--surface)', border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.18s' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <Avatar name={u.username} color={u.avatar_color} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>@{u.username}</p>
        {u.bio && <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</p>}
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
    </div>
  );
}

function EmptyList({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '16px' }}>
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{text}</p>
    </div>
  );
}

function Tag({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: active ? '600' : '400', background: active ? 'var(--accent)' : 'var(--surface-3)', color: active ? '#fff' : 'var(--text-muted)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s' }}>{children}</button>
  );
}

function Spin() {
  return <span style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--border-2)', borderTop: `3px solid var(--accent)`, borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />;
}

function Toast({ msg }) {
  return <div className="fadeUp" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-2)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px 22px', color: 'var(--success)', fontSize: '14px', fontWeight: '600', zIndex: 300, whiteSpace: 'nowrap' }}>✓ {msg}</div>;
}