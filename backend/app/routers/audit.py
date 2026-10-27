from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text as sa_text

from database import get_db
from app.models.news import AuditLog
from dependencies import require_admin

audit_router = APIRouter(prefix="/audit", tags=["audit"])


def log_action(db: Session, admin_id: int, action: str, details: str = ""):
    log = AuditLog(admin_id=admin_id, action=action, details=details)
    db.add(log)
    db.commit()


@audit_router.get("/logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    results = db.execute(
        sa_text("""
            SELECT a.*, admin.username
            FROM audit_logs a
            LEFT JOIN admin ON a.admin_id = admin.id
            ORDER BY a.timestamp DESC
            LIMIT 100
        """)
    ).mappings().all()
    return {"logs": [dict(r) for r in results]}
