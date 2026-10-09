/**
 * SmartMail AI frontend API client.
 * Talks to the Python backend only — there are no local/demo fallbacks here.
 * Errors are thrown as ApiError with a short, user-friendly message.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.code = code;
    this.message = message;
    this.status = status;
  }
}

// Maps backend failure codes to short, friendly sentences.
const FRIENDLY_ERRORS = {
  network: 'Cannot reach SmartMail AI. Please make sure the app is running and try again.',
  not_connected: 'Your Gmail account is not connected. Please connect it to continue.',
  token_expired: 'Your Google session has expired. Please connect your Gmail account again.',
  permission_denied: 'SmartMail AI does not have permission to read this Gmail account. Please reconnect.',
  api_disabled: 'Gmail access is not switched on for this app yet. Please try again later.',
  rate_limited: 'Too many requests right now. Please wait a moment and sync again.',
  gmail_unavailable: 'Gmail is temporarily unavailable. Please try again in a moment.',
  gmail_error: 'We could not reach your Gmail account. Please try again.',
  access_denied: 'Gmail access was not granted, so SmartMail AI cannot continue.',
  setup_needed: 'Google sign-in is not set up for this app yet. Please contact the app owner.',
  connect_failed: 'We could not finish connecting your Gmail account. Please try again.',
  server_error: 'SmartMail AI ran into a problem. Please try again in a moment.',
};

function friendlyMessage(code, fallback) {
  return FRIENDLY_ERRORS[code] || fallback || 'Something went wrong. Please try again.';
}

/** Public helper so the UI can translate backend codes (e.g. auth errors). */
export function friendlyError(code, fallback) {
  return friendlyMessage(code, fallback);
}

/**
 * Pulls {code, message} out of a FastAPI error response.
 * Backend handlers return detail as either a string or {code, message}.
 */
async function toApiError(res) {
  let code = 'server_error';
  let message;
  try {
    const body = await res.json();
    if (body && body.detail) {
      if (typeof body.detail === 'string') {
        message = body.detail;
      } else if (typeof body.detail === 'object') {
        code = body.detail.code || code;
        message = body.detail.message;
      }
    }
  } catch {
    // Ignore body parse failures; fall through to generic message.
  }
  return new ApiError(code, friendlyMessage(code, message), res.status);
}

function networkError(err) {
  return new ApiError('network', FRIENDLY_ERRORS.network);
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw networkError();
  }
  if (!res.ok) {
    throw await toApiError(res);
  }
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function post(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function patch(path, body) {
  return request(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/* ------------------------------------------------------------------ */
/* Authentication (real Google OAuth 2.0)                              */
/* ------------------------------------------------------------------ */

export async function getAuthUrl() {
  return request('/auth/google');
}

export async function getSession() {
  return request('/auth/session');
}

export async function disconnectGmail() {
  return post('/auth/disconnect');
}

/* ------------------------------------------------------------------ */
/* Gmail connection status & sync                                      */
/* ------------------------------------------------------------------ */

export async function getGmailStatus() {
  return request('/gmail/status');
}

export async function syncGmail() {
  return post('/gmail/sync');
}

/* ------------------------------------------------------------------ */
/* Emails                                                              */
/* ------------------------------------------------------------------ */

export async function fetchEmails(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.append('category', params.category);
  if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
  if (params.needs_action !== undefined) query.append('needs_action', params.needs_action);
  if (params.is_unread !== undefined) query.append('is_unread', params.is_unread);
  if (params.q) query.append('q', params.q);
  if (params.sort) query.append('sort', params.sort);
  return request(`/emails?${query.toString()}`);
}

export async function fetchEmailById(id) {
  return request(`/emails/${id}`);
}

export async function markEmailRead(id, isRead = true) {
  return patch(`/emails/${id}/read`, { is_read: isRead });
}

export async function updateEmailCategory(id, category) {
  return patch(`/emails/${id}/category`, { category });
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export async function fetchDashboardSummary() {
  return request('/categories/summary');
}

/* ------------------------------------------------------------------ */
/* AI helpers                                                          */
/* ------------------------------------------------------------------ */

export async function generateAIDraft(emailId, intent = 'Follow-up', prompt = '') {
  return post('/emails/draft-reply', { email_id: emailId, intent, prompt });
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export async function fetchSettings() {
  return request('/settings');
}

export async function updateSettings(settings) {
  return request('/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
