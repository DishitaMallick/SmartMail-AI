import React from 'react';
import { categoryIcon } from '../lib/ui';

export default function CategoryChip({ category, onClick, active = false }) {
  return (
    <span
      onClick={onClick}
      className="category-chip"
      style={
        onClick
          ? {
              cursor: 'pointer',
              backgroundColor: active ? 'var(--rose-tint)' : 'var(--surface-muted)',
              borderColor: active ? 'var(--rose)' : 'var(--line)',
              color: active ? 'var(--rose-deep)' : 'var(--ink)',
            }
          : { cursor: 'default' }
      }
    >
      <span style={{ fontSize: '12px' }}>{categoryIcon(category)}</span>
      <span>{category || 'Other'}</span>
    </span>
  );
}
