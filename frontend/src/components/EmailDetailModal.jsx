import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Clock, X } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import CategoryChip from './CategoryChip';
import { getAllCategories, senderInitial, cleanPlainText } from '../lib/ui';

export default function EmailDetailModal({
  email,
  customCategories = [],
  onClose,
  onOpenDraftAssistant,
  onChangeCategory,
}) {
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const allCategories = getAllCategories(customCategories);

  if (!email) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(59, 33, 48, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '86vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Email content */}
        <div style={{ flex: '1 1 62%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line)', minWidth: 0 }}>
          <div
            style={{
              padding: 'var(--space-4) var(--space-5)',
              borderBottom: '1px solid var(--line-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
            }}
          >
            <button type="button" onClick={onClose} className="btn-quiet">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button type="button" onClick={() => onOpenDraftAssistant(email)} className="btn-primary" style={{ fontSize: '0.84rem' }}>
              <Sparkles size={14} />
              <span>Draft a reply</span>
            </button>
          </div>

          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--line-soft)' }}>
            <h1 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-5)', lineHeight: 1.35 }}>{email.subject}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  minWidth: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--rose-tint)',
                  color: 'var(--rose-deep)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1.5px solid var(--rose-tint-strong)',
                }}
              >
                {senderInitial(email.sender?.name, email.sender?.email)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {email.sender?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {email.sender?.email}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{email.date_display || 'Recently'}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>
                  To {email.recipient || 'abc@gmail.com'}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-6)',
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.94rem',
              lineHeight: 1.75,
              color: 'var(--ink-soft)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {cleanPlainText(email.body_text || email.snippet) || 'No message content available.'}
          </div>
        </div>

        {/* AI panel */}
        <aside
          style={{
            flex: '1 1 38%',
            backgroundColor: 'var(--surface-muted)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
            overflowY: 'auto',
            overflowX: 'hidden',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={17} color="var(--rose)" />
            <h2 style={{ fontSize: '1rem' }}>What SmartMail AI found</h2>
          </div>

          {/* Summary */}
          <div
            className="card animate-box-entry"
            style={{
              padding: 'var(--space-4) var(--space-5)',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid rgba(183, 110, 121, 0.28)',
              boxShadow: '0 4px 16px rgba(74, 38, 50, 0.06)',
              borderRadius: 'var(--radius-lg)',
              height: 'auto',
              minHeight: 'unset',
              overflow: 'visible',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-2)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 800,
                  color: 'var(--rose-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Sparkles size={12} color="var(--rose)" />
                <span>Executive Summary</span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--rose-tint)',
                  color: 'var(--rose-deep)',
                  fontWeight: 700,
                }}
              >
                AI Generated
              </span>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '0.92rem',
                lineHeight: 1.65,
                color: 'var(--ink)',
                fontWeight: 500,
                whiteSpace: 'pre-wrap',
                overflow: 'visible',
                display: 'block',
                wordBreak: 'break-word',
              }}
            >
              {cleanPlainText(email.summary) || 'No summary available for this email.'}
            </p>
          </div>

          {/* Category */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: 'var(--ink-faint)' }}>
                Category
              </span>
              {onChangeCategory && (
                <button
                  type="button"
                  onClick={() => setIsChangingCategory((v) => !v)}
                  style={{ background: 'none', border: 'none', color: 'var(--rose-deep)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {isChangingCategory ? 'Cancel' : 'Change'}
                </button>
              )}
            </div>

            {isChangingCategory ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {allCategories.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      onChangeCategory(email.id, cat.name);
                      setIsChangingCategory(false);
                    }}
                    className="chip"
                    style={{
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      backgroundColor: email.category === cat.name ? 'var(--rose-tint)' : 'var(--surface-muted)',
                      borderColor: email.category === cat.name ? 'var(--rose)' : 'var(--line)',
                      color: email.category === cat.name ? 'var(--rose-deep)' : 'var(--ink)',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <CategoryChip category={email.category} />
            )}
          </div>

          {/* Priority */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: 'var(--ink-faint)', marginBottom: 'var(--space-3)' }}>
              Priority
            </div>
            <PriorityBadge priority={email.priority} />
          </div>

          {/* Action */}
          {email.needs_action && (
            <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--blush-tint)', borderColor: 'var(--blush)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--rose-deep)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                <Clock size={13} />
                <span>Next step</span>
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ink)' }}>
                {email.action_text || 'Review this email'}
              </div>
              {email.action_deadline && (
                <div style={{ fontSize: '0.8rem', color: 'var(--rose-deep)', marginTop: '4px', fontWeight: 600 }}>
                  By {email.action_deadline}
                </div>
              )}
            </div>
          )}

          <button type="button" onClick={onClose} className="btn-secondary" style={{ marginTop: 'auto' }}>
            <X size={14} />
            <span>Close</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
