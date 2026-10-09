import React from 'react';
import { AlertCircle, Inbox, Clock, CheckCircle2 } from 'lucide-react';

export default function SummaryCards({
  importantCount = 0,
  unreadCount = 0,
  needsActionCount = 0,
  organizedCount = 0,
  onCardClick,
}) {
  const cards = [
    {
      id: 'important',
      label: 'Important',
      count: importantCount,
      icon: AlertCircle,
    },
    {
      id: 'unread',
      label: 'Unread',
      count: unreadCount,
      icon: Inbox,
    },
    {
      id: 'needs_action',
      label: 'Needs action',
      count: needsActionCount,
      icon: Clock,
    },
    {
      id: 'organized',
      label: 'Organized',
      count: organizedCount,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="card card-hover-box stagger-box"
            onClick={() => onCardClick?.(card.id)}
            style={{
              padding: '16px 18px',
              cursor: onCardClick ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              minHeight: '82px',
              animationDelay: `${idx * 70}ms`,
            }}
          >
            {/* ICON */}
            <div
              style={{
                width: '38px',
                height: '38px',
                minWidth: '38px',
                flexShrink: 0,
                borderRadius: '10px',
                backgroundColor: 'var(--rose-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                size={17}
                color="var(--rose-deep)"
                strokeWidth={2}
              />
            </div>

            {/* COUNT + LABEL */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              <div
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: 'var(--ink)',
                }}
              >
                {card.count}
              </div>

              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: 'var(--ink-soft)',
                }}
              >
                {card.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}