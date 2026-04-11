import Avatar from '../../components/Navbar/Avatar';
import EditForm from './EditForm';

const AVATAR_COLORS = ['#388bfd','#cc88ff','#55cc88','#ff8855','#ffcc44','#ff5577','#44cccc','#ff88aa','#88bbff','#ffaa55'];

export default function ProfileHeader({ profile, isOwn, token, editMode, editForm, setEditForm, setEditMode, saveProfile, saving, toggleFollow, following_, isMobile }) {
  const favGenres = (editMode ? editForm.favorite_genres : profile.favorite_genres)?.split(',').filter(Boolean) || [];
  const favMoods  = (editMode ? editForm.favorite_moods  : profile.favorite_moods)?.split(',').filter(Boolean) || [];

  return (
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

          {/* Stats */}
          <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {[
              { v: profile.reviews_count,   l: 'reseñas' },
              { v: profile.followers_count, l: 'seguidores' },
              { v: profile.following_count, l: 'siguiendo' },
            ].map(({ v, l }) => (
              <div key={l}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: 'var(--text)', display: 'block' }}>{v}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Bio (view) */}
          {!editMode && profile.bio && (
            <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.65 }}>{profile.bio}</p>
          )}

          {/* Website */}
          {!editMode && profile.website && (
            <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '6px', display: 'inline-block' }}>🔗 {profile.website}</a>
          )}

          {profile.joined_at && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              📅 Miembro desde {new Date(profile.joined_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* Edit form (expandable) */}
      {editMode && <EditForm editForm={editForm} setEditForm={setEditForm} isMobile={isMobile} />}

      {/* Tags (view mode) */}
      {!editMode && (favGenres.length > 0 || favMoods.length > 0) && (
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
  );
}