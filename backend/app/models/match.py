from sqlalchemy import Column, Integer, Float, ForeignKey, Date, String, DateTime
from database import Base


class MatchResult(Base):
    __tablename__ = "matchesresult"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"))
    opponent_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    kills = Column(Integer)
    deaths = Column(Integer)
    assists = Column(Integer)
    kd_ratio = Column(Float)
    match_date = Column(Date)
    year = Column(Integer)


class TournamentMatch(Base):
    __tablename__ = "tournament_matches"

    id = Column(Integer, primary_key=True, index=True)
    round_name = Column(String(100), nullable=True)
    team_a_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team_b_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    winner_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    next_match_id = Column(Integer, nullable=True)
    match_index = Column(Integer)
    year = Column(Integer)


class MatchSchedule(Base):
    __tablename__ = "match_schedules"

    id = Column(Integer, primary_key=True, index=True)
    team_a_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team_b_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    match_time = Column(DateTime, nullable=True)
    description = Column(String(255), nullable=True)
    year = Column(Integer)
