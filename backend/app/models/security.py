from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from jose import jwt
import bcrypt

load_dotenv()

SECRET_KEY = os.getenv ("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in .env")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 25

def hashpassword(password: str) -> str:
    pw = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw = plain_password.encode('utf-8')[:72]
        h_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw, h_bytes)
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
