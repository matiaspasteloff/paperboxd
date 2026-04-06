import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useBreakpoint } from '../hooks/useBreakpoint';

const PALETTES = [
    { id: 'night', bg: '#030b16', text: '#ddeeff', accent: '#388bfd', label: '🌊 Noche' },
    { id: 'sepia', bg: '#1a1208', text: '#f0e8d0', accent: '#d4a355', label: '📜 Sepia' },
    { id: 'noir', bg: '#0a0a0a', text: '#f0f0f0', accent: '#c0ff00', label: '⚡ Noir' },
    { id: 'dusk', bg: '#1a0d2e', text: '#f0d8ff', accent: '#cc88ff', label: '🌅 Crepúsculo' },
    { id: 'forest', bg: '#0d1a0d', text: '#d8f0d8', accent: '#55cc88', label: '🌿 Bosque' },
];

export default function QuoteCard({ token, onClose }) {
    const { isMobile } = useBreakpoint();
    const canvasRef = useRef(null);
    const [text, setText] = useState('');
    const [bookTitle, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [palette, setPalette] = useState(PALETTES[0]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { drawCanvas(); }, [text, bookTitle, author, palette]);

    const wrapText = (ctx, txt, x, y, maxW, lineH) => {
        const words = txt.split(' ');
        let line = '', lines = [];
        for (let word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxW && line !== '') { lines.push(line.trim()); line = word + ' '; }
            else { line = test; }
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
        ctx.fillStyle = palette.bg; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = palette.accent + '18'; ctx.lineWidth = 0.5;
        for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
        for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }
        ctx.fillStyle = palette.accent; ctx.fillRect(48, 60, 4, H - 120);
        ctx.font = 'bold 80px Georgia, serif'; ctx.fillStyle = palette.accent + '33'; ctx.fillText('"', 70, 140);
        if (text) {
            ctx.font = 'italic 22px Georgia, serif'; ctx.fillStyle = palette.text;
            const lines = wrapText(ctx, text, 80, 180, W - 160, 34);
            const afterY = 180 + lines * 34 + 20;
            if (bookTitle) { ctx.font = '600 14px system-ui, sans-serif'; ctx.fillStyle = palette.accent; ctx.fillText('— ' + bookTitle + (author ? ', ' + author : ''), 80, afterY + 20); }
        } else {
            ctx.font = 'italic 18px Georgia, serif'; ctx.fillStyle = palette.text + '44';
            ctx.fillText('Escribí una cita para previsualizar...', 80, 220);
        }
        ctx.font = '600 13px system-ui, sans-serif'; ctx.fillStyle = palette.accent + '88';
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
            await api.addQuote(token, { open_library_work_id: 'unknown', book_title: bookTitle, author_name: author, quote_text: text });
            setSaved(true); setTimeout(() => setSaved(false), 2500);
        } catch { } finally { setSaving(false); }
    };

    return (
        <div className="fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
            <div className="scaleIn" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: isMobile ? '20px 20px 0 0' : '20px', padding: isMobile ? '8px 16px 28px' : '28px', width: '100%', maxWidth: isMobile ? '100%' : '900px', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>

                {isMobile && <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-2)', margin: '12px auto 16px' }} />}
                <button onClick={onClose} style={{ position: 'absolute', top: isMobile ? '16px' : '14px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer' }}>×</button>

                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>✨ Crear tarjeta de cita</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '22px' }}>Generá una imagen para compartir en redes</p>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                    {/* Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <Label>Cita o frase</Label>
                            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribí la cita aquí..." style={{ width: '100%', minHeight: '88px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: isMobile ? '16px' : '14px', padding: '11px 14px', resize: 'vertical', fontFamily: "'Figtree',sans-serif", fontStyle: 'italic', outline: 'none' }} onFocus={e => (e.target.style.borderColor = 'var(--border-3)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                        </div>
                        <div><Label>Título del libro</Label><input className="input-field" value={bookTitle} onChange={e => setTitle(e.target.value)} placeholder="El nombre de la rosa" /></div>
                        <div><Label>Autor/a</Label><input className="input-field" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Umberto Eco" /></div>
                        <div>
                            <Label>Paleta de colores</Label>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {PALETTES.map(p => (
                                    <button key={p.id} onClick={() => setPalette(p)} style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '500', background: palette.id === p.id ? p.accent : 'var(--surface-3)', color: palette.id === p.id ? p.bg : 'var(--text-muted)', border: `1px solid ${palette.id === p.id ? p.accent : 'var(--border)'}`, cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>{p.label}</button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveQuote} disabled={!text || saving} style={{ flex: 1, padding: '11px', background: saved ? 'var(--success)' : 'var(--accent-sub)', color: saved ? '#fff' : 'var(--accent-2)', border: '1px solid var(--border-2)', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: !text ? 'not-allowed' : 'pointer', fontFamily: "'Figtree',sans-serif", opacity: !text ? 0.5 : 1 }}>
                                {saved ? '✓ Guardada' : '💾 Guardar'}
                            </button>
                            <button onClick={download} disabled={!text} style={{ flex: 1, padding: '11px', background: text ? 'var(--accent)' : 'var(--surface-3)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: !text ? 'not-allowed' : 'pointer', fontFamily: "'Figtree',sans-serif", opacity: !text ? 0.5 : 1, boxShadow: text ? '0 0 16px var(--accent-glow)' : 'none' }}>
                                ⬇ Descargar
                            </button>
                        </div>
                    </div>

                    {/* Canvas preview */}
                    <div>
                        <Label>Vista previa</Label>
                        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '10px', border: '1px solid var(--border)', display: 'block' }} />
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>PNG listo para Instagram / Twitter</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Label({ children }) {
    return <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>{children}</p>;
}