import React, { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Connecting to your Gmail',
  'Reading your latest emails',
  'Sorting them into categories',
  'Spotting what matters most',
  'Writing short summaries',
  'Preparing your dashboard',
];

export default function OnboardingModal({ isOpen, onCompleteAnalysis }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return undefined;

    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => onCompleteAnalysis(), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 650);

    return () => clearInterval(interval);
  }, [isOpen, onCompleteAnalysis]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(59, 33, 48, 0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
      }}
    >
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: 'var(--space-7)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="animate-pulse-soft"
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: 'var(--rose-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-5)',
          }}
        >
          <Sparkles size={26} color="var(--rose-deep)" />
        </div>

        <h2 style={{ marginBottom: 'var(--space-2)' }}>Setting up your inbox</h2>
        <p style={{ marginBottom: 'var(--space-6)' }}>This only takes a moment.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', textAlign: 'left' }}>
          {ANALYSIS_STEPS.map((step, index) => {
            const isDone = index < activeStep;
            const isCurrent = index === activeStep;

            return (
              <div
                key={step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  fontSize: '0.9rem',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isDone ? 'var(--ink-soft)' : isCurrent ? 'var(--rose-deep)' : 'var(--ink-faint)',
                }}
              >
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDone ? 'var(--rose)' : isCurrent ? 'var(--rose-tint)' : 'var(--surface-sunken)',
                    border: isCurrent ? '1.5px solid var(--rose)' : 'none',
                  }}
                >
                  {isDone ? (
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: isCurrent ? 'var(--rose)' : 'var(--ink-faint)',
                      }}
                    />
                  )}
                </span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
