# SmartMail AI — Frontend

React 19 + Vite single-page app. It connects to the Python backend at
`http://localhost:8000` by default.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## Configuration

Optional — only needed if the backend runs somewhere else:

```bash
# frontend/.env.local (never commit this file)
VITE_API_URL=http://localhost:8000
```

## What lives here

- `src/App.jsx` — session check, OAuth callback handling, sync, error states
- `src/pages/LoginPage.jsx` — the Google sign-in screen (real OAuth, no mock auth)
- `src/pages/DashboardPage.jsx` — latest 10 emails, categories, priorities, sync status
- `src/services/api.js` — the only place that talks to the backend (no demo data)
- `src/index.css` — design tokens: palette (#B76E79, #F4C2C2, #8B4A5A, #E6D8FF),
  textured background, spacing scale
