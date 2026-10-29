# COD Tournament Management System - Project & Deployment Reference

## 1. Project Overview & Architecture

- **Backend**: Python 3.10+ with **FastAPI** (`backend/main.py`)
- **Database**: **PostgreSQL** (SQLAlchemy 2.0 + psycopg2/psycopg)
- **Frontend**: **React 18** + **Vite 5** (`frontend/`) deployed on **Vercel** (`https://cod-ivory.vercel.app/`)
- **Authentication**: JWT Bearer Tokens (`python-jose`, `passlib`, `bcrypt`)

---

## 2. Backend Architecture Details

- **Entry Point**: `backend/main.py`
- **FastAPI App Instance**: `codapp` (defined in `backend/main.py:25`)
- **All Routes Prefixed**: All API endpoints use `/api` (e.g., `/api/auth/login`, `/api/teams`, `/api/players`, `/api/matches`, etc.)
- **Health Check Endpoint**: `/health` (checks database connection)
- **Root Endpoint**: `/` (returns API status and link to `/docs`)

### Required Backend Environment Variables
These must be set in Render:

| Variable | Description | Example Value |
|---|---|---|
| `Postgre_pass` | PostgreSQL connection URL | `postgresql://user:pass@host/dbname` |
| `SECRET_KEY` | Secret key for JWT signing | *(random 32+ char string)* |
| `FRONTEND_URL` | Vercel production frontend URL (for CORS) | `https://cod-ivory.vercel.app` |
| `MAX_UPLOAD_SIZE_MB` | Maximum file upload size in MB | `5` |
| `PYTHON_VERSION` | Python runtime version on Render | `3.11.8` |

---

## 3. Frontend Architecture Details

- **Path**: `frontend/`
- **Build Tool**: Vite (`npm run build` -> output: `frontend/dist`)
- **API Client**: `frontend/src/api/client.js`
- **Production Environment Variables** (`frontend/.env.production`):
  - `VITE_API_URL`: Points to your Render backend with `/api` suffix:
    `https://<your-render-app>.onrender.com/api`
  - `VITE_STATIC_URL`: Points to your Render backend root (for `/static/player_photos`):
    `https://<your-render-app>.onrender.com`

---

## 4. Step-by-Step Render Deployment Guide for Backend

### Step 1: Database (PostgreSQL)
Ensure you have a live PostgreSQL database:
- You can create a free PostgreSQL instance on **Render** (Click **New +** -> **PostgreSQL**) or use **Neon.tech** / **Supabase**.
- Copy the **Internal Connection String** (or External Connection String).

### Step 2: Create Web Service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository.
4. Fill in the deployment settings:
   - **Name**: `cod-backend` (or your chosen name)
   - **Region**: Choose closest to your users (e.g. Singapore or Frankfurt)
   - **Branch**: `main` (or your working branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r ../requirements.txt`
   - **Start Command**: `uvicorn main:codapp --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables in Render Dashboard
Go to the **Environment** tab in your Render service and add:
- `Postgre_pass` = `<your-postgresql-connection-string>`
- `SECRET_KEY` = `<your-random-secret-key>`
- `FRONTEND_URL` = `https://cod-ivory.vercel.app`
- `MAX_UPLOAD_SIZE_MB` = `5`
- `PYTHON_VERSION` = `3.11.8`

### Step 4: Click "Deploy Web Service"
- Wait for the build and server startup to finish.
- When it says **Live**, test by opening: `https://<your-service-name>.onrender.com/health`
- It should return: `{"status": "healthy", "database": "connected"}`.

---

## 5. Connecting Frontend (Vercel) to Render Backend

Once Render gives you your live URL (e.g. `https://cod-backend-xxxx.onrender.com`):

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> Select **`cod-ivory`**.
2. Go to **Settings** -> **Environment Variables**.
3. Add / Update:
   - `VITE_API_URL` = `https://cod-backend-xxxx.onrender.com/api`
   - `VITE_STATIC_URL` = `https://cod-backend-xxxx.onrender.com`
4. Go to **Deployments** tab in Vercel -> Click `...` on latest deployment -> **Redeploy**.

