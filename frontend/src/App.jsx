import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import NeedsActionPage from './pages/NeedsActionPage';
import ImportantPage from './pages/ImportantPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import EmailDetailModal from './components/EmailDetailModal';
import AIDraftAssistantModal from './components/AIDraftAssistantModal';
import WelcomeBirdMascot from './components/WelcomeBirdMascot';
import Toast from './components/Toast';

import {
  DEMO_USER,
  INITIAL_DEMO_EMAILS,
  getInitialDemoEmails,
  saveDemoEmails,
  resetDemoEmails,
  calculateDemoSummary,
  getDemoSettings,
  saveDemoSettings,
} from './services/demoData';
import { isHighPriority, priorityRank, matchesSearchQuery } from './lib/ui';

export default function App() {
  // ── Self-contained portfolio demo state ───────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authUser] = useState(DEMO_USER);

  // ── Navigation ───────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Demo inbox data ──────────────────────────────────────────────
  const [settings, setSettings] = useState(() => getDemoSettings());
  const [emails, setEmails] = useState(() => getInitialDemoEmails());
  const [summary, setSummary] = useState(() =>
    calculateDemoSummary(getInitialDemoEmails(), getDemoSettings()?.custom_categories || [])
  );

  // ── Refresh state ────────────────────────────────────────────────
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingEmails] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date().toISOString());

  // ── Modals & toasts ──────────────────────────────────────────────
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showWelcomeMascot, setShowWelcomeMascot] = useState(() => {
    // Show mascot animation on arrival (once per browser session)
    const hasSeen = sessionStorage.getItem('smartmail_mascot_seen');
    if (!hasSeen) {
      sessionStorage.setItem('smartmail_mascot_seen', 'true');
      return true;
    }
    return false;
  });
  const [draftAssistantState, setDraftAssistantState] = useState({ isOpen: false, targetEmail: null });
  const [toasts, setToasts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */
  const addToast = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone: options.tone || 'success' }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options.tone === 'error' ? 8000 : 5000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ------------------------------------------------------------------ */
  /* Reset / Refresh Demo Inbox                                          */
  /* ------------------------------------------------------------------ */
  const handleRefreshDemo = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      const resetList = resetDemoEmails();
      setEmails(resetList);
      setSummary(calculateDemoSummary(resetList, settings?.custom_categories || []));
      setLastSyncedAt(new Date().toISOString());
      setIsSyncing(false);
      addToast('Demo inbox refreshed with 15 simulated scenarios.');
    }, 450);
  };

  /* ------------------------------------------------------------------ */
  /* Interactive Actions (100% Local State)                              */
  /* ------------------------------------------------------------------ */
  const handleOpenEmail = (email) => {
    setSelectedEmail(email);

    // Opening an email marks it as read in local demo state
    if (email && !email.is_read) {
      setEmails((prev) => {
        const next = prev.map((e) => (e.id === email.id ? { ...e, is_read: true } : e));
        saveDemoEmails(next);
        setSummary(calculateDemoSummary(next, settings?.custom_categories || []));
        return next;
      });
    }
  };

  const handleMarkResolved = (emailId) => {
    setEmails((prev) => {
      const next = prev.map((e) => (e.id === emailId ? { ...e, needs_action: false } : e));
      saveDemoEmails(next);
      setSummary(calculateDemoSummary(next, settings?.custom_categories || []));
      return next;
    });
    addToast('Marked as done.');
  };

  const handleChangeCategory = (emailId, newCategory) => {
    setEmails((prev) => {
      const next = prev.map((e) =>
        e.id === emailId ? { ...e, category: newCategory, organized_status: true } : e
      );
      saveDemoEmails(next);
      setSummary(calculateDemoSummary(next, settings?.custom_categories || []));
      return next;
    });
    if (selectedEmail?.id === emailId) {
      setSelectedEmail((prev) => ({ ...prev, category: newCategory }));
    }
    addToast(`Moved to ${newCategory}.`);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveDemoSettings(newSettings);
    setSummary(calculateDemoSummary(emails, newSettings?.custom_categories || []));
    addToast('Preferences saved.');
  };

  const handleAddCategory = (catName) => {
    const trimmed = (catName || '').trim();
    if (!trimmed) return;
    const current = settings?.custom_categories || [];
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      addToast(`Category "${trimmed}" already exists.`, { tone: 'error' });
      return;
    }
    const updated = [...current, trimmed];
    handleSaveSettings({ ...(settings || {}), custom_categories: updated });
    addToast(`Category "${trimmed}" added.`);
  };

  const handleRemoveCategory = (catName) => {
    const current = settings?.custom_categories || [];
    const updated = current.filter((c) => c !== catName);
    handleSaveSettings({ ...(settings || {}), custom_categories: updated });
    addToast(`Category "${catName}" removed.`);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query && query.trim() && currentView !== 'inbox') {
      setCurrentView('inbox');
    }
  };

  /* ------------------------------------------------------------------ */
  /* Derived lists                                                       */
  /* ------------------------------------------------------------------ */
  const getFilteredEmails = () =>
    emails
      .filter((e) => {
        if (selectedCategory && e.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;

        if (activeFilter === 'unread' && e.is_read) return false;
        if (activeFilter === 'important' && !isHighPriority(e.priority)) return false;
        if (activeFilter === 'needs-action' && !e.needs_action) return false;

        if (!matchesSearchQuery(e, searchQuery)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
        if (sortBy === 'priority') return priorityRank(a.priority) - priorityRank(b.priority);
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

  const filteredEmails = getFilteredEmails();
  const needsActionList = emails.filter((e) => e.needs_action);
  const unreadList = emails.filter((e) => !e.is_read);
  const importantList = emails.filter((e) => isHighPriority(e.priority));

  /* ------------------------------------------------------------------ */
  /* Landing / Welcome Screen (if ever exited)                           */
  /* ------------------------------------------------------------------ */
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onEnterDemo={() => setIsAuthenticated(true)} />
        <div className="toast-fixed">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </div>
      </>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Connected SmartMail AI Dashboard                                   */
  /* ------------------------------------------------------------------ */
  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoriesStats={summary?.categories}
        customCategories={settings?.custom_categories || []}
        unreadCount={unreadList.length}
        needsActionCount={needsActionList.length}
        importantCount={importantList.length}
        authUser={authUser}
        isMobileOpen={isMobileMenuOpen}
        closeMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="main-content">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          onOpenDraftAssistant={(email = null) => setDraftAssistantState({ isOpen: true, targetEmail: email })}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          authUser={authUser}
          onShowMascot={() => setShowWelcomeMascot(true)}
        />

        {currentView === 'dashboard' && (
          <DashboardPage
            summary={summary}
            emails={emails}
            isLoading={isLoadingEmails}
            loadError={null}
            lastSyncedAt={lastSyncedAt}
            onOpenEmail={handleOpenEmail}
            onOpenDraftAssistant={(e) => setDraftAssistantState({ isOpen: true, targetEmail: e })}
            onSyncGmail={handleRefreshDemo}
            isSyncing={isSyncing}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === 'inbox' && (
          <InboxPage
            emails={filteredEmails}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            customCategories={settings?.custom_categories || []}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isLoading={isLoadingEmails}
            onOpenEmail={handleOpenEmail}
            onOpenDraftAssistant={(e) => setDraftAssistantState({ isOpen: true, targetEmail: e })}
            onBatchCategorize={(ids, cat) => ids.forEach((id) => handleChangeCategory(id, cat))}
            onResetSearch={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setActiveFilter('all');
            }}
          />
        )}

        {currentView === 'needs-action' && (
          <NeedsActionPage
            actionEmails={needsActionList}
            onOpenEmail={handleOpenEmail}
            onOpenDraftAssistant={(e) => setDraftAssistantState({ isOpen: true, targetEmail: e })}
            onMarkResolved={handleMarkResolved}
          />
        )}

        {currentView === 'important' && (
          <ImportantPage
            emails={importantList}
            onOpenEmail={handleOpenEmail}
            onOpenDraftAssistant={(e) => setDraftAssistantState({ isOpen: true, targetEmail: e })}
          />
        )}

        {currentView === 'categories' && (
          <CategoriesPage
            categoriesStats={summary?.categories}
            customCategories={settings?.custom_categories || []}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onSelectCategory={(catName) => {
              setSelectedCategory(catName);
              setCurrentView('inbox');
            }}
          />
        )}

        {currentView === 'settings' && (
          <SettingsPage
            settings={settings}
            authUser={authUser}
            onSaveSettings={handleSaveSettings}
            onResetDemo={handleRefreshDemo}
          />
        )}
      </div>

      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          customCategories={settings?.custom_categories || []}
          onClose={() => setSelectedEmail(null)}
          onOpenDraftAssistant={(e) => setDraftAssistantState({ isOpen: true, targetEmail: e })}
          onChangeCategory={handleChangeCategory}
        />
      )}

      <AIDraftAssistantModal
        isOpen={draftAssistantState.isOpen}
        targetEmail={draftAssistantState.targetEmail}
        isDemoMode={true}
        onClose={() => setDraftAssistantState({ isOpen: false, targetEmail: null })}
        onNotify={(message, tone) => addToast(message, { tone })}
      />

      {showWelcomeMascot && (
        <WelcomeBirdMascot onComplete={() => setShowWelcomeMascot(false)} />
      )}

      <div className="toast-fixed">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
}
