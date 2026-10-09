import React from 'react';
import EmailRow from '../components/EmailRow';
import EmptyState from '../components/EmptyState';
import { isHighPriority } from '../lib/ui';

export default function ImportantPage({ emails = [], onOpenEmail, onOpenDraftAssistant }) {
  const importantEmails = [...emails]
    .filter((e) => isHighPriority(e.priority) || e.is_starred)
    .sort((a, b) => {
      const rank = (p) => (p === 'Urgent' ? 0 : p === 'Important' ? 1 : 2);
      return rank(a.priority) - rank(b.priority) || new Date(b.timestamp) - new Date(a.timestamp);
    });

  return (
    <div className="page-shell section-stack dissolve-section">
      <div>
        <h1>Important</h1>
        <p style={{ marginTop: 'var(--space-1)' }}>
          Messages the AI flagged as urgent or important in your latest emails.
        </p>
      </div>

      <section className="card" style={{ overflow: 'hidden' }}>
        {importantEmails.length === 0 ? (
          <EmptyState
            type="important"
            title="No important emails right now"
            description="You’re on top of everything. Refresh the demo to check for simulated messages."
          />
        ) : (
          importantEmails.map((email, idx) => (
            <EmailRow
              key={email.id}
              email={email}
              index={idx}
              onClick={onOpenEmail}
              onQuickDraft={onOpenDraftAssistant}
            />
          ))
        )}
      </section>
    </div>
  );
}
