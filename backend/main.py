from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
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


# ── Global Exception Handlers ──────────────────────────────────────────────────
@codapp.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = [e.get("msg", "Validation error") for e in errors]
    return JSONResponse(
        status_code=422,
        content={"detail": "; ".join(messages)},
    )

@codapp.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
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
    allow_origins=list(set(_allowed_origins)),   
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


# ── Create DB tables & Schema Sync ─────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

def sync_database_schema():
    """Ensure older tables receive new columns and enum types without data loss."""
    migrations = [
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id INTEGER;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS cod_name VARCHAR(100);",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS is_mvp SMALLINT DEFAULT 0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS department VARCHAR(100);",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS contact VARCHAR(50);",
    ]
    for stmt in migrations:
        try:
            with engine.begin() as conn:
                conn.execute(text(stmt))
        except Exception as e:
            print("Schema migration notice:", e)

    # Status column & enum
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE player_status_enum AS ENUM ('active', 'pending');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
    except Exception as e:
        print("Enum create notice:", e)

    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE players ADD COLUMN IF NOT EXISTS status player_status_enum DEFAULT 'pending';"))
    except Exception:
        try:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE players ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';"))
        except Exception as e:
            print("Status column notice:", e)

    # Backfill registered users who don't have a player profile into players table so admin sees them immediately
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO players (user_id, player_name, cod_name, email, year, status)
                SELECT u.id, u.username, u.username, u.email, 2026, 'pending'
                FROM users u
                WHERE u.role = 'player'
                  AND NOT EXISTS (
                      SELECT 1 FROM players p WHERE p.user_id = u.id OR p.email = u.email
                  );
            """))
    except Exception as e:
        print("User backfill notice:", e)

sync_database_schema()


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
