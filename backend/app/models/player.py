from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, SmallInteger
from database import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    player_name = Column(String(100), nullable=False)
    cod_name = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    photo = Column(String(255), nullable=True)
    year = Column(Integer, default=2024)
    kills = Column(Integer, default=0)
    deaths = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    kd_ratio = Column(Float, default=0.0)
    total_matches = Column(Integer, default=0)
    is_mvp = Column(SmallInteger, default=0)
    status = Column(Enum("active", "pending", name="player_status_enum"), default="pending")
