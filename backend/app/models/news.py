from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from database import Base


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    year = Column(Integer)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admin.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(TIMESTAMP, server_default=func.now())
