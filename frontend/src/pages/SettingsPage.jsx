import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Bell, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { categoryIcon } from '../lib/ui';

export default function SettingsPage({
  settings,
  authUser,
  onSaveSettings,
  onResetDemo,
}) {
  const [customCategories, setCustomCategories] = useState(
    () => settings?.custom_categories || ['Interviews', 'University', 'Design']
  );
  const [newCategory, setNewCategory] = useState('');
  const [notifications, setNotifications] = useState(() => ({
    important_alerts: true,
    desktop_push: true,
    daily_briefing: true,
    action_reminders: true,
    ...(settings?.notifications || {}),
  }));

  // Keep in sync when settings prop updates
  useEffect(() => {
    if (settings?.custom_categories) {
      setCustomCategories(settings.custom_categories);
    }
    if (settings?.notifications) {
      setNotifications((prev) => ({ ...prev, ...settings.notifications }));
    }
  }, [settings]);

  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name || customCategories.some((c) => c.toLowerCase() === name.toLowerCase())) return;
    setCustomCategories([...customCategories, name]);
    setNewCategory('');
  };

  const handleRemoveCategory = (name) => {
    setCustomCategories(customCategories.filter((c) => c !== name));
  };

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    if (onSaveSettings) {
      onSaveSettings({
        ...(settings || {}),
        custom_categories: customCategories,
        notifications,
      });
    }
  };

  const handleCancel = () => {
    setCustomCategories(settings?.custom_categories || ['Interviews', 'University', 'Design']);
    setNotifications({
      important_alerts: true,
      desktop_push: true,
      daily_briefing: true,
      action_reminders: true,
      ...(settings?.notifications || {}),
    });
    setNewCategory('');
  };

  return (
    <div className="page-shell section-stack dissolve-section" style={{ maxWidth: '840px' }}>
      {/* Title & Subtitle */}
      <div>
        <h1>Settings</h1>
        <p style={{ marginTop: 'var(--space-1)', color: 'var(--ink-soft)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* 1. Connected account Card */}
      <section
        className="card"
        style={{
          padding: 'var(--space-5) var(--space-6)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--ink)' }}>
          Connected account
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--rose)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(183, 110, 121, 0.28)',
              }}
            >
              {authUser?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--ink)' }}>
                {authUser?.name?.toUpperCase() || 'ABC'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--ink-faint)', marginTop: '2px' }}>
                {authUser?.email || 'abc@gmail.com'}
              </div>
            </div>
          </div>

          {onResetDemo && (
            <button
              type="button"
              onClick={onResetDemo}
              className="btn-secondary"
            >
              Disconnect
            </button>
          )}
        </div>
      </section>

      {/* 2. Personalized Categories Card */}
      <section
        className="card"
        style={{
          padding: 'var(--space-5) var(--space-6)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--ink)' }}>
          Personalized Categories
        </h2>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <input
            className="input"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCategory();
            }}
            placeholder="e.g. Clients, Tax, Travel, Academics"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="btn-primary"
            disabled={!newCategory.trim()}
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>

        {customCategories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {customCategories.map((cat) => (
              <span
                key={cat}
                className="chip"
                style={{
                  backgroundColor: 'var(--rose-tint)',
                  borderColor: 'var(--rose-tint-strong)',
                  color: 'var(--rose-deep)',
                  padding: '6px 12px',
                  fontSize: '0.84rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{categoryIcon(cat)}</span>
                <span style={{ fontWeight: 600 }}>{cat}</span>
                <Trash2
                  size={13}
                  style={{ cursor: 'pointer', opacity: 0.75, transition: 'opacity 0.15s' }}
                  onClick={() => handleRemoveCategory(cat)}
                  aria-label={`Remove ${cat}`}
                  title="Remove category"
                />
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 3. Notifications Card */}
      <section
        className="card"
        style={{
          padding: 'var(--space-5) var(--space-6)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--ink)' }}>
          Notifications
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Main wireframe toggle: Important email alerts */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 0',
              cursor: 'pointer',
            }}
            onClick={() => handleToggle('important_alerts')}
          >
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--ink)' }}>
                Important email alerts
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginTop: '2px' }}>
                Notify when high-priority or urgent action items are detected
              </div>
            </div>

            <div
              className={`toggle-switch ${notifications.important_alerts ? 'is-active' : ''}`}
              role="switch"
              aria-checked={Boolean(notifications.important_alerts)}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle('important_alerts');
              }}
            >
              <div className="toggle-switch-thumb" />
            </div>
          </div>

          {/* Desktop Push Notifications */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 0',
              borderTop: '1px solid var(--line-soft)',
              paddingTop: 'var(--space-4)',
              cursor: 'pointer',
            }}
            onClick={() => handleToggle('desktop_push')}
          >
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--ink)' }}>
                Desktop push notifications
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginTop: '2px' }}>
                Instant desktop alerts when new incoming messages arrive
              </div>
            </div>

            <div
              className={`toggle-switch ${notifications.desktop_push ? 'is-active' : ''}`}
              role="switch"
              aria-checked={Boolean(notifications.desktop_push)}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle('desktop_push');
              }}
            >
              <div className="toggle-switch-thumb" />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={handleCancel}
          className="btn-secondary"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
