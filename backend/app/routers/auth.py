from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import traceback

from app.schemas.userschema import UserRegister, UserLogin
from database import get_db
from app.models.user import User, Admin

from app.models.security import (
    hashpassword,
    verify_password,
    create_access_token
)


auth_router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)


from app.utils.rate_limiter import login_rate_limiter, register_rate_limiter


_CAREFUL_ERROR_LIMIT = 500

@auth_router.post("/register", dependencies=[Depends(register_rate_limiter)])
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    existing_username = (
        db.query(User)
        .filter(User.username == user_data.username)
        .first()
    )
    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = (
        dB.query(User)
        .filter(User.email == user_data.email)
        .first()
    )
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    try:
        pw_hash = hashpassword(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=pw_hash,
            role="player"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    except HTTPException:
        raise
    except Exception as e:
        dB.rollback()
        print("Registration Failure Traceback:", traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail=f"{type(e).__name__}: {str(e)}"
        )

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    }


@auth_router.post("/login", dependencies=[Depends(login_rate_limiter)])
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    if admin:
        password_ok = False
        needs_rehash = False
        try:
            password_ok = verify_password(login_data.password, admin.password)
        except Exception:
            pass
        if not password_ok:
            import secrets
            if isinstance(admin.password, str) and isinstance(login_data.password, str):
                password_ok = secrets.compare_digest(admin.password, login_data.password)
                if password_ok:
                    needs_rehash = True
        if password_ok:
            if needs_rehash:
                try:
                    admin.password = hashpassword(login_data.password)
                    db.commit()
                except Exception:
                    db.rollback()
            access_token = create_access_token({
                "sub": str(admin.id),
                "role": "admin",
                "username": admin.username
            })
            return {
                "message": "Admin login successful",
                "access_token": access_token,
                "token_type": "bearer",
                "role": "admin",
                "username": admin.username
            }

    user = dB.query(User).filter(User.username == login_data.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "username": user.username
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }