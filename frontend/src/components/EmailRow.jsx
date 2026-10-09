import React from 'react';
import { Check, Clock, Sparkles } from 'lucide-react';
import { senderInitial, categoryIcon, cleanPlainText } from '../lib/ui';

const PRIORITY_DOT = {
  Urgent: '#8B4A5A',
  Important: '#B76E79',
  Normal: '#C7A9E8',
  Low: '#D9C7CD',
};

export default function EmailRow({ email, isSelected = false, onSelect, onClick, onQuickDraft, index = 0 }) {
  const dotColor = PRIORITY_DOT[email.priority] || PRIORITY_DOT.Normal;

  return (
    <div
      onClick={() => onClick && onClick(email)}
      className="stagger-box"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        backgroundColor: isSelected ? 'var(--rose-tint)' : !email.is_read ? 'var(--surface-muted)' : 'transparent',
        borderBottom: '1px solid var(--line-soft)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, transform 0.15s ease',
        animationDelay: `${index * 55}ms`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = !email.is_read ? 'var(--surface-muted)' : 'transparent';
        }
      }}
    >
      {/* Selection */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect(email.id);
        }}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={0}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '5px',
          border: isSelected ? '1.5px solid var(--rose)' : '1.5px solid var(--line)',
          backgroundColor: isSelected ? 'var(--rose)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
      </div>

      <div
        style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          borderRadius: '10px',
          backgroundColor: 'var(--rose-tint)',
          color: 'var(--rose-deep)',
          fontWeight: 700,
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid var(--rose-tint-strong)',
        }}
      >
        {senderInitial(email.sender?.name, email.sender?.email)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: dotColor,
              flexShrink: 0,
            }}
            title={`${email.priority || 'Normal'} priority`}
          />
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: email.is_read ? 600 : 700,
              color: 'var(--ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px',
            }}
          >
            {email.sender?.name || email.sender?.email}
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--ink-faint)', whiteSpace: 'nowrap' }}>
            {categoryIcon(email.category)} {email.category}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.88rem',
            fontWeight: email.is_read ? 500 : 700,
            color: 'var(--ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {email.subject}
        </span>

        <span
          style={{
            fontSize: '0.82rem',
            color: 'var(--ink-soft)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Sparkles size={11} color="var(--rose)" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
          {cleanPlainText(email.summary || email.snippet)}
        </span>
      </div>

      {/* Deadline */}
      {email.needs_action && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onQuickDraft && onQuickDraft(email);
          }}
          className="chip chip-blush"
          title={email.action_text || 'Needs your attention'}
        >
          <Clock size={11} />
          <span>{email.action_deadline || 'Action needed'}</span>
        </span>
      )}

      {/* Time */}
      <span
        style={{
          width: '76px',
          textAlign: 'right',
          fontSize: '0.74rem',
          fontWeight: email.is_read ? 400 : 600,
          color: email.is_read ? 'var(--ink-faint)' : 'var(--ink-soft)',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {email.date_display || 'Recently'}
      </span>
    </div>
  );
}
