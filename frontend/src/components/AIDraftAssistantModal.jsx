import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Briefcase, MessageSquare, X, Check, Copy, ArrowLeft, AlertCircle } from 'lucide-react';
import { generateAIDraft } from '../services/api';
import { generateDemoDraft } from '../services/demoData';

const TEMPLATES = [
  { id: 'Meeting', label: 'Meeting', hint: 'Confirm a time that works', icon: Calendar },
  { id: 'Proposal', label: 'Updates', hint: 'Share progress clearly', icon: Briefcase },
  { id: 'Follow-up', label: 'Follow-up', hint: 'A polite nudge', icon: MessageSquare },
];

export default function AIDraftAssistantModal({ isOpen, onClose, targetEmail = null, onNotify, isDemoMode = false }) {
  const [step, setStep] = useState('create'); // create | ready
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [editedBody, setEditedBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setPrompt('');
    setStep('create');
    setDraft(null);
    setEditedBody('');
    setError(null);
    setCopied(false);
  }, [isOpen, targetEmail]);

  if (!isOpen) return null;

  const handleGenerate = async (intent) => {
    setIsGenerating(true);
    setError(null);

    // If in demo mode or demo email, generate instantly from realistic synthesis engine
    if (isDemoMode || targetEmail?.id?.startsWith('demo_')) {
      setTimeout(() => {
        const res = generateDemoDraft(targetEmail?.id, intent, prompt);
        setDraft(res);
        setEditedBody(res.body || '');
        setStep('ready');
        setIsGenerating(false);
      }, 350);
      return;
    }

    try {
      const res = await generateAIDraft(targetEmail?.id, intent, prompt);
      setDraft(res);
      setEditedBody(res.body || '');
      setStep('ready');
    } catch (err) {
      // Graceful fallback to demo generator if network/offline
      const fallback = generateDemoDraft(targetEmail?.id, intent, prompt);
      if (fallback) {
        setDraft(fallback);
        setEditedBody(fallback.body || '');
        setStep('ready');
      } else {
        setError(err.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onNotify) onNotify('Draft copied — paste it into your email.');
    } catch {
      if (onNotify) onNotify('Could not copy automatically. Please select and copy the text.', 'error');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(59, 33, 48, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 100,
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
          maxWidth: '500px',
          maxHeight: '88vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--rose-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="var(--rose-deep)" />
            </span>
            <div>
              <h2 style={{ fontSize: '1.05rem' }}>AI reply draft</h2>
              <p style={{ fontSize: '0.82rem' }}>
                {targetEmail ? `Replying to ${targetEmail.sender?.name}` : 'Write a new message'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn-quiet"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              alignItems: 'flex-start',
              background: 'var(--blush-tint)',
              border: '1px solid var(--blush)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <AlertCircle size={16} color="var(--rose-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.84rem', color: 'var(--rose-deep)' }}>{error}</span>
          </div>
        )}

        {/* Compose */}
        {step === 'create' && (
          <>
            <textarea
              className="input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 300))}
              placeholder="What should this email say?"
              rows={3}
              style={{ resize: 'none', marginBottom: 'var(--space-5)' }}
            />

            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 'var(--space-3)' }}>
              Start from a template
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleGenerate(tpl.id)}
                    disabled={isGenerating}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      background: '#FFFFFF',
                    }}
                  >
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--rose-tint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color="var(--rose-deep)" />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>{tpl.label}</span>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ink-faint)' }}>{tpl.hint}</span>
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--rose-deep)' }}>
                      {isGenerating ? '…' : 'Write'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleGenerate('Follow-up')}
              disabled={isGenerating}
              className="btn-primary"
              style={{ width: '100%', padding: '13px' }}
            >
              <Sparkles size={17} />
              <span>{isGenerating ? 'Writing…' : 'Write a draft'}</span>
            </button>
          </>
        )}

        {/* Draft ready */}
        {step === 'ready' && draft && (
          <>
            <button type="button" onClick={() => setStep('create')} className="btn-quiet" style={{ marginBottom: 'var(--space-4)' }}>
              <ArrowLeft size={15} />
              <span>Write another</span>
            </button>

            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
              {draft.subject}
            </div>

            <textarea
              className="input"
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              rows={8}
              style={{ resize: 'vertical', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}
            />

            {draft.smart_tip && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start',
                  backgroundColor: 'var(--lilac-tint)',
                  border: '1px solid var(--lilac)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <Sparkles size={15} color="#6B4E8A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.84rem', color: '#6B4E8A', lineHeight: 1.5 }}>{draft.smart_tip}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="button" onClick={handleCopy} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy draft'}</span>
              </button>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '12px 18px' }}>
                Close
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--ink-faint)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
              Copy this into your email app to send it.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
