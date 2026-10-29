from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from sqlalchemy import text
import os

from database import Base, engine

# Import all models to register them with SQLAlchemy before create_all()
import app.models  

from app.routers.auth import auth_router
from app.routers.teams import teams_router
from app.routers.players import players_router
from app.routers.matches import matches_router
from app.routers.winners import winners_router
from app.routers.news import news_router
from app.routers.home import home_router
from app.routers.audit import audit_router

load_dotenv()

codapp = FastAPI(
    title="COD Tournament API",
    description="FastAPI backend for the COD Tournament Web App",
    contact={"email": "236301126@gkv.ac.in"},
    version="2.0.0"
)

# ── Performance: GZip Compression for Mobile Networks ─────────────────────────
codapp.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Security Headers Middleware ───────────────────────────────────────────────
@codapp.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ── CORS ──────────────────────────────────────────────────────────────────────
# NOTE: allow_origins cannot be ["*"] when allow_credentials=True — browsers reject it.
# Set FRONTEND_URL in .env for production (e.g. https://your-domain.com).
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
_allowed_origins = [
    "https://cod-ivory.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    _frontend_url,
]
codapp.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(_allowed_origins)),   # deduplicated
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files ───────────────────────────────────────────────────────────────
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
codapp.mount("/static", StaticFiles(directory=static_dir), name="static")

# Serve compiled frontend assets only if built (never expose raw source code / node_modules)
frontend_dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist_dir):
    codapp.mount("/frontend", StaticFiles(directory=frontend_dist_dir, html=True), name="frontend")


# ── Routers ────────────────────────────────────────────────────────────────────
# Include with /api prefix for API client requests
codapp.include_router(auth_router, prefix="/api")
codapp.include_router(teams_router, prefix="/api")
codapp.include_router(players_router, prefix="/api")
codapp.include_router(matches_router, prefix="/api")
codapp.include_router(winners_router, prefix="/api")
codapp.include_router(news_router, prefix="/api")
codapp.include_router(home_router, prefix="/api")
codapp.include_router(audit_router, prefix="/api")

# All routes are served under /api prefix only (no legacy root duplication)


# ── Create DB tables ───────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)


@codapp.get("/")
def root():
    return {
        "title": "COD Tournament Backend",
        "version": "2.0.0 (FastAPI)",
        "status": "running",
        "docs": "/docs"
    }


@codapp.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
