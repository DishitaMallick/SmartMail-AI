import React from 'react';
import { CheckCircle2, RotateCcw, X, AlertCircle } from 'lucide-react';

export default function Toast({ toast, onUndo, onDismiss }) {
  if (!toast) return null;

  const isError = toast.tone === 'error';

  return (
    <div
      className="animate-slide-down"
      role="status"
      style={{
        backgroundColor: '#3B2130',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      {isError ? <AlertCircle size={18} color="var(--blush)" /> : <CheckCircle2 size={18} color="var(--lilac)" />}

      <div style={{ flex: 1, fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.4 }}>{toast.message}</div>

      {toast.batchId && onUndo && (
        <button
          type="button"
          onClick={() => onUndo(toast.batchId)}
          className="btn-primary"
          style={{ padding: '5px 12px', fontSize: '0.78rem', gap: '5px' }}
        >
          <RotateCcw size={12} />
          <span>Undo</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => onDismiss && onDismiss(toast.id)}
        aria-label="Dismiss"
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', padding: '2px' }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
