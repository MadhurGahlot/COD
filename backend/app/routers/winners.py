from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text as sa_text
from typing import Optional
from datetime import datetime
import os
import shutil

from database import get_db
from app.models.winner import Winner
from dependencies import require_admin

winners_router = APIRouter(prefix="/winners", tags=["winners"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "player_photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)


from app.utils.uploads import save_upload_file

def save_photo(photo: Optional[UploadFile]) -> Optional[str]:
    return save_upload_file(photo, UPLOAD_DIR)


@winners_router.get("/")
def get_winners(year: int = datetime.now().year, db: Session = Depends(get_db)):
    results = db.execute(
        sa_text("""
            SELECT winners.*,
                   t1.team_name AS winner_team,
                   t2.team_name AS runnerup_team
            FROM winners
            LEFT JOIN teams t1 ON winners.winner_team_id = t1.id
            LEFT JOIN teams t2 ON winners.runnerup_team_id = t2.id
            WHERE winners.year = :year
            ORDER BY winners.year DESC
        """),
        {"year": year}
    ).mappings().all()
    return {"winners": [dict(r) for r in results]}


@winners_router.get("/hall_of_fame")
def hall_of_fame(year: int = datetime.now().year, db: Session = Depends(get_db)):
    results = db.execute(
        sa_text("""
            SELECT w.year, w.winner_photo,
                   t1.team_name AS winner_team,
                   t2.team_name AS runnerup_team
            FROM winners w
            LEFT JOIN teams t1 ON w.winner_team_id = t1.id
            LEFT JOIN teams t2 ON w.runnerup_team_id = t2.id
            WHERE w.year = :year
            ORDER BY w.year DESC
        """),
        {"year": year}
    ).mappings().all()
    return {"hall_of_fame": [dict(r) for r in results]}


@winners_router.post("/")
async def create_winner(
    year: int = Form(...),
    winner_team_id: int = Form(...),
    runnerup_team_id: int = Form(...),
    final_score: Optional[str] = Form(None),
    mvp_name: Optional[str] = Form(None),
    winner_photo: Optional[UploadFile] = File(None),
    mvp_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    winner = Winner(
        year=year,
        winner_team_id=winner_team_id,
        runnerup_team_id=runnerup_team_id,
        final_score=final_score,
        mvp_name=mvp_name,
        winner_photo=save_photo(winner_photo),
        mvp_photo=save_photo(mvp_photo)
    )
    db.add(winner)
    db.commit()
    return {"message": "Winner entry created"}


@winners_router.delete("/{wid}")
def delete_winner(
    wid: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    winner = db.query(Winner).filter(Winner.id == wid).first()
    if not winner:
        raise HTTPException(status_code=404, detail="Winner not found")
    db.delete(winner)
    db.commit()
    return {"message": "Winner entry removed"}
