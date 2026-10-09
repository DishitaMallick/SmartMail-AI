/**
 * Shared presentation helpers used across the SmartMail AI interface.
 * Keeps category, priority and time wording consistent everywhere.
 */

export const DEFAULT_CATEGORIES = [
  { name: 'Work', icon: '💼' },
  { name: 'Personal', icon: '👤' },
  { name: 'Finance', icon: '💰' },
  { name: 'Promotions', icon: '📢' },
  { name: 'Social', icon: '👥' },
  { name: 'Other', icon: '📁' },
];

export const CATEGORIES = DEFAULT_CATEGORIES;

const KNOWN_ICONS = {
  Work: '💼',
  Personal: '👤',
  Finance: '💰',
  Promotions: '📢',
  Social: '👥',
  Other: '📁',
  Interviews: '🎯',
  University: '🎓',
  Design: '🎨',
  Clients: '🤝',
  Tax: '🧾',
  Travel: '✈️',
  Billing: '💳',
  Security: '🔒',
  Urgent: '⚡',
  Academics: '📚',
  Marketing: '📈',
  Legal: '⚖️',
  Health: '🩺',
  Shopping: '🛍️',
  Development: '💻',
};

export function categoryIcon(name) {
  if (!name) return '📁';
  if (KNOWN_ICONS[name]) return KNOWN_ICONS[name];

  const lower = name.toLowerCase();
  if (lower.includes('work') || lower.includes('job') || lower.includes('career')) return '💼';
  if (lower.includes('tax') || lower.includes('money') || lower.includes('finance') || lower.includes('invoice') || lower.includes('bill')) return '💰';
  if (lower.includes('travel') || lower.includes('trip') || lower.includes('flight') || lower.includes('hotel') || lower.includes('vacation')) return '✈️';
  if (lower.includes('school') || lower.includes('uni') || lower.includes('college') || lower.includes('academic') || lower.includes('course') || lower.includes('study')) return '🎓';
  if (lower.includes('design') || lower.includes('figma') || lower.includes('ui') || lower.includes('ux') || lower.includes('art')) return '🎨';
  if (lower.includes('interview') || lower.includes('hiring') || lower.includes('recruit')) return '🎯';
  if (lower.includes('code') || lower.includes('dev') || lower.includes('tech') || lower.includes('software')) return '💻';
  if (lower.includes('client') || lower.includes('customer') || lower.includes('partner') || lower.includes('vendor')) return '🤝';
  if (lower.includes('health') || lower.includes('doctor') || lower.includes('medical')) return '🩺';
  if (lower.includes('shop') || lower.includes('order') || lower.includes('store') || lower.includes('product') || lower.includes('cart')) return '🛍️';
  if (lower.includes('security') || lower.includes('alert') || lower.includes('protect') || lower.includes('auth')) return '🔒';
  if (lower.includes('social') || lower.includes('friend') || lower.includes('family')) return '👥';
  if (lower.includes('personal')) return '👤';
  if (lower.includes('promo') || lower.includes('deal') || lower.includes('discount') || lower.includes('offer')) return '📢';
  if (lower.includes('news') || lower.includes('digest')) return '📰';

  return '🏷️';
}

export function getAllCategories(customList = []) {
  const combined = [...DEFAULT_CATEGORIES];
  (customList || []).forEach((name) => {
    if (!name) return;
    const trimmed = name.trim();
    if (!combined.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      combined.push({ name: trimmed, icon: categoryIcon(trimmed), isCustom: true });
    }
  });
  return combined;
}

export function categoryLabel(name) {
  return name || 'Other';
}

/* ---------------------------- Priority ---------------------------- */

const PRIORITY_RANK = { Urgent: 0, Important: 1, Normal: 2, Low: 3 };

export function priorityRank(priority) {
  return PRIORITY_RANK[priority] ?? 4;
}

/** True for the two levels the dashboard treats as "needs attention". */
export function isHighPriority(priority) {
  return priority === 'Urgent' || priority === 'Important';
}

