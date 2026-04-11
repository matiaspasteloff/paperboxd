import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Empty from '../../components/ui/Empty';
import ProfileHeader from './ProfileHeader';
import ReviewRow from './ReviewRow';
import UserCard from './UserCard';

function Spin() {
  return <span style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--border-2)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />;
}

export default function Profile({ username, user, token, navigate, updateUser }) {
  const { isMobile, lt } = useBreakpoint();
  const { toast, showToast } = useToast();
  const isOwn = user?.username === username;
  const pad   = isMobile ? '16px' : lt(1024) ? '24px' : '36px';

  const [profile,    setProfile]   = useState(null);
  const [reviews,    setReviews]   = useState([]);
  const [followers,  setFollowers] = useState([]);
  const [following,  setFollowing] = useState([]);
  const [tab,        setTab]       = useState('reviews');
  const [loading,    setLoading]   = useState(true);
  const [following_, setFollowing_]= useState(false);
  const [editMode,   setEditMode]  = useState(false);
  const [editForm,   setEditForm]  = useState({});
  const [saving,     setSaving]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, r, frs, fwg] = await Promise.all([
        api.getProfile(username, token),
        api.getUserReviews(username),
        api.getFollowers(username),
        api.getFollowing(username),
      ]);
      setProfile(p); setReviews(r); setFollowers(frs); setFollowing(fwg);
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

  if (loading) return (
    <div style={{ minHeight: '100vh', paddingTop: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Spin />
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ color: 'var(--text-muted)' }}>Usuario no encontrado.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Toast msg={toast} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: `${isMobile ? '28px' : '44px'} ${pad} 80px` }}>
        <ProfileHeader
          profile={profile} isOwn={isOwn} token={token}
          editMode={editMode} editForm={editForm} setEditForm={setEditForm}
          setEditMode={setEditMode} saveProfile={saveProfile} saving={saving}
          toggleFollow={toggleFollow} following_={following_} isMobile={isMobile}
        />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', padding: '3px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: 'fit-content' }}>
          {[
            { id: 'reviews',   label: `📚 Reseñas (${reviews.length})` },
            { id: 'followers', label: `👥 Seguidores (${followers.length})` },
            { id: 'following', label: `✨ Siguiendo (${following.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: isMobile ? '8px 12px' : '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: tab === t.id ? '700' : '400', background: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", whiteSpace: 'nowrap' }}>{t.label}</button>
          ))}
        </div>

        {tab === 'reviews' && (
          reviews.length === 0
            ? <Empty icon="📚" title={isOwn ? 'Aún no reseñaste ningún libro.' : `@${username} aún no publicó reseñas.`} sub="" />
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((r, i) => <ReviewRow key={r.id} review={r} index={i} navigate={navigate} username={username} color={profile.avatar_color} />)}
              </div>
        )}

        {tab === 'followers' && (
          followers.length === 0
            ? <Empty icon="👥" title={isOwn ? 'Todavía nadie te sigue.' : `@${username} no tiene seguidores aún.`} sub="" />
            : <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {followers.map(u => <UserCard key={u.id} u={u} navigate={navigate} />)}
              </div>
        )}

        {tab === 'following' && (
          following.length === 0
            ? <Empty icon="✨" title={isOwn ? 'Todavía no seguís a nadie.' : `@${username} no sigue a nadie aún.`} sub="" />
            : <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {following.map(u => <UserCard key={u.id} u={u} navigate={navigate} />)}
              </div>
        )}
      </div>
    </div>
  );
}