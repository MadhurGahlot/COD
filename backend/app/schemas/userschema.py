from enum import Enum

from pydantic import BaseModel, EmailStr


class RoleEnum(str, Enum):
    player = "player"


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: RoleEnum
    player_id: int | None = None