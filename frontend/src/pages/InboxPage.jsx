import React, { useState } from 'react';
import EmailRow from '../components/EmailRow';
import EmptyState from '../components/EmptyState';
import { ArrowUpDown } from 'lucide-react';
import { getAllCategories, categoryIcon } from '../lib/ui';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'important', label: 'Important' },
  { id: 'needs-action', label: 'Needs action' },
];

export default function InboxPage({
  emails = [],
  searchQuery = '',
  selectedCategory = null,
  customCategories = [],
  activeFilter = 'all',
  setActiveFilter,
  sortBy = 'newest',
  setSortBy,
  isLoading = false,
  onOpenEmail,
  onOpenDraftAssistant,
  onBatchCategorize,
  onResetSearch,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const allCategories = getAllCategories(customCategories);

  const isSearching = Boolean(searchQuery && searchQuery.trim());

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const applyCategory = (name) => {
    if (onBatchCategorize) onBatchCategorize(selectedIds, name);
    clearSelection();
  };

  return (
    <div className="page-shell section-stack dissolve-section">
      {/* Header */}
      <div className="section-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <h1>
              {isSearching
                ? `Results for "${searchQuery}"`
                : selectedCategory
                ? `${selectedCategory} emails`
                : 'Inbox'}
            </h1>
            {isSearching && (
              <button
                type="button"
                onClick={onResetSearch}
                className="btn-quiet"
                style={{
                  fontSize: '0.78rem',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--rose-tint-strong)',
                  backgroundColor: 'var(--rose-tint)',
                  color: 'var(--rose-deep)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear search ✕
              </button>
            )}
          </div>
          <p style={{ marginTop: 'var(--space-1)' }}>
            {isSearching
              ? `${emails.length} ${emails.length === 1 ? 'email' : 'emails'} found across sender names, subjects, and email contents.`
              : `${emails.length} ${emails.length === 1 ? 'email' : 'emails'} from your latest sync.`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div className="segmented">
            {FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={activeFilter === tab.id ? 'is-active' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="input"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: 'auto', padding: '8px 12px' }}
          >
            <ArrowUpDown size={14} color="var(--ink-faint)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort emails"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Most important</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.length > 0 && (
        <div
          className="card animate-slide-down"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            backgroundColor: '#3B2130',
            borderColor: '#3B2130',
          }}
        >
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#FFFFFF' }}>
            {selectedIds.length} selected — move to
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {allCategories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => applyCategory(cat.name)}
                className="btn-quiet"
                style={{ color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.12)', fontSize: '0.8rem' }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
            <button type="button" onClick={clearSelection} className="btn-quiet" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <section className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse-soft"
                style={{ height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-sunken)' }}
              />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <EmptyState
            type={isSearching ? 'search' : 'inbox'}
            title={isSearching ? `No results for "${searchQuery}"` : 'Nothing to show here'}
            description={
              isSearching
                ? 'We searched sender names, email addresses, subjects, message bodies, and labels. Try different terms or clear your search.'
                : 'No emails match this view yet. Try clearing your filters or resetting search.'
            }
            actionText={isSearching ? 'Clear search' : 'Clear filters'}
            onAction={onResetSearch}
          />
        ) : (
          emails.map((email, idx) => (
            <EmailRow
              key={email.id}
              email={email}
              index={idx}
              isSelected={selectedIds.includes(email.id)}
              onSelect={toggleSelect}
              onClick={onOpenEmail}
              onQuickDraft={onOpenDraftAssistant}
            />
          ))
        )}
      </section>
    </div>
  );
}
