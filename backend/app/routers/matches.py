from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import text as sa_text
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

from database import get_db
from app.models.match import MatchResult, TournamentMatch, MatchSchedule
from app.models.player import Player
from app.models.team import Team
from dependencies import require_admin

matches_router = APIRouter(prefix="/matches", tags=["matches"])


# ========================
# MATCH RESULTS (per player)
# ========================

class MatchResultCreate(BaseModel):
    player_id: int
    opponent_id: Optional[int] = None
    kills: int = Field(..., ge=0, le=1000)
    deaths: int = Field(..., ge=0, le=1000)
    assists: int = Field(default=0, ge=0, le=1000)
    match_date: date
    year: Optional[int] = None


@matches_router.get("/results")
def list_match_results(year: int = datetime.now().year, db: Session = Depends(get_db)):
    results = db.execute(
        sa_text("""
            SELECT m.*, p.player_name, t.team_name as opponent_name
            FROM matchesresult m
            JOIN players p ON m.player_id = p.id
            LEFT JOIN teams t ON m.opponent_id = t.id
            WHERE m.year = :year
            ORDER BY m.match_date DESC
        """),
        {"year": year}
    ).mappings().all()
    return {"matches": [dict(r) for r in results]}


@matches_router.post("/results")
def add_match_result(
    data: MatchResultCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    year = data.year or datetime.now().year
    deaths_safe = max(data.deaths, 1)
    kd = data.kills / deaths_safe

    match = MatchResult(
        player_id=data.player_id,
        opponent_id=data.opponent_id,
        kills=data.kills,
        deaths=data.deaths,
        assists=data.assists,
        kd_ratio=kd,
        match_date=data.match_date,
        year=year
    )
    db.add(match)

    # Update cumulative stats
    player = db.query(Player).filter(Player.id == data.player_id, Player.year == year).first()
    if player:
        player.kills += data.kills
        player.deaths += data.deaths
        player.assists += data.assists
        player.total_matches += 1
        new_deaths = max(player.deaths, 1)
        player.kd_ratio = player.kills / new_deaths

    db.commit()
    return {"message": "Match result recorded"}


@matches_router.delete("/results/{match_id}")
def delete_match_result(
    match_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    match = db.query(MatchResult).filter(MatchResult.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    player = db.query(Player).filter(Player.id == match.player_id).first()
    if player:
        player.kills = max(0, player.kills - match.kills)
        player.deaths = max(0, player.deaths - match.deaths)
        player.assists = max(0, player.assists - match.assists)
        player.total_matches = max(0, player.total_matches - 1)
        safe_deaths = max(player.deaths, 1)
        player.kd_ratio = player.kills / safe_deaths

    db.delete(match)
    db.commit()
    return {"message": "Match deleted and stats adjusted"}


# ========================
# TEAM VS TEAM MATCH SAVE
# ========================

@matches_router.post("/save_team_match")
async def save_team_match(
    team_a_id: int = Form(...),
    team_b_id: int = Form(...),
    year: int = Form(...),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """
    Accepts form data with dynamic keys: kills_{pid}, deaths_{pid}, assists_{pid}
    for each player in both teams. Use FormData on the frontend.
    """
    from starlette.requests import Request
    raise HTTPException(
        status_code=501,
        detail="Use /matches/save_team_match_json for JSON body submission"
    )


class PlayerMatchEntry(BaseModel):
    player_id: int
    kills: int = Field(..., ge=0, le=1000)
    deaths: int = Field(default=0, ge=0, le=1000)
    assists: int = Field(default=0, ge=0, le=1000)


class TeamMatchCreate(BaseModel):
    team_a_id: int
    team_b_id: int
    year: Optional[int] = None
    players: list[PlayerMatchEntry]


@matches_router.post("/save_team_match_json")
def save_team_match_json(
    data: TeamMatchCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    year = data.year or datetime.now().year

    for entry in data.players:
        pid = entry.player_id
        kills = entry.kills
        deaths = entry.deaths
        assists = entry.assists

        player = db.query(Player).filter(Player.id == pid).first()
        if not player:
            continue

        opponent_id = data.team_b_id if player.team_id == data.team_a_id else data.team_a_id
        kd = kills / max(deaths, 1)

        match = MatchResult(
            player_id=pid,
            opponent_id=opponent_id,
            kills=kills,
            deaths=deaths,
            assists=assists,
            kd_ratio=kd,
            match_date=date.today(),
            year=year
        )
        db.add(match)

        player.kills += kills
        player.deaths += deaths
        player.assists += assists
        player.total_matches += 1
        player.kd_ratio = player.kills / max(player.deaths, 1)

    db.commit()
    return {"message": "Team match results saved"}


# ========================
# MATCH SCHEDULES
# ========================

class ScheduleCreate(BaseModel):
    team_a: int
    team_b: int
    match_time: datetime
    description: Optional[str] = None
    year: Optional[int] = None


@matches_router.get("/schedules")
def get_schedules(year: int = datetime.now().year, db: Session = Depends(get_db)):
    results = db.execute(
        sa_text("""
            SELECT s.*, t1.team_name as team_a_name, t2.team_name as team_b_name
            FROM match_schedules s
            JOIN teams t1 ON s.team_a_id = t1.id
            JOIN teams t2 ON s.team_b_id = t2.id
            WHERE s.year = :year
            ORDER BY s.match_time ASC
        """),
        {"year": year}
    ).mappings().all()
    return {"schedules": [dict(r) for r in results]}


@matches_router.post("/schedules")
def create_schedule(
    data: ScheduleCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    year = data.year or datetime.now().year
    schedule = MatchSchedule(
        team_a_id=data.team_a,
        team_b_id=data.team_b,
        match_time=data.match_time,
        description=data.description,
        year=year
    )
    db.add(schedule)
    db.commit()
    return {"message": "Schedule created"}


@matches_router.delete("/schedules/{sid}")
def delete_schedule(
    sid: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    schedule = db.query(MatchSchedule).filter(MatchSchedule.id == sid).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"message": "Schedule removed"}


# ========================
# TOURNAMENT BRACKETS
# ========================

class BracketMatchCreate(BaseModel):
    round_name: str
    team_a_id: Optional[int] = None
    team_b_id: Optional[int] = None
    match_index: int
    next_match_id: Optional[int] = None
    year: Optional[int] = None


class BracketSetWinner(BaseModel):
    match_id: int
    winner_id: int


@matches_router.get("/brackets")
def get_brackets(year: int = datetime.now().year, db: Session = Depends(get_db)):
    results = db.execute(
        sa_text("""
            SELECT tm.*, t1.team_name as team_a_name, t2.team_name as team_b_name, tw.team_name as winner_name
            FROM tournament_matches tm
            LEFT JOIN teams t1 ON tm.team_a_id = t1.id
            LEFT JOIN teams t2 ON tm.team_b_id = t2.id
            LEFT JOIN teams tw ON tm.winner_team_id = tw.id
            WHERE tm.year = :year
            ORDER BY tm.match_index ASC
        """),
        {"year": year}
    ).mappings().all()
    return {"brackets": [dict(r) for r in results]}


@matches_router.post("/brackets")
def create_bracket_match(
    data: BracketMatchCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    year = data.year or datetime.now().year
    match = TournamentMatch(
        round_name=data.round_name,
        team_a_id=data.team_a_id,
        team_b_id=data.team_b_id,
        match_index=data.match_index,
        next_match_id=data.next_match_id,
        year=year
    )
    db.add(match)
    db.commit()
    return {"message": "Bracket match created", "match_id": match.id}


@matches_router.post("/brackets/set_winner")
def set_bracket_winner(
    data: BracketSetWinner,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    match = db.query(TournamentMatch).filter(TournamentMatch.id == data.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.winner_team_id = data.winner_id

    # Advance to next match
    if match.next_match_id:
        next_match = db.query(TournamentMatch).filter(TournamentMatch.id == match.next_match_id).first()
        if next_match:
            if match.match_index % 2 != 0:
                next_match.team_a_id = data.winner_id
            else:
                next_match.team_b_id = data.winner_id

    db.commit()
    return {"message": "Winner set and advanced to next round"}
