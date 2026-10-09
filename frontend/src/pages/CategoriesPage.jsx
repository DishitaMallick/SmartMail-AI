import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, Tag, Sparkles } from 'lucide-react';
import { getAllCategories, categoryIcon } from '../lib/ui';

export default function CategoriesPage({
  categoriesStats = [],
  customCategories = [],
  onSelectCategory,
  onAddCategory,
  onRemoveCategory,
}) {
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const allCats = getAllCategories(customCategories);
  const statsByName = new Map((categoriesStats || []).map((c) => [(c.name || '').toLowerCase(), c]));

  const list = allCats.map((c) => {
    const stat = statsByName.get(c.name.toLowerCase());
    return {
      name: c.name,
      icon: categoryIcon(c.name),
      isCustom: c.isCustom || stat?.is_custom || false,
      count: stat?.count ?? 0,
      unread: stat?.unread_count ?? 0,
      recentSubject: stat?.recent_subject || null,
      recentSender: stat?.recent_sender || null,
    };
  });

  const handleCreate = (e) => {
    e?.preventDefault();
    const name = newCatInput.trim();
    if (!name) return;
    if (onAddCategory) {
      onAddCategory(name);
      setNewCatInput('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="page-shell section-stack dissolve-section">
      <div className="section-head">
        <div>
          <h1>Categories</h1>
          <p style={{ marginTop: 'var(--space-1)' }}>
            How SmartMail AI organizes your inbox across default and custom categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="btn-primary"
          style={{ gap: 'var(--space-2)' }}
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Close Creator' : 'Add Custom Category'}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="card card-pad animate-slide-down"
          style={{
            border: '1.5px solid var(--rose)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={16} color="var(--rose)" />
            <h2 style={{ fontSize: '1.05rem' }}>Create a New Category</h2>
          </div>
          <p style={{ fontSize: '0.86rem' }}>
            Add custom categories such as <strong>Clients</strong>, <strong>Tax</strong>, <strong>Travel</strong>, or <strong>Academics</strong>. SmartMail AI will automatically assign a matching icon and sort emails into it.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              style={{ flex: 1, minWidth: '220px' }}
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="e.g. Travel, Clients, Tax, Legal..."
              autoFocus
            />
            <button type="submit" className="btn-primary" disabled={!newCatInput.trim()}>
              <Plus size={15} />
              <span>Add Category</span>
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="equal-grid">
        {list.map((cat, idx) => (
          <div
            key={cat.name}
            className="card card-hover-box stagger-box"
            style={{
              padding: 'var(--space-5)',
              textAlign: 'left',
              fontFamily: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              position: 'relative',
              animationDelay: `${idx * 45}ms`,
            }}
          >
            {/* Card Header with Icon, Badges, and optional delete for custom */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--rose-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {cat.icon}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {cat.isCustom && (
                  <span
                    className="chip"
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      backgroundColor: 'var(--lilac-tint)',
                      borderColor: 'var(--lilac)',
                      color: '#6B4E8A',
                      fontWeight: 700,
                    }}
                  >
                    <Tag size={10} />
                    Custom
                  </span>
                )}
                {cat.unread > 0 && <span className="chip chip-rose">{cat.unread} unread</span>}
                {cat.isCustom && onRemoveCategory && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCategory(cat.name);
                    }}
                    aria-label={`Delete ${cat.name} category`}
                    title="Delete category"
                    className="btn-quiet"
                    style={{ padding: '4px', borderRadius: '50%', color: 'var(--ink-faint)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {cat.name}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
                {cat.count} {cat.count === 1 ? 'email' : 'emails'}
              </span>
            </div>

            {cat.recentSubject ? (
              <div
                style={{
                  backgroundColor: 'var(--surface-muted)',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    color: 'var(--ink-faint)',
                    marginBottom: '2px',
                  }}
                >
                  {cat.recentSender || 'Latest'}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cat.recentSubject}
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>
                No emails in this category yet.
              </span>
            )}

            <button
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className="btn-quiet"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: 'var(--rose-deep)',
                marginTop: 'auto',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>View emails</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
