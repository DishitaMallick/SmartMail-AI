import React from 'react';
import { LayoutDashboard, Inbox, AlertCircle, Clock, FolderKanban, Settings, Sparkles, X } from 'lucide-react';
import { getAllCategories, categoryIcon } from '../lib/ui';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'important', label: 'Important', icon: AlertCircle },
  { id: 'needs-action', label: 'Needs Action', icon: Clock },
  { id: 'categories', label: 'Categories', icon: FolderKanban },
];

export default function Sidebar({
  currentView,
  setCurrentView,
  selectedCategory,
  setSelectedCategory,
  categoriesStats = [],
  customCategories = [],
  unreadCount = 0,
  needsActionCount = 0,
  importantCount = 0,
  authUser,
  isMobileOpen = false,
  closeMobile,
}) {
  const badgeFor = (id) => {
    if (id === 'inbox') return unreadCount;
    if (id === 'important') return importantCount;
    if (id === 'needs-action') return needsActionCount;
    return 0;
  };

  // Only categories that actually contain emails in the latest batch.
  const statsByName = new Map((categoriesStats || []).map((c) => [(c.name || '').toLowerCase(), c]));
  const allCats = getAllCategories(customCategories);
  const activeCategories = allCats
    .map((c) => ({
      ...c,
      count: statsByName.get(c.name.toLowerCase())?.count ?? 0,
    }))
    .filter((c) => c.count > 0);

  const handleNav = (view, cat = null) => {
    setCurrentView(view);
    setSelectedCategory(cat);
    if (closeMobile) closeMobile();
  };

  const navButtonStyle = (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    background: isActive ? 'rgba(183, 110, 121, 0.35)' : 'transparent',
    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.78)',
    fontWeight: isActive ? 600 : 400,
    fontFamily: 'inherit',
    fontSize: '0.92rem',
    cursor: 'pointer',
    marginBottom: '2px',
    transition: 'background-color 0.15s ease',
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeMobile}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(74, 38, 50, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 90,
          opacity: isMobileOpen ? 1 : 0,
          pointerEvents: isMobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      <aside
        style={{
          width: '264px',
          background: 'linear-gradient(180deg, #4A2632 0%, #3B2130 100%)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: isMobileOpen ? '10px 0 35px rgba(59, 33, 48, 0.45)' : 'none',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={() => handleNav('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF', padding: 0 }}
          >
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(140deg, var(--rose) 0%, var(--rose-deep) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Sparkles size={20} color="#FFFFFF" />
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              SmartMail <span style={{ color: 'var(--blush)' }}>AI</span>
            </span>
          </button>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: 'var(--space-4) var(--space-3)', flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            const badge = badgeFor(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                style={navButtonStyle(isActive)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Icon size={17} color={isActive ? '#FFFFFF' : 'var(--blush)'} />
                  <span>{item.label}</span>
                </span>
                {badge > 0 && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255, 255, 255, 0.16)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          {activeCategories.length > 0 && (
            <>
              <div
                style={{
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.42)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: 'var(--space-5) var(--space-3) var(--space-2)',
                }}
              >
                Categories
              </div>
              {activeCategories.map((cat) => {
                const isActive = currentView === 'inbox' && selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleNav('inbox', cat.name)}
                    style={navButtonStyle(isActive)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: '0.95rem' }}>{categoryIcon(cat.name)}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)' }}>{cat.count}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Account */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(183, 110, 121, 0.5)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#FFFFFF' }}>
                abc@gmail.com
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--blush)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Demo Workspace
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNav('settings')}
            style={{ ...navButtonStyle(currentView === 'settings'), marginTop: 'var(--space-3)' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Settings size={17} color={currentView === 'settings' ? '#FFFFFF' : 'var(--blush)'} />
              <span>Settings</span>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
