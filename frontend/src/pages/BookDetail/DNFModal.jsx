import { useState } from 'react';

export default function DNFModal({ isMobile, onConfirm, onClose }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fadeIn" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
      <div className="scaleIn" style={{ background: 'var(--surface)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: isMobile ? '20px 20px 0 0' : '20px', padding: '28px', width: '100%', maxWidth: isMobile ? '100%' : '420px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>🚫 Marcar como DNF</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Este libro no afectará tus estadísticas ni tu reto anual.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="¿Por qué lo abandonaste? (opcional)"
          style={{ width: '100%', minHeight: '80px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: isMobile ? '16px' : '14px', padding: '11px 14px', resize: 'vertical', fontFamily: "'Figtree',sans-serif", outline: 'none', marginBottom: '16px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
          <button onClick={() => onConfirm(reason)} style={{ flex: 1, padding: '11px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>Confirmar DNF</button>
        </div>
      </div>
    </div>
  );
}