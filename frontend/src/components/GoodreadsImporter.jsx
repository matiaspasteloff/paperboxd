import { useState, useRef, useCallback } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { api } from '../api';

// ─── CSV Parser ──────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(h => h.trim());

  return lines.slice(1).map(line => {
    const vals = parseCSVRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
  }).filter(r => r['Title']);
}

function parseCSVRow(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function cleanISBN(raw) {
  // GoodReads exports ISBNs as ="0123456789"
  return raw.replace(/[^0-9X]/gi, '');
}

function mapRow(row) {
  return {
    gr_book_id:      row['Book Id'] || '',
    title:           row['Title'] || '',
    author:          row['Author'] || '',
    isbn13:          cleanISBN(row['ISBN13'] || row['ISBN'] || ''),
    my_rating:       parseInt(row['My Rating'] || '0', 10) || 0,
    my_review:       row['My Review'] || '',
    exclusive_shelf: row['Exclusive Shelf'] || '',
    num_pages:       parseInt(row['Number of Pages'] || '0', 10) || 0,
    date_read:       row['Date Read'] || '',
    bookshelves:     row['Bookshelves'] || '',
    cover_url:       null,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Stars({ n }) {
  return (
    <span style={{ color: 'var(--star)', fontSize: '12px' }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  );
}

const SHELF_LABELS = {
  read:              { emoji: '✅', label: 'Leído',         color: 'var(--success)' },
  'currently-reading':{ emoji: '📖', label: 'Leyendo',      color: 'var(--accent-2)' },
  'to-read':         { emoji: '🔖', label: 'Quiero leer',  color: 'var(--text-muted)' },
};

function ShelfBadge({ shelf }) {
  const info = SHELF_LABELS[shelf] || { emoji: '📚', label: shelf, color: 'var(--text-muted)' };
  return (
    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '100px', background: 'var(--surface-3)', color: info.color, border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
      {info.emoji} {info.label}
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function GoodreadsImporter({ token, onClose, onSuccess }) {
  const { isMobile } = useBreakpoint();
  const fileRef = useRef(null);
  const [step,     setStep]     = useState('upload'); // upload | preview | importing | done
  const [books,    setBooks]    = useState([]);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [filter,   setFilter]   = useState('all');   // all | read | to-read | currently-reading

  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Por favor subí un archivo .csv exportado de GoodReads.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      const mapped = rows.map(mapRow).filter(b => b.gr_book_id);
      if (!mapped.length) {
        setError('No se encontraron libros. ¿Es el archivo correcto?');
        return;
      }
      setBooks(mapped);
      setStep('preview');
      setError('');
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const doImport = async () => {
    setStep('importing');
    try {
      const res = await api.importGoodreads(token, books);
      setResult(res);
      setStep('done');
    } catch (err) {
      setError(err.message);
      setStep('preview');
    }
  };

  const filtered = filter === 'all' ? books : books.filter(b => b.exclusive_shelf === filter);

  const stats = {
    total:   books.length,
    read:    books.filter(b => b.exclusive_shelf === 'read').length,
    reading: books.filter(b => b.exclusive_shelf === 'currently-reading').length,
    want:    books.filter(b => b.exclusive_shelf === 'to-read').length,
    rated:   books.filter(b => b.my_rating > 0).length,
  };

  return (
    <div
      className="fadeIn"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '16px' }}
    >
      <div
        className="scaleIn"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: isMobile ? '20px 20px 0 0' : '20px', width: '100%', maxWidth: isMobile ? '100%' : '760px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      >
        {/* Header */}
        <div style={{ padding: isMobile ? '20px 20px 16px' : '28px 32px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {isMobile && <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-2)', margin: '0 auto 16px' }} />}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #e07b39, #f7c948)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 0 16px rgba(224,123,57,0.35)' }}>📗</div>
                <h2 style={{ fontSize: isMobile ? '18px' : '22px' }}>Importar desde GoodReads</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {step === 'upload'    && 'Subí tu archivo de exportación de GoodReads (.csv)'}
                {step === 'preview'   && `${books.length} libros encontrados · Revisá antes de importar`}
                {step === 'importing' && 'Importando tu biblioteca...'}
                {step === 'done'      && '¡Importación completada!'}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', lineHeight: 1, flexShrink: 0, marginLeft: '12px' }}>×</button>
          </div>

          {/* Step indicators */}
          {step !== 'done' && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
              {['upload', 'preview', 'importing'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === s ? 'var(--accent)' : (i < ['upload','preview','importing'].indexOf(step) ? 'var(--success)' : 'var(--surface-3)'), border: `1px solid ${step === s ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: step === s || i < ['upload','preview','importing'].indexOf(step) ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                    {i < ['upload','preview','importing'].indexOf(step) ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '12px', color: step === s ? 'var(--text)' : 'var(--text-muted)', display: isMobile ? 'none' : 'inline' }}>
                    {s === 'upload' ? 'Subir archivo' : s === 'preview' ? 'Revisar' : 'Importar'}
                  </span>
                  {i < 2 && <div style={{ width: isMobile ? '12px' : '24px', height: '1px', background: 'var(--border)' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '28px 32px' }}>

          {/* ── STEP: upload ── */}
          {step === 'upload' && (
            <div>
              {/* Instructions */}
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '10px' }}>Cómo exportar tu biblioteca de GoodReads:</p>
                <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {['Ingresá a goodreads.com y andá a "My Books"', 'Abajo a la izquierda, hacé click en "Import and export"', 'Clickeá "Export Library" y esperá el email', 'Descargá el archivo .csv que te enviaron', 'Subilo acá 👇'].map((s, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s}</li>
                  ))}
                </ol>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-2)'}`, borderRadius: '16px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-sub)' : 'var(--surface-2)', transition: 'all 0.2s' }}
              >
                <div style={{ fontSize: '44px', marginBottom: '12px' }}>📂</div>
                <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Arrastá el archivo acá</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>o hacé click para seleccionarlo</p>
                <span style={{ padding: '8px 20px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>Elegir archivo .csv</span>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>

              {error && (
                <div style={{ marginTop: '14px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: '10px', padding: '12px 16px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>
              )}
            </div>
          )}

          {/* ── STEP: preview ── */}
          {step === 'preview' && (
            <div>
              {/* Stats summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Total',         val: stats.total,   emoji: '📚' },
                  { label: 'Leídos',         val: stats.read,    emoji: '✅' },
                  { label: 'Leyendo',        val: stats.reading, emoji: '📖' },
                  { label: 'Por leer',       val: stats.want,    emoji: '🔖' },
                  { label: 'Con calificación',val: stats.rated,  emoji: '⭐' },
                ].map(({ label, val, emoji }) => (
                  <div key={label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{emoji}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '20px', fontWeight: '800' }}>{val}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', padding: '3px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', width: 'fit-content' }}>
                {['all', 'read', 'currently-reading', 'to-read'].map(f => {
                  const labels = { all: 'Todos', read: '✅ Leídos', 'currently-reading': '📖 Leyendo', 'to-read': '🔖 Por leer' };
                  return (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: filter === f ? '700' : '400', background: filter === f ? 'var(--accent)' : 'transparent', color: filter === f ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: "'Figtree',sans-serif', whiteSpace: 'nowrap" }}>
                      {labels[f]}
                    </button>
                  );
                })}
              </div>

              {/* Book list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto', marginBottom: '4px' }}>
                {filtered.slice(0, 200).map((book, i) => (
                  <div key={book.gr_book_id + i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{book.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {book.my_rating > 0 && <Stars n={book.my_rating} />}
                      <ShelfBadge shelf={book.exclusive_shelf} />
                    </div>
                  </div>
                ))}
                {filtered.length > 200 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '8px' }}>… y {filtered.length - 200} más</p>
                )}
              </div>

              {error && (
                <div style={{ marginTop: '10px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: '10px', padding: '12px 16px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>
              )}
            </div>
          )}

          {/* ── STEP: importing ── */}
          {step === 'importing' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
              <div style={{ width: '56px', height: '56px', border: '4px solid var(--border-2)', borderTop: '4px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Importando {books.length} libros...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', animation: 'pulse 1.5s ease infinite' }}>Esto puede tardar unos segundos</p>
            </div>
          )}

          {/* ── STEP: done ── */}
          {step === 'done' && result && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>¡Importación exitosa!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>Tu biblioteca de GoodReads ya está en PaperBoxd</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
                {[
                  { val: result.imported_reviews,  label: 'Reseñas importadas', emoji: '✍️' },
                  { val: result.imported_progress, label: 'Libros en biblioteca', emoji: '📚' },
                  { val: result.skipped,           label: 'Ya existían', emoji: '⏭️' },
                ].map(({ val, label, emoji }) => (
                  <div key={label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 12px' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{emoji}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>{val}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={onClose} className="btn-ghost" style={{ padding: '12px 24px' }}>Cerrar</button>
                <button onClick={onSuccess} style={{ padding: '12px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", boxShadow: '0 0 20px var(--accent-glow)' }}>
                  Ver mi biblioteca →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(step === 'upload' || step === 'preview') && (
          <div style={{ padding: isMobile ? '16px 20px' : '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
            {step === 'preview' && (
              <button onClick={() => { setStep('upload'); setBooks([]); setError(''); }} className="btn-ghost" style={{ padding: '11px 20px' }}>
                ← Cambiar archivo
              </button>
            )}
            {step === 'preview' && (
              <button onClick={doImport} style={{ padding: '11px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", boxShadow: '0 0 16px var(--accent-glow)' }}>
                Importar {books.length} libros →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}