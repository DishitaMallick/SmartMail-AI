import React, { useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import AIInsightCard from '../components/AIInsightCard';
import PriorityBadge from '../components/PriorityBadge';
import CategoryChip from '../components/CategoryChip';
import { RefreshCw, AlertCircle, Inbox, Sparkles, ArrowRight } from 'lucide-react';
import { senderInitial, greeting, isHighPriority, priorityRank, syncLabel, cleanPlainText } from '../lib/ui';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'action', label: 'Needs action' },
  { id: 'important', label: 'Important' },
  { id: 'unread', label: 'Unread' },
];

export default function DashboardPage({
  summary,
  emails = [],
  isLoading = false,
  loadError = null,
  lastSyncedAt = null,
  onOpenEmail,
  onOpenDraftAssistant,
  onSyncGmail,
  isSyncing = false,
  onNavigateView,
}) {
  const [filter, setFilter] = useState('all');

  const latest = [...emails]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  const visible = latest.filter((email) => {
    if (filter === 'action') return email.needs_action;
    if (filter === 'important') return isHighPriority(email.priority);
    if (filter === 'unread') return !email.is_read;
    return true;
  });

  const counts = {
    important: latest.filter((e) => isHighPriority(e.priority)).length,
    unread: latest.filter((e) => !e.is_read).length,
    action: latest.filter((e) => e.needs_action).length,
    organized: latest.filter((e) => e.organized_status).length,
  };

  return (
    <div className="page-shell section-stack dissolve-section">
      {/* Header */}
      <div className="section-head">
        <div>
          <h1>{greeting()} 👋</h1>
          <p style={{ marginTop: 'var(--space-1)' }}>
            Your recent emails, already organized and analyzed by SmartMail AI.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', fontWeight: 600 }}>
            {syncLabel(lastSyncedAt)}
          </span>
          <button type="button" onClick={onSyncGmail} disabled={isSyncing} className="btn-primary">
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Refreshing…' : 'Refresh Demo'}</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards
        importantCount={summary?.important_count ?? counts.important}
        unreadCount={summary?.unread_count ?? counts.unread}
        needsActionCount={summary?.needs_action_count ?? counts.action}
        organizedCount={summary?.organized_count ?? counts.organized}
        onCardClick={(id) => {
          if (id === 'important') setFilter('important');
          else if (id === 'needs_action') setFilter('action');
          else if (id === 'unread') setFilter('unread');
          else if (id === 'organized') onNavigateView('categories');
        }}
      />

      {/* AI insight */}
      <AIInsightCard
        insight={summary?.ai_insight}
        needsActionCount={summary?.needs_action_count ?? counts.action}
        onReviewAction={() => setFilter('action')}
      />

      {/* Latest emails */}
      <section className="card">
        <div
          className="section-head"
          style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          <h2>Latest 10 emails</h2>
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

        {/* States */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse-soft"
                style={{ height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-sunken)' }}
              />
            ))}
          </div>
        ) : loadError ? (
          <div style={{ padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--blush-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
              }}
            >
              <AlertCircle size={24} color="var(--rose-deep)" />
            </div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>We couldn’t load your emails</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto var(--space-5)' }}>{loadError}</p>
            <button type="button" onClick={onSyncGmail} disabled={isSyncing} className="btn-primary">
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              <span>Try again</span>
            </button>
          </div>
        ) : latest.length === 0 ? (
          <div style={{ padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--lilac-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
              }}
            >
              <Inbox size={24} color="#6B4E8A" />
            </div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>No emails yet</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto var(--space-5)' }}>
              Tap “Refresh Demo” to reload the simulated email scenarios.
            </p>
            <button type="button" onClick={onSyncGmail} disabled={isSyncing} className="btn-primary">
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              <span>Refresh Demo</span>
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Nothing in this view</h3>
            <p style={{ marginBottom: 'var(--space-5)' }}>No emails match this filter right now.</p>
            <button type="button" onClick={() => setFilter('all')} className="btn-secondary">
              Show all emails
            </button>
          </div>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {visible.map((email, idx) => (
              <li
                key={email.id}
                onClick={() => onOpenEmail(email)}
                className="stagger-box card-hover-box"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4) var(--space-6)',
                  borderBottom: '1px solid var(--line-soft)',
                  cursor: 'pointer',
                  transition: 'background-color 0.18s ease, transform 0.18s ease',
                  animationDelay: `${idx * 60}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    minWidth: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--rose-tint)',
                    color: 'var(--rose-deep)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--rose-tint-strong)',
                  }}
                >
                  {senderInitial(email.sender?.name, email.sender?.email)}
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: email.is_read ? 600 : 700,
                        color: 'var(--ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '240px',
                      }}
                    >
                      {email.sender?.name || email.sender?.email}
                    </span>
                    {!email.is_read && (
                      <span
                        title="Unread"
                        style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--rose)', flexShrink: 0 }}
                      />
                    )}
                    <span style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>
                      {email.date_display || 'Recently'}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: email.is_read ? 500 : 700,
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {email.subject}
                  </div>

                  <div
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--ink-soft)',
                      lineHeight: 1.5,
                    }}
                  >
                    <Sparkles size={12} color="var(--rose)" style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
                    <span style={{ fontWeight: 500 }}>{cleanPlainText(email.summary || email.snippet)}</span>
                  </div>

                  {email.needs_action && email.action_text && (
                    <span className="chip chip-blush" style={{ marginTop: 'var(--space-1)', alignSelf: 'flex-start' }}>
                      {email.action_text}
                      {email.action_deadline ? ` · ${email.action_deadline}` : ''}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
                  <PriorityBadge priority={email.priority} />
                  <CategoryChip category={email.category} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {latest.length > 0 && (
        <button
          type="button"
          onClick={() => onNavigateView('inbox')}
          className="btn-quiet"
          style={{ alignSelf: 'center' }}
        >
          <span>Open full inbox</span>
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
