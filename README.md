# SmartMail AI — AI-Powered Gmail Organizer

> **Your inbox, organized.** Connect your Gmail account and SmartMail AI reads your
> **10 most recent emails**, sorts them into clear categories, spots what matters, and
> writes a short summary for each one.

This is a **real Gmail integration** — no mock inbox, no fake login, no demo data.
Authentication happens through Google's own OAuth 2.0 consent screen and emails are
read with the official Gmail API.

---

## Flow

```
Open app → Connect Gmail → Continue with Google → Google consent
   → SmartMail AI dashboard → latest 10 real emails → AI processing
   → category + priority + summary → "Sync Gmail" re-reads the newest 10
```

## Palette

| Colour | Hex | Used for |
| --- | --- | --- |
| Rose gold | `#B76E79` | Primary actions, highlights |
| Blush | `#F4C2C2` | Soft accents, attention states |
| Deep mauve | `#8B4A5A` | Dark surfaces, strong text |
| Soft lilac | `#E6D8FF` | AI accents, secondary highlights |

The background is a layered, textured wash (colour gradients + fine dot weave) — never a flat fill.

---

## Architecture

```
Gmail API  →  Python backend  →  Email processing (AI)  →  SQLite  →  FastAPI  →  React frontend
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| Frontend | `frontend/` | UI only. Never holds Google secrets. |
| API | `backend/routes/` | Auth, Gmail, emails, categories, settings endpoints |
| Gmail access | `backend/services/gmail_service.py` | OAuth tokens, Gmail API calls, sync, dedup |
| AI processing | `backend/services/classifier.py`, `email_analyzer.py` | Category, priority, action detection, summary |
| Storage | `backend/db.py` + `backend/data/smartmail.db` | SQLite: sessions + processed emails |

### What the AI does with each email

- **Category** — Work, Personal, Finance, Promotions, Social, Other (content + sender based, never hard-coded)
- **Priority** — Urgent, Important, Normal, Low
- **Action detection** — whether a reply/step is needed, plus any deadline it can find
- **Summary** — a one or two line plain-English summary

### Database

Emails are keyed by **Gmail message ID**, so pressing *Sync Gmail* repeatedly never
creates duplicates — existing rows are updated instead. Thread ID, sender, recipient,
subject, snippet/body, timestamp, read state, Gmail labels, category, priority and
summary are all stored.

---

## Google Cloud setup (required)

1. **Create / select a project** — <https://console.cloud.google.com/>
2. **Enable the Gmail API** — *APIs & Services → Library → Gmail API → Enable*
3. **Configure the OAuth consent screen** — *APIs & Services → OAuth consent screen*
   - User type: **External** (use **Testing** and add your own Gmail address as a test user)
   - App name: `SmartMail AI`, add your support email
4. **Create OAuth credentials** — *APIs & Services → Credentials → Create credentials → OAuth client ID*
   - Application type: **Web application**
   - **Authorised redirect URI** (must match exactly):
     ```
     http://localhost:8000/auth/callback
     ```
5. **Copy the credentials** into `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
   FRONTEND_URL=http://localhost:5173
   ```

### Scopes used (minimum needed)

| Scope | Why |
| --- | --- |
| `gmail.readonly` | Read the 10 most recent emails |
| `gmail.modify` | Mark read / move labels when you organize |
| `userinfo.email`, `userinfo.profile`, `openid` | Show which account is connected |

---

## Security

- Google client secrets live **only** in `backend/.env` (git-ignored) — never in frontend code
- No Gmail passwords are ever requested or stored
- Access tokens are refreshed automatically; refresh tokens are stored server-side only
- **Disconnect Gmail** revokes the Google tokens and clears the local session, so access stops immediately
- Expired/invalid tokens, denied consent, disabled API, rate limits and Gmail outages all
  surface as short friendly messages — never raw API errors

---

## Running locally

### One-time setup

```bash
python3 -m venv backend/venv
./backend/venv/bin/pip install -r backend/requirements.txt
npm install          # from the project root (starts backend + frontend together)
cd frontend && npm install && cd ..
```

### Start everything (backend + frontend)

```bash
npm run dev
```

- Frontend: <http://localhost:5173> — opens straight on the **Connect Gmail** screen
- Backend: <http://localhost:8000> (API docs at `/docs`)

> Both processes must be running. If the login button says it cannot reach
> SmartMail AI, the backend on port 8000 is not up — `npm run dev` handles this
> automatically. (Windows: use `backend\venv\Scripts\uvicorn` in the dev:backend script.)

### Running each part separately

```bash
npm run dev:backend     # FastAPI on :8000
npm run dev:frontend    # Vite on :5173
```

### 3. Connect

Click **Continue with Google**, grant Gmail access, and the dashboard loads your 10
most recent emails already categorized. Use **Sync Gmail** any time to re-read the
newest 10.

---

## API reference (short)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/auth/google` | Real Google consent URL |
| `GET` | `/auth/callback` | OAuth redirect handler (token exchange + first sync) |
| `GET` | `/auth/session` | Is an account connected? |
| `POST` | `/auth/disconnect` | Revoke tokens and disconnect |
| `GET` | `/gmail/status` | Connection + last-sync status |
| `POST` | `/gmail/sync` | Fetch the newest 10 emails, process, store |
| `GET` | `/emails` | Stored emails (filter/sort/search) |
| `GET` | `/categories/summary` | Dashboard counts and category breakdown |
| `POST` | `/emails/draft-reply` | AI reply draft |

---

## Notes

- **Windows/macOS/Linux**: commands above work in Git Bash, zsh and bash.
- Emails are fetched from `userId: "me"` with `maxResults=10`, so only the newest
  ten messages are ever requested.
