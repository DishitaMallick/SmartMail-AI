import React from 'react';
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react';

const HIGHLIGHTS = [
  '15 realistic fictional email scenarios across 6 smart categories',
  'Automated priority classification and actionable deadline detection',
  'AI executive summaries paired with complete original email content',
  'Interactive contextual AI reply draft synthesis',
];

export default function LoginPage({ onEnterDemo }) {
  const handleDemoClick = () => {
    if (onEnterDemo) {
      onEnterDemo();
    }
  };

  return (
    <div
      className="textured-canvas"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        fontFamily: 'var(--font-family)',
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: 'var(--space-8) var(--space-7)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Brand */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(140deg, var(--rose) 0%, var(--rose-deep) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-5)',
            boxShadow: '0 10px 24px rgba(139, 74, 90, 0.28)',
          }}
        >
          <Mail size={30} color="#FFFFFF" />
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)', letterSpacing: '-0.01em' }}>
          SmartMail <span style={{ color: 'var(--rose)' }}>AI</span>
        </h1>

        <p
          style={{
            fontSize: '0.96rem',
            lineHeight: 1.6,
            marginBottom: 'var(--space-6)',
            color: 'var(--ink-soft)',
          }}
        >
          Interactive product demo: explore automated email prioritization, executive summaries, and smart action items.
        </p>

        <button
          type="button"
          onClick={handleDemoClick}
          className="btn-primary card-hover-box"
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: '1rem',
            gap: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(183, 110, 121, 0.35)',
          }}
        >
          <Sparkles size={18} />
          <span>Explore Interactive Demo</span>
        </button>

        <div
          style={{
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-5)',
            borderTop: '1px solid var(--line-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            textAlign: 'left',
          }}
        >
          {HIGHLIGHTS.map((line) => (
            <div key={line} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <Sparkles size={15} color="var(--rose)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', lineHeight: 1.45 }}>{line}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          color: 'var(--ink-faint)',
          fontSize: '0.8rem',
        }}
      >
        <CheckCircle2 size={14} color="var(--rose)" />
        <span>Self-contained demo with simulated fictional scenarios</span>
      </div>
    </div>
  );
}
