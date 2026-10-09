import React from 'react';
import { CheckCircle2, Inbox, Search, FolderOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function EmptyState({
  type = 'inbox',
  title,
  description,
  actionText,
  onAction,
  isActionLoading = false,
}) {
  const configs = {
    'needs-action': {
      icon: CheckCircle2,
      tint: 'var(--lilac-tint)',
      iconColor: '#6B4E8A',
      title: title || 'You’re all caught up 🎉',
      description: description || 'Nothing needs your attention right now.',
    },
    important: {
      icon: AlertCircle,
      tint: 'var(--blush-tint)',
      iconColor: 'var(--rose-deep)',
      title: title || 'No important emails right now',
      description: description || 'Everything urgent has been handled.',
    },
    search: {
      icon: Search,
      tint: 'var(--rose-tint)',
      iconColor: 'var(--rose-deep)',
      title: title || 'No matching emails',
      description: description || 'Try different words or clear your filters.',
    },
    categories: {
      icon: FolderOpen,
      tint: 'var(--lilac-tint)',
      iconColor: '#6B4E8A',
      title: title || 'Nothing here yet',
      description: description || 'No emails were placed in this category.',
    },
    error: {
      icon: AlertCircle,
      tint: 'var(--blush-tint)',
      iconColor: 'var(--rose-deep)',
      title: title || 'Something went wrong',
      description: description || 'Please try again in a moment.',
    },
    inbox: {
      icon: Inbox,
      tint: 'var(--rose-tint)',
      iconColor: 'var(--rose-deep)',
      title: title || 'No emails yet',
      description: description || 'Refresh the demo to explore simulated messages.',
    },
  };

  const config = configs[type] || configs.inbox;
  const Icon = config.icon;

  return (
    <div
      style={{
        padding: 'var(--space-8) var(--space-5)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: config.tint,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <Icon size={26} color={config.iconColor} />
      </div>

      <h3 style={{ marginBottom: 'var(--space-2)' }}>{config.title}</h3>
      <p style={{ maxWidth: '400px', marginBottom: actionText && onAction ? 'var(--space-5)' : 0 }}>
        {config.description}
      </p>

      {actionText && onAction && (
        <button type="button" onClick={onAction} disabled={isActionLoading} className="btn-primary">
          {type === 'error' && <RefreshCw size={15} className={isActionLoading ? 'animate-spin' : ''} />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
