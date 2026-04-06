import { useState, useEffect } from 'react';
import { api } from '../api';
import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';

const SUBJECTS = [
    { id: 'science_fiction', label: '🚀 Ciencia Ficción' },
    { id: 'fantasy', label: '⚔️ Fantasía' },
    { id: 'mystery', label: '🔍 Misterio' },
    { id: 'romance', label: '💕 Romance' },
    { id: 'history', label: '📜 Historia' },
    { id: 'biography', label: '👤 Biografía' },
    { id: 'horror', label: '👻 Terror' },
    { id: 'classics', label: '📖 Clásicos' },
];

export default function Explore({ user, token, onAuthClick, navigate }) {
    const [trending, setTrending] = useState([]);
    const [subjects, setSubjects] = useState({});
    const [loadT, setLoadT] = useState(true);
    const [selected, setSelected] = useState(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        api.getTrending().then(d => {
            const works = (d.works || []).filter(w => w.cover_id).slice(0, 16).map(w => ({
                key: w.key, title: w.title,
                author_name: w.authors?.map(a => a.name),
                cover_i: w.cover_id,
                first_publish_year: w.first_publish_year,
            }));
            setTrending(works);
        }).catch(() => { }).finally(() => setLoadT(false));

        // Load first 2 subjects
        ['science_fiction', 'fantasy'].forEach(s => loadSubject(s));
    }, []);

    const loadSubject = async (s) => {
        try {
            const d = await api.getSubject(s);
            const works = (d.works || []).filter(w => w.cover_id).slice(0, 8).map(w => ({
                key: `/works/${w.key}`, title: w.title,
                author_name: w.authors?.map(a => a.name) || [],
                cover_i: w.cover_id,
                first_publish_year: w.first_publish_year,
            }));
            setSubjects(prev => ({ ...prev, [s]: works }));
        } catch { }
    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    return (
        <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            {toast && <div className="fadeUp" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-2)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px 22px', color: 'var(--success)', fontSize: '14px', fontWeight: '600', zIndex: 300 }}>✓ {toast}</div>}

            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '52px 36px 80px' }}>
                <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', marginBottom: '8px' }}>Explorar libros</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '40px' }}>Descubrí tendencias, géneros y colecciones curadas por la comunidad.</p>

                {/* Subject filter chips */}
                <div className="tabs-scroll" style={{ marginBottom: '48px' }}>
                    {SUBJECTS.map(s => (
                        <button key={s.id} onClick={() => loadSubject(s.id)} style={{
                            padding: '9px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
                            background: subjects[s.id] ? 'var(--accent)' : 'var(--surface)',
                            color: subjects[s.id] ? '#fff' : 'var(--text-dim)',
                            border: `1px solid ${subjects[s.id] ? 'var(--accent)' : 'var(--border-2)'}`,
                            cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s',
                        }}>{s.label}</button>
                    ))}
                </div>

                {/* Trending */}
                <Section title="📈 Tendencias semanales">
                    {loadT ? <SkelGrid n={8} /> : (
                        <Grid books={trending} navigate={navigate} user={user} onAuthClick={onAuthClick} setSelected={setSelected} />
                    )}
                </Section>

                {/* Subjects */}
                {SUBJECTS.map(s => subjects[s.id] && (
                    <Section key={s.id} title={s.label}>
                        <Grid books={subjects[s.id]} navigate={navigate} user={user} onAuthClick={onAuthClick} setSelected={setSelected} />
                    </Section>
                ))}
            </div>

            {selected && token && <ReviewModal book={selected} token={token} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); showToast('Reseña guardada'); }} />}
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: '52px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
                <h2 style={{ fontSize: '20px', whiteSpace: 'nowrap' }}>{title}</h2>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            {children}
        </div>
    );
}

function Grid({ books, navigate, user, onAuthClick, setSelected }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '14px' }}>
            {books.map((book, i) => (
                <div key={book.key || i} className="fadeUp" style={{ animationDelay: `${i * 0.035}s` }}>
                    <BookCard book={book} onNavigate={b => navigate('book', b)} onRate={b => { if (!user) { onAuthClick(); return; } setSelected(b); }} loggedIn={!!user} />
                </div>
            ))}
        </div>
    );
}

function SkelGrid({ n }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '14px' }}>
            {Array.from({ length: n }).map((_, i) => <div key={i} className="skeleton" style={{ paddingTop: '148%', borderRadius: '10px' }} />)}
        </div>
    );
}