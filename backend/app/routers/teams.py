from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db
from app.models.team import Team
from app.models.player import Player
from dependencies import require_admin

teams_router = APIRouter(prefix="/teams", tags=["teams"])


class TeamCreate(BaseModel):
    team_name: str
    year: Optional[int] = None


class TeamUpdate(BaseModel):
    team_name: str


# -------- PUBLIC --------

@teams_router.get("/")
def get_teams(year: int = datetime.now().year, db: Session = Depends(get_db)):
    from sqlalchemy import func
    results = (
        db.query(
            Team.id,
            Team.team_name,
            Team.year,
            func.count(Player.id).label("player_count")
        )
        .outerjoin(Player, (Player.team_id == Team.id) & (Player.year == year))
        .filter(Team.year == year)
        .group_by(Team.id, Team.team_name, Team.year)
        .all()
    )
    teams = [
        {
            "id": r.id,
            "team_name": r.team_name,
            "year": r.year,
            "player_count": r.player_count
        }
        for r in results
    ]
    return {"teams": teams}


@teams_router.get("/{team_id}")
def get_team(team_id: int, year: int = datetime.now().year, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id, Team.year == year).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    players = (
        db.query(Player)
        .filter(Player.team_id == team_id, Player.year == year)
        .all()
    )
    return {
        "team": {"id": team.id, "team_name": team.team_name, "year": team.year},
        "players": [
            {
                "player_id": p.id,
                "player_name": p.player_name,
                "cod_name": p.cod_name,
                "photo": p.photo,
                "kills": p.kills,
                "deaths": p.deaths,
                "assists": p.assists,
                "kd_ratio": p.kd_ratio,
            }
            for p in players
        ]
    }


# -------- ADMIN --------

@teams_router.post("/admin/teams")
def create_team(
    data: TeamCreate,
    year_param: int = datetime.now().year,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    year = data.year or year_param
    team = Team(team_name=data.team_name, year=year)
    db.add(team)
    db.commit()
    db.refresh(team)
    return {"message": "Team created", "team_id": team.id}


@teams_router.put("/admin/teams/{team_id}")
def update_team(
    team_id: int,
    data: TeamUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team.team_name = data.team_name
    db.commit()
    return {"message": "Team updated"}


@teams_router.delete("/admin/teams/{team_id}")
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    from app.models.winner import Winner
    from app.models.match import MatchSchedule, TournamentMatch
    from app.models.user import User as UserModel

    # Unlink from winners
    db.query(Winner).filter(Winner.winner_team_id == team_id).update({"winner_team_id": None})
    db.query(Winner).filter(Winner.runnerup_team_id == team_id).update({"runnerup_team_id": None})

    # Unlink from schedules
    db.query(MatchSchedule).filter(MatchSchedule.team_a_id == team_id).update({"team_a_id": None})
    db.query(MatchSchedule).filter(MatchSchedule.team_b_id == team_id).update({"team_b_id": None})

    # Unlink from tournament matches
    db.query(TournamentMatch).filter(TournamentMatch.team_a_id == team_id).update({"team_a_id": None})
    db.query(TournamentMatch).filter(TournamentMatch.team_b_id == team_id).update({"team_b_id": None})
    db.query(TournamentMatch).filter(TournamentMatch.winner_team_id == team_id).update({"winner_team_id": None})

    # Unlink from users
    db.query(UserModel).filter(UserModel.team_id == team_id).update({"team_id": None})

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    db.delete(team)
    db.commit()
    return {"message": "Team deleted"}
