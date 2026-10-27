from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os
import shutil

from database import get_db
from app.models.player import Player
from app.models.team import Team
from app.models.user import User
from dependencies import require_admin, get_current_user

players_router = APIRouter(prefix="/players", tags=["players"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "player_photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)


from app.utils.uploads import save_upload_file

def save_photo(photo: Optional[UploadFile]) -> Optional[str]:
    return save_upload_file(photo, UPLOAD_DIR)


def mask_email(email: Optional[str]) -> Optional[str]:
    if not email or "@" not in email:
        return None
    user, domain = email.split("@", 1)
    if len(user) <= 2:
        masked_user = user[0] + "*"
    else:
        masked_user = user[0] + "*" * (len(user) - 2) + user[-1]
    return f"{masked_user}@{domain}"


# -------- PUBLIC --------

@players_router.get("/")
def get_players(year: int = datetime.now().year, db: Session = Depends(get_db)):
    players = (
        db.query(Player, Team.team_name)
        .outerjoin(Team, Player.team_id == Team.id)
        .filter(Player.year == year, Player.status == "active")
        .order_by(Player.player_name)
        .all()
    )
    return {
        "players": [
            {
                **{c.key: getattr(p, c.key) for c in p.__table__.columns if c.key != "email"},
                "team_name": team_name
            }
            for p, team_name in players
        ]
    }


@players_router.get("/leaderboard")
def leaderboard(year: int = datetime.now().year, db: Session = Depends(get_db)):
    players = (
        db.query(Player, Team.team_name)
        .outerjoin(Team, (Player.team_id == Team.id) & (Team.year == Player.year))
        .filter(Player.year == year)
        .order_by(
            Player.kd_ratio.desc(),
            Player.kills.desc(),
            Player.deaths.asc(),
            Player.total_matches.desc()
        )
        .all()
    )
    leaderboard_data = [
        {
            **{c.key: getattr(p, c.key) for c in p.__table__.columns},
            "team_name": team_name
        }
        for p, team_name in players
    ]
    mvp = leaderboard_data[0] if leaderboard_data else None
    return {"leaderboard": leaderboard_data, "mvp": mvp}


@players_router.get("/compare")
def compare_players(db: Session = Depends(get_db)):
    players = (
        db.query(Player)
        .filter(Player.status == "active")
        .order_by(Player.player_name)
        .all()
    )
    return {
        "players": [
            {"id": p.id, "cod_name": p.cod_name, "player_name": p.player_name}
            for p in players
        ]
    }


@players_router.get("/compare/data")
def compare_data(p1: int, p2: int, db: Session = Depends(get_db)):
    def get_stats(pid):
        p = db.query(Player).filter(Player.id == pid).first()
        if not p:
            return None
        team = db.query(Team).filter(Team.id == p.team_id).first()
        return {
            **{c.key: getattr(p, c.key) for c in p.__table__.columns},
            "team_name": team.team_name if team else None
        }
    return {"p1": get_stats(p1), "p2": get_stats(p2)}


@players_router.get("/stats/{player_id}")
def player_stats(player_id: int, db: Session = Depends(get_db)):
    from app.models.match import MatchResult
    stats = (
        db.query(MatchResult)
        .filter(MatchResult.player_id == player_id)
        .order_by(MatchResult.match_date.asc())
        .all()
    )
    return {
        "stats": [
            {"match_date": str(s.match_date), "kd_ratio": s.kd_ratio, "kills": s.kills}
            for s in stats
        ]
    }


@players_router.get("/{player_id}")
def get_player(player_id: int, year: int = datetime.now().year, db: Session = Depends(get_db)):
    from app.models.match import MatchResult
    from app.models.winner import Winner

    result = (
        db.query(Player, Team.team_name)
        .outerjoin(Team, Player.team_id == Team.id)
        .filter(Player.id == player_id, Player.year == year)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Player not found")

    player, team_name = result

    # MVP for year
    mvp_q = (
        db.query(Player)
        .filter(Player.year == year)
        .order_by(Player.kd_ratio.desc(), Player.kills.desc())
        .first()
    )

    # Performance by opponent
    from sqlalchemy import func, text as sa_text
    opponent_stats = db.execute(
        sa_text("""
            SELECT t.team_name,
                   SUM(m.kills) as total_kills,
                   SUM(m.deaths) as total_deaths,
                   SUM(m.assists) as total_assists,
                   COUNT(m.id) as match_count
            FROM matchesresult m
            JOIN teams t ON m.opponent_id = t.id
            WHERE m.player_id = :pid
            GROUP BY t.id, t.team_name
        """),
        {"pid": player_id}
    ).mappings().all()

    # Achievements
    team_wins = 0
    if player.team_id:
        team_wins = db.query(Winner).filter(Winner.winner_team_id == player.team_id).count()
    mvp_awards = 0
    if player.player_name:
        mvp_awards = db.query(Winner).filter(Winner.mvp_name == player.player_name).count()

    player_dict = {c.key: getattr(player, c.key) for c in player.__table__.columns}
    if player_dict.get("email"):
        player_dict["email"] = mask_email(player_dict["email"])

    return {
        "player": {**player_dict, "team_name": team_name},
        "mvp": {c.key: getattr(mvp_q, c.key) for c in mvp_q.__table__.columns if c.key != "email"} if mvp_q else None,
        "opponent_stats": [dict(row) for row in opponent_stats],
        "team_wins": team_wins,
        "mvp_awards": mvp_awards
    }


# -------- ADMIN --------

@players_router.post("/admin")
async def create_player(
    player_name: str = Form(...),
    cod_name: str = Form(""),
    email: str = Form(...),
    team_id: Optional[int] = Form(None),
    year: Optional[int] = Form(None),
    user_id: Optional[int] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    current_year = year or datetime.now().year
    filename = save_photo(photo)

    player = Player(
        player_name=player_name,
        cod_name=cod_name,
        email=email,
        team_id=team_id,
        photo=filename,
        year=current_year,
        user_id=user_id,
        status="active"
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return {"message": "Player created", "player_id": player.id}


@players_router.put("/admin/{player_id}")
async def update_player(
    player_id: int,
    player_name: str = Form(...),
    cod_name: str = Form(...),
    team_id: Optional[int] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    if photo and photo.filename:
        player.photo = save_photo(photo)

    player.player_name = player_name
    player.cod_name = cod_name
    player.team_id = team_id
    db.commit()
    return {"message": "Player updated"}


@players_router.delete("/admin/{player_id}")
def delete_player(
    player_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    db.delete(player)
    db.commit()
    return {"message": "Player deleted"}


@players_router.put("/admin/{player_id}/set_mvp")
def set_mvp(
    player_id: int,
    year: int = datetime.now().year,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    db.query(Player).filter(Player.year == year).update({"is_mvp": 0})
    db.query(Player).filter(Player.id == player_id, Player.year == year).update({"is_mvp": 1})
    db.commit()
    return {"message": "MVP set"}


@players_router.post("/admin/assign")
def assign_player(
    player_id: int = Form(...),
    team_id: int = Form(...),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    player.team_id = team_id
    player.status = "active"
    db.commit()
    return {"message": "Player assigned to team"}


# -------- PLAYER SELF-REGISTRATION --------

@players_router.post("/register_profile")
async def register_player_profile(
    player_name: str = Form(...),
    cod_name: str = Form(...),
    email: str = Form(...),
    year: Optional[int] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    current_year = year or datetime.now().year

    existing = db.query(Player).filter(Player.user_id == user_id, Player.year == current_year).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this year")

    filename = save_photo(photo)

    player = Player(
        player_name=player_name,
        cod_name=cod_name,
        email=email,
        user_id=user_id,
        photo=filename,
        year=current_year,
        status="pending"
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return {"message": "Registration submitted, awaiting team assignment", "player_id": player.id}


@players_router.get("/me/profile")
def my_profile(
    year: int = datetime.now().year,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    player = db.query(Player).filter(Player.user_id == user_id, Player.year == year).first()
    if not player:
        raise HTTPException(status_code=404, detail="No profile found for this year")
    return {c.key: getattr(player, c.key) for c in player.__table__.columns}
