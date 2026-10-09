import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIInsightCard({ insight, needsActionCount = 0, onReviewAction }) {
  const headlines = insight?.headline || null;
  const deadlines = insight?.deadlines_count ?? 0;
  const payments = insight?.payments_count ?? 0;
  const responses = needsActionCount;

  return (
    <section
      className="card"
      style={{
        padding: 'var(--space-5) var(--space-6)',
        borderColor: 'var(--blush)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-5)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            alignSelf: 'flex-start',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--rose-deep)',
          }}
        >
          <Sparkles size={14} />
          Today’s insight
        </span>

        <h2 style={{ fontWeight: 700 }}>
          {headlines ||
            (responses > 0
              ? `${responses} email${responses === 1 ? '' : 's'} may need your attention.`
              : 'Everything looks nicely organized.')}
        </h2>

        {(deadlines > 0 || responses > 0 || payments > 0) && (
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {deadlines > 0 && (
              <span className="chip chip-blush">
                {deadlines} with a deadline
              </span>
            )}
            {responses > 0 && (
              <span className="chip chip-rose">
                {responses} awaiting a reply
              </span>
            )}
            {payments > 0 && (
              <span className="chip chip-lilac">
                {payments} payment reminder{payments === 1 ? '' : 's'}
              </span>
            )}
          </div>
        )}
      </div>

      {responses > 0 && (
        <button type="button" onClick={onReviewAction} className="btn-primary">
          <span>Review</span>
          <ArrowRight size={16} />
        </button>
      )}
    </section>
  );
}
