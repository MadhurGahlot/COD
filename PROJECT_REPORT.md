# COD Project Report
> Generated: 2026-11-20 | For agents: read this first, skip re-reading the full codebase.

---

## Live URLs
| Service | URL |
|---|---|
| Frontend | https://cod-ivory.vercel.app |
| Backend API | https://cod-ah1q.onrender.com |
| Swagger Docs | https://cod-ah1q.onrender.com/docs |
| GitHub | https://github.com/MadhurGahlot/COD |

---

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 5, TailwindCSS, React Router v7, TanStack Query v5, Axios |
| Backend | Python FastAPI, SQLAlchemy (ORM), psycopg2, JWT (python-jose), bcrypt 5.0.0 |
| Database | PostgreSQL (hosted on Render) |
| Hosting | Vercel (frontend), Render (backend, free tier) |

---

## Git Branch Strategy
- **`2VERSION`** — active dev branch (all changes go here)
- **`main`** — production branch (Render deploys from this)
- Workflow: commit on `2VERSION` → merge into `main` → push `main` → Render auto-deploys

```bash
git checkout main
git merge 2VERSION
git push origin main
git checkout 2VERSION
```

---

## Render Deployment
**Start Command**: `cd backend && uvicorn main:codapp --host 0.0.0.0 --port $PORT`

**Required Environment Variables** (set in Render dashboard):
| Variable | Value |
|---|---|
| `Postgre_pass` | (PostgreSQL password — secret) |
| `SECRET_KEY` | (JWT secret — secret) |
| `FRONTEND_URL` | `https://cod-ivory.vercel.app` |
| `MAX_UPLOAD_SIZE_MB` | `5` |

> ⚠️ Render free tier sleeps after 15 min inactivity. First request may take 30–50 seconds.

---

## Key Files Reference
| File | Purpose |
|---|---|
| `backend/main.py` | FastAPI app instance (`codapp`), CORS config, middleware, router registration |
| `backend/app/routers/auth.py` | Register + Login endpoints |
| `backend/app/models/user.py` | `User` and `Admin` SQLAlchemy models |
| `backend/app/models/security.py` | `hashpassword()`, `verify_password()`, `create_access_token()` using direct bcrypt |
| `backend/database.py` | DB connection string using `Postgre_pass` env var |
| `frontend/src/api/client.js` | Axios instance; production fallback hardcoded to `https://cod-ah1q.onrender.com/api` |
| `frontend/src/pages/Register.jsx` | Registration UI with error parsing |
| `frontend/vercel.json` | SPA rewrite rules (all routes → index.html) |

---

## Auth System
- **Two separate tables**: `users` (players) and `admin` (admins) — completely separate login paths
- **Registration**: `POST /api/auth/register` — creates a row in `users` table with `role="player"`
- **Login**: `POST /api/auth/login` — checks `admin` table first, then `users` table
- **JWT**: returned as `access_token` (bearer), decoded in `get_current_user` dependency
- **Email domain**: No `@gkv.ac.in` restriction enforced in Pydantic schema (plain `EmailStr`)

---

## Bugs Fixed (History)

| Bug | Root Cause | Fix | File |
|---|---|---|---|
| Registration → 500 → "Cannot reach backend" | `dB` typo (capital B) instead of `db` | Replaced all 3 occurrences | `auth.py` |
| `NotNullViolation` on `created_at` | PostgreSQL `NOT NULL` column had no working default | Added `default=lambda: datetime.now(timezone.utc)` | `user.py` |
| `passlib` crashing on hash | bcrypt 5.0.0 removed `__about__`; passlib 1.7.4 fails | Switched to direct `bcrypt.hashpw/checkpw` | `security.py` |
| Frontend using wrong API URL | `VITE_API_URL` env var not read at Vercel build time | Hardcoded production fallback in `client.js` | `client.js` |
| Vercel 404 on page refresh | Missing SPA rewrite rules | Added `vercel.json` with `/*` → `/index.html` | `vercel.json` |

---

## Current Status (as of 2026-11-20)

| Item | Status |
|---|---|
| `dB→db` fix in auth.py | ✅ Fixed & committed on `2VERSION` / `origin/2VERSION` |
| Fix merged to `main` | ⚠️ **PENDING** — needs `git checkout main && git merge 2VERSION && git push origin main` |
| Render running fixed code | ⚠️ Waiting on above merge+push |
| Login | ✅ Working |
| Registration | ⚠️ Will work once main is updated and Render redeploys (~1 min after push) |
| CORS | ✅ Configured for `https://cod-ivory.vercel.app` |
| Frontend (Vercel) | ✅ Deployed and working |

---

## How to Verify Registration Works
After pushing to main and waiting ~60s for Render to redeploy:

```python
python -c "
import urllib.request, json
data = json.dumps({'username':'testplayer_01','email':'testplayer_01@gkv.ac.in','password':'Test123456!'}).encode()
req = urllib.request.Request('https://cod-ah1q.onrender.com/api/auth/register', data=data, headers={'Content-Type':'application/json'}, method='POST')
try:
    print(urllib.request.urlopen(req).read().decode())
except Exception as e:
    print(e.code, e.read().decode())
"
```
Expected: `{"message": "User registered successfully", "user_id": ..., "username": "testplayer_01", "role": "player"}`

---

## Notes for Future Agents
- **Don't re-read all files** — this report covers the essentials
- If Render shows a 500 error on register that wasn't there before, check `auth.py` for variable name bugs first
- If CORS errors appear, check `main.py` → `allow_origins` list includes the Vercel URL
- Render logs are visible at: Render dashboard → `cod-ah1q` service → Logs tab
- The `admin` table is seeded manually — there's no admin registration endpoint

