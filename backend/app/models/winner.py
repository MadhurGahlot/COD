from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Winner(Base):
    __tablename__ = "winners"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer)
    winner_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    runnerup_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    winner_photo = Column(String(255), nullable=True)
    final_score = Column(String(50), nullable=True)
    mvp_name = Column(String(100), nullable=True)
    mvp_photo = Column(String(255), nullable=True)
