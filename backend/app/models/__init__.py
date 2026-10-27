# Import all models so SQLAlchemy can register them before create_all()
from app.models.user import User, Admin
from app.models.team import Team
from app.models.player import Player
from app.models.match import MatchResult, TournamentMatch, MatchSchedule
from app.models.winner import Winner
from app.models.home import HomeSetting, HomeFeaturedPlayer, HomeHighlight, HomeHeroImage
from app.models.news import News, AuditLog