/** CSS class suffix for a priority badge. */
export function priorityClass(priority) {
  if (priority === 'Urgent') return 'is-urgent';
  if (priority === 'Important') return 'is-important';
  if (priority === 'Low') return 'is-low';
  return 'is-normal';
}

export function priorityLabel(priority) {
  return priority || 'Normal';
}

/* ------------------------------ Time ------------------------------ */

/** Turns an ISO timestamp into a short, human label. */
export function formatRelativeTime(value) {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Header label such as "Last synced: Just now". */
export function syncLabel(lastSyncedAt) {
  if (!lastSyncedAt) return 'Not synced yet';
  return `Last synced: ${formatRelativeTime(lastSyncedAt)}`;
}

/* ----------------------------- Senders ---------------------------- */

export function senderInitials(name = '', email = '') {
  const source = name.trim() || email.split('@')[0] || '?';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function senderInitial(name = '', email = '') {
  const source = name.trim() || email.split('@')[0] || '?';
  return (source.charAt(0) || '?').toUpperCase();
}

export function avatarUrlFor(sender = {}) {
  const initials = senderInitials(sender.name, sender.email);
  return initials;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Strips HTML, DOCTYPEs, CSS blocks, and entity strings for client-side display safety.
 * Preserves original paragraph structure — consecutive lines stay together,
 * only actual blank lines create paragraph breaks.
 */
export function cleanPlainText(text = '') {
  if (!text) return '';
  let str = String(text);

  const dummyPhrases = [
    'open it in a program that understands html',
    'to view this email message',
    'view this message in html',
    'unable to see this email',
    'if you are having trouble viewing',
    'click here to view in browser',
  ];

  // Remove script/style/head tags and content
  str = str.replace(/<(script|style|head)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  // Remove all HTML tags and doctypes
  str = str.replace(/<!DOCTYPE[^>]*>/gi, ' ');
  str = str.replace(/<[^>]+>/g, ' ');
  // Remove CSS rules like { ... }
  str = str.replace(/(?:[.#a-zA-Z0-9_\-\s]+)\s*\{[^}]*\}/g, ' ');
  // Unescape entity artifacts
  str = str.replace(/&[a-zA-Z0-9#]+;/g, ' ');
  str = str.replace(/\b(?:amp;)+/gi, ' ');
  // Remove standalone URLs
  str = str.replace(/https?:\/\/\S+/gi, ' ');

  // Group consecutive non-empty lines into paragraphs.
  // A blank line (or dummy line) signals a paragraph break.
  const paragraphs = [];
  let currentPara = [];

  const rawLines = str.split(/\r?\n/);
  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    const isDummy = dummyPhrases.some((dp) => trimmed.toLowerCase().includes(dp));

    if (trimmed && !isDummy) {
      currentPara.push(trimmed);
    } else {
      // Empty or dummy line → flush current paragraph
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
    }
  }

  // Don't forget the last paragraph
  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }

  return paragraphs.join('\n\n');
}

/**
 * Searches across all email fields: sender name, sender email, recipient,
 * subject, summary, snippet, full body text, action item, deadline,
 * AI reasoning tags, category, priority, labels, and dates.
 * Supports multi-word queries where every token must match.
 */
export function matchesSearchQuery(email, query) {
  if (!query || !query.trim()) return true;
  if (!email) return false;

  const rawQuery = query.trim().toLowerCase();

  // Extract all searchable fields into an array
  const searchableParts = [
    email.sender?.name,
    email.sender?.email,
    email.recipient,
    email.subject,
    email.summary,
    email.snippet,
    email.body_text,
    email.action_text,
    email.action_deadline,
    ...(Array.isArray(email.ai_reasons) ? email.ai_reasons : []),
    email.category,
    email.priority,
    ...(Array.isArray(email.gmail_labels) ? email.gmail_labels : []),
    ...(Array.isArray(email.tags) ? email.tags : []),
    email.date_display,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());

  const fullHaystack = searchableParts.join(' ');

  // 1. Direct phrase check
  if (fullHaystack.includes(rawQuery)) {
    return true;
  }

  // 2. Tokenized search (every word in the query must match somewhere in the email)
  const tokens = rawQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  return tokens.every((token) => fullHaystack.includes(token));
}

