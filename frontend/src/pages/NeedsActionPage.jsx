import React, { useState } from 'react';
import PriorityBadge from '../components/PriorityBadge';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { senderInitial, isHighPriority } from '../lib/ui';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'done', label: 'Not urgent' },
];

export default function NeedsActionPage({
  actionEmails = [],
  onOpenEmail,
  onOpenDraftAssistant,
  onMarkResolved,
}) {
  const [filter, setFilter] = useState('all');

  const visible = actionEmails
    .filter((email) => {
      if (filter === 'urgent') {
        return isHighPriority(email.priority);
      }

      if (filter === 'done') {
        return !isHighPriority(email.priority);
      }

      return true;
    })
    .sort(
      (a, b) =>
        (isHighPriority(b.priority) ? 1 : 0) -
        (isHighPriority(a.priority) ? 1 : 0)
    );

  return (
    <div className="page-shell section-stack dissolve-section">

      {/* ================= HEADER ================= */}
      <div className="section-head">
        <div>
          <h1>Needs action</h1>

          <p style={{ marginTop: 'var(--space-1)' }}>
            Emails that need your attention.
          </p>
        </div>

        <div className="segmented">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={filter === f.id ? 'is-active' : ''}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {visible.length === 0 ? (
        <section className="card">
          <EmptyState
            type="needs-action"
            title="You’re all caught up 🎉"
            description="No emails currently need your attention. Refresh the demo to reload simulated action items."
          />
        </section>
      ) : (

        /* ================= EMAIL GRID ================= */
        <div
          className="equal-grid"
          style={{
            alignItems: 'start',
          }}
        >
          {visible.map((email, idx) => (
            <article
              key={email.id}
              className="card card-hover-box stagger-box"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minWidth: 0,
                overflow: 'hidden',
                animationDelay: `${idx * 65}ms`,
              }}
            >

              {/* ================= SENDER ================= */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    minWidth: '34px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--rose-tint)',
                    color: 'var(--rose-deep)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--rose-tint-strong)',
                  }}
                >
                  {senderInitial(email.sender?.name, email.sender?.email)}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {email.sender?.name || 'Unknown sender'}
                  </div>

                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--ink-faint)',
                      marginTop: '2px',
                    }}
                  >
                    {email.date_display || 'Recently'}
                  </div>
                </div>

                <PriorityBadge priority={email.priority} />
              </div>

              {/* ================= SUBJECT ================= */}
              <div>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.35,
                    margin: 0,
                    color: 'var(--ink)',
                  }}
                >
                  {email.subject || 'No subject'}
                </h3>
              </div>

              {/* ================= AI ACTION ================= */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '0.78rem',
                  color: 'var(--rose-deep)',
                  fontWeight: 600,
                  minWidth: 0,
                }}
              >
                <Sparkles
                  size={14}
                  color="var(--rose)"
                  strokeWidth={2}
                  style={{
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {email.action_text || 'Review this email'}
                </span>
              </div>

              {/* ================= BOTTOM ROW ================= */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border)',
                  minWidth: 0,
                }}
              >

                {/* CATEGORY */}
                <CategoryChip category={email.category} />

                {/* PUSH ACTIONS TO RIGHT */}
                <div
                  style={{
                    flex: 1,
                  }}
                />

                {/* DONE */}
                <button
                  type="button"
                  onClick={() =>
                    onMarkResolved &&
                    onMarkResolved(email.id)
                  }
                  className="btn-quiet"
                  style={{
                    fontSize: '0.76rem',
                    padding: '6px 7px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Check size={13} />
                  <span>Done</span>
                </button>

                {/* REPLY */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenDraftAssistant &&
                    onOpenDraftAssistant(email)
                  }
                  className="btn-quiet"
                  style={{
                    fontSize: '0.76rem',
                    padding: '6px 7px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Sparkles size={13} />
                  <span>Reply</span>
                </button>

                {/* OPEN */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenEmail &&
                    onOpenEmail(email)
                  }
                  className="btn-primary"
                  style={{
                    fontSize: '0.76rem',
                    padding: '6px 10px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span>Open</span>
                  <ArrowRight size={12} />
                </button>

              </div>

            </article>
          ))}
        </div>
      )}

    </div>
  );
}