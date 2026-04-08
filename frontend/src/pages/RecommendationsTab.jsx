import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';
import { useState } from 'react';

export function RecommendationsTab({ recs, loading, navigate, user, token, onAuthClick, isMobile }) {
    const [selected, setSelected] = useState(null);
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    if (loading) {
        return (
            <div>
                <div style={{ marginBottom: '24px' }}>
                    <div className="skeleton" style={{ height: '20px', width: '200px', borderRadius: '6px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '300px', borderRadius: '4px' }} />
                </div>
                <div className="book-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i}>
                            <div className="skeleton" style={{ paddingTop: '148%', borderRadius: '10px', marginBottom: '8px' }} />
                            <div className="skeleton" style={{ height: '13px', borderRadius: '4px' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!recs.length) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '18px' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>✨</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Todavía no tenemos recomendaciones para vos</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Reseñá algunos libros para que podamos conocer tus gustos.</p>
            </div>
        );
    }

    return (
        <div>
            {toast && (
                <div className="fadeUp" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-2)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px 22px', color: 'var(--success)', fontSize: '14px', fontWeight: '600', zIndex: 300, whiteSpace: 'nowrap' }}>✓ {toast}</div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ fontSize: isMobile ? '18px' : '22px' }}>Recomendados para vos</h2>
                    <span className="badge">{recs.length}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Basado en tus géneros y moods favoritos
                </p>
            </div>

            <div className="book-grid">
                {recs.map((book, i) => (
                    <div key={book.key || i} className="fadeUp" style={{ animationDelay: `${i * 0.03}s` }}>
                        <BookCard
                            book={book}
                            onNavigate={b => navigate('book', b)}
                            onRate={b => {
                                if (!user) { onAuthClick(); return; }
                                setSelected(b);
                            }}
                            loggedIn={!!user}
                        />
                    </div>
                ))}
            </div>

            {selected && token && (
                <ReviewModal
                    book={selected}
                    token={token}
                    onClose={() => setSelected(null)}
                    onSuccess={() => { setSelected(null); showToast('Reseña guardada ✓'); }}
                />
            )}
        </div>
    );
}