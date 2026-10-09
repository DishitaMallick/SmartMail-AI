import React from 'react';
import { Search, Sparkles, Menu } from 'lucide-react';

export default function Topbar({
  searchQuery,
  setSearchQuery,
  onOpenDraftAssistant,
  toggleMobileMenu,
  authUser,
  onShowMascot,
}) {
  return (
    <header
      style={{
        minHeight: '72px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxSizing: 'border-box',
        flexWrap: 'wrap',
      }}
    >
      {/* Left: menu + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: '240px', maxWidth: '560px' }}>
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="btn-quiet"
          aria-label="Menu"
          style={{ padding: '9px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}
        >
          <Menu size={18} />
        </button>

        <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '9px 14px' }}>
          <Search size={16} color="var(--ink-faint)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
              }
            }}
            placeholder="Search by sender, subject, body, or keywords…"
            aria-label="Search emails by sender name, subject, keywords, or content"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              width: '100%',
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              title="Clear search (Esc)"
              style={{
                border: 'none',
                background: 'var(--surface-sunken)',
                color: 'var(--ink-soft)',
                cursor: 'pointer',
                flexShrink: 0,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.74rem',
                fontWeight: 700,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--rose-tint)';
                e.currentTarget.style.color = 'var(--rose-deep)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-sunken)';
                e.currentTarget.style.color = 'var(--ink-soft)';
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: demo indicator + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--rose-tint)',
            border: '1px solid var(--rose-tint-strong)',
            color: 'var(--rose-deep)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.01em',
          }}
          title="Interactive Demo Mode"
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--rose)' }} />
          <span>Demo Mode</span>
        </div>

        <button
          type="button"
          onClick={onShowMascot}
          className="btn-quiet"
          title="Play Welcome Bird Animation"
          style={{ fontSize: '0.84rem', padding: '6px 11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}
        >
          <span style={{ fontSize: '1rem', marginRight: '3px' }}>🐦</span>
          <span style={{ fontWeight: 600 }}>Say Hi</span>
        </button>

        <button type="button" onClick={() => onOpenDraftAssistant()} className="btn-primary" style={{ fontSize: '0.86rem' }}>
          <Sparkles size={15} />
          <span>AI Compose</span>
        </button>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--line)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--ink)',
          }}
          title="abc@gmail.com"
        >
          <span
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'var(--rose)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            A
          </span>
          <span>abc@gmail.com</span>
        </div>
      </div>
    </header>
  );
}
