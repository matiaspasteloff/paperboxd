import { useState, useRef, useEffect } from 'react';
import { api } from '../api';

const PALETTES = [
    { id: 'night', bg: '#030b16', text: '#ddeeff', accent: '#388bfd', label: 'Noche Azul' },
    { id: 'sepia', bg: '#1a1208', text: '#f0e8d0', accent: '#d4a355', label: 'Sepia' },
    { id: 'noir', bg: '#0a0a0a', text: '#f0f0f0', accent: '#c0ff00', label: 'Noir' },
    { id: 'dusk', bg: '#1a0d2e', text: '#f0d8ff', accent: '#cc88ff', label: 'Atardecer' },
    { id: 'forest', bg: '#0d1a0d', text: '#d8f0d8', accent: '#55cc88', label: 'Bosque' },
];

export default function QuoteCard({ books, token, onClose }) {
    const canvasRef = useRef(null);
    const [text, setText] = useState('');
    const [bookTitle, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [palette, setPalette] = useState(PALETTES[0]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [workId, setWorkId] = useState('');

    useEffect(() => { drawCanvas(); }, [text, bookTitle, author, palette]);

    const wrapText = (ctx, text, x, y, maxW, lineH) => {
        const words = text.split(' ');
        let line = '', lines = [];
        for (let word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxW && line !== '') {
                lines.push(line.trim());
                line = word + ' ';
            } else { line = test; }
        }
        if (line) lines.push(line.trim());
        lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
        return lines.length;
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = 800, H = 480;
        canvas.width = W; canvas.height = H;

        // Background
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, W, H);

        // Subtle grid
        ctx.strokeStyle = palette.accent + '18';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
        for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

        // Left accent bar
        ctx.fillStyle = palette.accent;
        ctx.fillRect(48, 60, 4, H - 120);

        // Decorative corner dots
        [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]].forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = palette.accent + '66'; ctx.fill();
        });

        // Quote marks
        ctx.font = 'bold 80px Georgia, serif';
        ctx.fillStyle = palette.accent + '33';
        ctx.fillText('"', 70, 140);

        // Quote text
        if (text) {
            ctx.font = 'italic 22px Georgia, serif';
            ctx.fillStyle = palette.text;
            const lines = wrapText(ctx, text, 80, 180, W - 160, 34);
            const afterY = 180 + lines * 34 + 20;

            // Book title
            if (bookTitle) {
                ctx.font = '600 14px system-ui, sans-serif';
                ctx.fillStyle = palette.accent;
                ctx.fillText('— ' + bookTitle + (author ? ', ' + author : ''), 80, afterY + 20);
            }
        } else {
            ctx.font = 'italic 18px Georgia, serif';
            ctx.fillStyle = palette.text + '44';
            ctx.fillText('Escribí una cita para previsualizar...', 80, 220);
        }

        // PaperBoxd watermark
        ctx.font = '600 13px system-ui, sans-serif';
        ctx.fillStyle = palette.accent + '88';
        ctx.fillText('PaperBoxd', W - 120, H - 30);
    };

    const download = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'paperboxd-quote.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const saveQuote = async () => {
        if (!text || !token) return;
        setSaving(true);
        try {
            await api.addQuote(token, { open_library_work_id: workId || 'unknown', book_title: bookTitle, author_name: author, quote_text: text });
            setSaved(true); setTimeout(() => setSaved(false), 2500);
        } catch { } finally { setSaving(false); }
    };

    return (
        <div className="fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()} style={{
            position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div className="scaleIn" style={{
                background: 'var(--surface)', border: '1px solid var(--border-2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '900px',
                maxHeight: '95vh', overflowY: 'auto',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                position: 'relative',
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer' }}>×</button>

                <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>✨ Crear tarjeta de cita</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Generá una imagen estética para compartir en redes sociales</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Left: controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <Label>Cita o frase</Label>
                            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribí la cita aquí..." style={{ width: '100%', minHeight: '100px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', padding: '11px 14px', resize: 'vertical', fontFamily: "'Figtree',sans-serif", lineHeight: 1.65, outline: 'none', fontStyle: 'italic' }} onFocus={e => (e.target.style.borderColor = 'var(--border-3)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                        </div>
                        <div>
                            <Label>Título del libro</Label>
                            <input className="input-field" value={bookTitle} onChange={e => setTitle(e.target.value)} placeholder="El nombre de la rosa" />
                        </div>
                        <div>
                            <Label>Autor/a</Label>
                            <input className="input-field" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Umberto Eco" />
                        </div>

                        <div>
                            <Label>Paleta de colores</Label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {PALETTES.map(p => (
                                    <button key={p.id} onClick={() => setPalette(p)} style={{
                                        padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '500',
                                        background: palette.id === p.id ? p.accent : 'var(--surface-3)',
                                        color: palette.id === p.id ? p.bg : 'var(--text-muted)',
                                        border: `1px solid ${palette.id === p.id ? p.accent : 'var(--border)'}`,
                                        cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s',
                                    }}>{p.label}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button onClick={saveQuote} disabled={!text || saving} style={{
                                flex: 1, padding: '11px', background: saved ? 'var(--success)' : 'var(--accent-sub)',
                                color: saved ? '#fff' : 'var(--accent-2)',
                                border: '1px solid var(--border-2)', borderRadius: '10px',
                                fontSize: '14px', fontWeight: '600', cursor: !text ? 'not-allowed' : 'pointer',
                                fontFamily: "'Figtree',sans-serif", opacity: !text ? 0.5 : 1, transition: 'all 0.2s',
                            }}>
                                {saved ? '✓ Guardada' : saving ? '...' : '💾 Guardar cita'}
                            </button>
                            <button onClick={download} disabled={!text} style={{
                                flex: 1, padding: '11px', background: text ? 'var(--accent)' : 'var(--surface-3)',
                                color: '#fff', border: 'none', borderRadius: '10px',
                                fontSize: '14px', fontWeight: '700', cursor: !text ? 'not-allowed' : 'pointer',
                                fontFamily: "'Figtree',sans-serif", opacity: !text ? 0.5 : 1,
                                boxShadow: text ? '0 0 16px var(--accent-glow)' : 'none',
                            }}>
                                ⬇ Descargar PNG
                            </button>
                        </div>
                    </div>

                    {/* Right: canvas preview */}
                    <div>
                        <Label>Vista previa</Label>
                        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)', display: 'block' }} />
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>Descargá como PNG para compartir en Instagram o Twitter/X</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Label({ children }) {
    return <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>{children}</p>;
}