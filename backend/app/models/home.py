from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from database import Base


class HomeSetting(Base):
    __tablename__ = "home_settings"

    year = Column(Integer, primary_key=True)
    hero_title = Column(String(255), nullable=True)
    hero_subtitle = Column(Text, nullable=True)
    headline_accent = Column(String(255), nullable=True)
    eyebrow = Column(String(255), nullable=True)
    brand = Column(String(255), nullable=True)
    primary_cta_text = Column(String(100), nullable=True)
    primary_cta_link = Column(String(255), nullable=True)
    secondary_cta_text = Column(String(100), nullable=True)
    secondary_cta_link = Column(String(255), nullable=True)
    hero_background = Column(String(255), nullable=True)
    hero_dark_image = Column(String(255), nullable=True)
    backdrop_text = Column(String(100), nullable=True)
    show_nav = Column(Integer, nullable=True, default=0)
    college_logo = Column(String(255), nullable=True)


class HomeFeaturedPlayer(Base):
    __tablename__ = "home_featured_players"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=True)
    rank_number = Column(Integer)
    year = Column(Integer)


class HomeHighlight(Base):
    __tablename__ = "home_highlights"

    id = Column(Integer, primary_key=True, index=True)
    image = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    year = Column(Integer)


class HomeHeroImage(Base):
    __tablename__ = "home_hero_images"

    id = Column(Integer, primary_key=True, index=True)
    image = Column(String(255), nullable=True)
    year = Column(Integer)
