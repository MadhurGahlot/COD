from sqlalchemy import Column, Integer, String
from database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), nullable=False)
    year = Column(Integer, default=2024)
