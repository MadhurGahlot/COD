from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text as sa_text
from typing import Optional
from datetime import datetime
import os
import shutil

from database import get_db
from app.models.home import HomeSetting, HomeFeaturedPlayer, HomeHighlight, HomeHeroImage
from app.models.team import Team
from app.models.player import Player
from app.models.match import MatchResult
from dependencies import require_admin

home_router = APIRouter(prefix="/home", tags=["home"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static")
os.makedirs(UPLOAD_DIR, exist_ok=True)


from app.utils.uploads import save_upload_file

def save_file(upload: Optional[UploadFile]) -> Optional[str]:
    return save_upload_file(upload, UPLOAD_DIR)


@home_router.get("/")
def get_home(year: int = datetime.now().year, db: Session = Depends(get_db)):
    settings = db.query(HomeSetting).filter(HomeSetting.year == year).first()

    top_players = db.execute(
        sa_text("""
            SELECT hfp.id, hfp.rank_number, p.player_name, p.photo, p.kd_ratio, p.kills
            FROM home_featured_players hfp
            LEFT JOIN players p ON hfp.player_id = p.id
            WHERE hfp.year = :year
            ORDER BY hfp.rank_number ASC
        """),
        {"year": year}
    ).mappings().all()

    highlights = db.query(HomeHighlight).filter(HomeHighlight.year == year).all()
    hero_images = db.query(HomeHeroImage).filter(HomeHeroImage.year == year).all()

    counts = db.execute(
        sa_text("""
            SELECT 
                (SELECT COUNT(*) FROM teams WHERE year = :year) AS teams_count,
                (SELECT COUNT(*) FROM players WHERE year = :year) AS players_count,
                (SELECT COUNT(*) FROM matchesresult WHERE year = :year) AS matches_count
        """),
        {"year": year}
    ).mappings().first()

    return {
        "settings": {c.key: getattr(settings, c.key) for c in settings.__table__.columns} if settings else None,
        "top_players": [dict(r) for r in top_players],
        "highlights": [{c.key: getattr(h, c.key) for c in h.__table__.columns} for h in highlights],
        "hero_images": [{c.key: getattr(h, c.key) for c in h.__table__.columns} for h in hero_images],
        "stats": {
            "teams": counts["teams_count"] if counts else 0,
            "players": counts["players_count"] if counts else 0,
            "matches": counts["matches_count"] if counts else 0
        }
    }


# -------- ADMIN HOME SETTINGS --------

@home_router.post("/settings")
async def update_home_settings(
    year: int = Form(...),
    hero_title: Optional[str] = Form(None),
    hero_subtitle: Optional[str] = Form(None),
    headline_accent: Optional[str] = Form(None),
    eyebrow: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    primary_cta_text: Optional[str] = Form(None),
    primary_cta_link: Optional[str] = Form(None),
    secondary_cta_text: Optional[str] = Form(None),
    secondary_cta_link: Optional[str] = Form(None),
    backdrop_text: Optional[str] = Form(None),
    show_nav: Optional[int] = Form(0),
    hero_background: Optional[UploadFile] = File(None),
    hero_dark_image: Optional[UploadFile] = File(None),
    college_logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    existing = db.query(HomeSetting).filter(HomeSetting.year == year).first()

    bg_file = save_file(hero_background) or (existing.hero_background if existing else None)
    dark_bg_file = save_file(hero_dark_image) or (existing.hero_dark_image if existing else None)
    logo_file = save_file(college_logo) or (existing.college_logo if existing else None)

    if existing:
        db.delete(existing)
        db.flush()

    setting = HomeSetting(
        year=year,
        hero_title=hero_title,
        hero_subtitle=hero_subtitle,
        headline_accent=headline_accent,
        eyebrow=eyebrow,
        brand=brand,
        primary_cta_text=primary_cta_text,
        primary_cta_link=primary_cta_link,
        secondary_cta_text=secondary_cta_text,
        secondary_cta_link=secondary_cta_link,
        hero_background=bg_file,
        hero_dark_image=dark_bg_file,
        backdrop_text=backdrop_text,
        show_nav=show_nav,
        college_logo=logo_file
    )
    db.add(setting)
    db.commit()
    return {"message": "Home settings updated"}


# Featured Players
@home_router.post("/featured_player")
def add_featured_player(
    player_id: int = Form(...),
    rank_number: int = Form(...),
    year: int = Form(...),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    existing = (
        db.query(HomeFeaturedPlayer)
        .filter(HomeFeaturedPlayer.rank_number == rank_number, HomeFeaturedPlayer.year == year)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail=f"Rank {rank_number} already taken for year {year}")

    fp = HomeFeaturedPlayer(player_id=player_id, rank_number=rank_number, year=year)
    db.add(fp)
    db.commit()
    return {"message": "Featured player added"}


@home_router.delete("/featured_player/{fid}")
def delete_featured_player(
    fid: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    fp = db.query(HomeFeaturedPlayer).filter(HomeFeaturedPlayer.id == fid).first()
    if not fp:
        raise HTTPException(status_code=404, detail="Featured player not found")
    db.delete(fp)
    db.commit()
    return {"message": "Featured player removed"}


# Highlights
@home_router.post("/highlight")
async def add_highlight(
    title: str = Form(...),
    description: str = Form(...),
    year: int = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    filename = save_file(image)
    highlight = HomeHighlight(title=title, description=description, image=filename, year=year)
    db.add(highlight)
    db.commit()
    return {"message": "Highlight added"}


@home_router.delete("/highlight/{hid}")
def delete_highlight(
    hid: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    h = db.query(HomeHighlight).filter(HomeHighlight.id == hid).first()
    if not h:
        raise HTTPException(status_code=404, detail="Highlight not found")
    db.delete(h)
    db.commit()
    return {"message": "Highlight removed"}


# Hero Images
@home_router.post("/hero_image")
async def add_hero_image(
    year: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    filename = save_file(image)
    hero = HomeHeroImage(image=filename, year=year)
    db.add(hero)
    db.commit()
    return {"message": "Hero image added"}


@home_router.delete("/hero_image/{hid}")
def delete_hero_image(
    hid: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    h = db.query(HomeHeroImage).filter(HomeHeroImage.id == hid).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hero image not found")
    db.delete(h)
    db.commit()
    return {"message": "Hero image removed"}
