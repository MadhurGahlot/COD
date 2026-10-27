from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


load_dotenv()
database_password = os.getenv("Postgre_pass")
if not database_password:
    raise RuntimeError("'Postgre_pass' is not set in .env — expected a full PostgreSQL connection URL (e.g. postgresql+psycopg2://user:pass@host/db)")

if database_password.startswith("postgres://"):
    database_password = database_password.replace("postgres://", "postgresql://", 1)

engine = create_engine(
   database_password,
   pool_pre_ping=True,
   pool_recycle=300,
)

SessionLocal = sessionmaker(
 bind = engine,
 autoflush=False,
 autocommit=False,
)

class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


