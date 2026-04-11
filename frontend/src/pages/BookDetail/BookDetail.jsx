import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import ReviewModal from '../../components/ReviewModal';
import ProgressModal from '../../components/ProgressModal';
import BookHeader from './BookHeader';
import ReviewsList from './ReviewsList';
import DNFModal from './DNFModal';

export default function BookDetail({ book, user, token, onAuthClick, navigate }) {
  const { isMobile, lt } = useBreakpoint();
  const { toast, showToast } = useToast();
  const [reviews,    setReviews]  = useState([]);
  const [progress,   setProgress] = useState(null);
  const [details,    setDetails]  = useState(null);
  const [loading,    setLoading]  = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showProg,   setShowProg]   = useState(false);
  const [showDNF,    setShowDNF]    = useState(false);
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '32px';

  const workId = book.key?.replace('/works/', '') || '';
  const merged = { ...book, ...(details || {}) };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await api.getBookReviews(workId);
      setReviews(data);
      if (token) {
        const prog = await api.getProgress(token);
        setProgress(prog.find(p => p.open_library_work_id === workId) || null);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadReviews();
    const isGoogleId = workId && !workId.startsWith('OL');
    if (isGoogleId && !book.description) {
      api.getBookDetails(workId).then(d => d && setDetails(d)).catch(() => {});
    }
  }, [workId]);

  const addDNF = async (reason) => {
    if (!token) { onAuthClick(); return; }
    const coverUrl = book.cover_url || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null);
    await api.addDNF(token, { open_library_work_id: workId, book_title: book.title, cover_url: coverUrl, reason: reason || null }).catch(() => {});
    setShowDNF(false);
    showToast('Libro marcado como DNF');
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Toast msg={toast} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: `24px ${pad} 0` }}>
        <button onClick={() => navigate('home')} className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px' }}>← Volver</button>
      </div>

      <BookHeader
        book={book} merged={merged} reviews={reviews} progress={progress}
        user={user} isMobile={isMobile}
        onAddProgress={() => setShowProg(true)}
        onReview={() => setShowReview(true)}
        onDNF={() => setShowDNF(true)}
        onAuthClick={onAuthClick}
      />

      {merged.description && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: `0 ${pad} 28px` }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: isMobile ? '16px' : '22px 28px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>📖 Sinopsis</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.75 }}>{merged.description}</p>
          </div>
        </div>
      )}

      <ReviewsList reviews={reviews} loading={loading} isMobile={isMobile} />

      {showReview && token && <ReviewModal book={book} token={token} onClose={() => setShowReview(false)} onSuccess={() => { setShowReview(false); showToast('Reseña guardada ✓'); loadReviews(); }} />}
      {showProg   && token && <ProgressModal book={book} token={token} existing={progress} onClose={() => setShowProg(false)} onSuccess={() => { setShowProg(false); showToast('Progreso actualizado ✓'); loadReviews(); }} />}
      {showDNF && <DNFModal isMobile={isMobile} onConfirm={addDNF} onClose={() => setShowDNF(false)} />}
    </div>
  );
}