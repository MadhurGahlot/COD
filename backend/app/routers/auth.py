from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.userschema import UserRegister, UserLogin
from database import get_db
from app.models.user import User

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


# =========================
# REGISTER
# =========================

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
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashpassword(user_data.password),
        role="player"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    }


# =========================
# LOGIN
# =========================

@auth_router.post("/login", dependencies=[Depends(login_rate_limiter)])
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    # Check admin table first
    from app.models.user import Admin
    from app.models.security import verify_password as vp

    admin = (
        db.query(Admin)
        .filter(Admin.username == login_data.username)
        .first()
    )

    if admin:
        # Try bcrypt verify first; fall back to constant-time plain-text check for manually inserted admin records
        password_ok = False
        needs_rehash = False
        try:
            password_ok = vp(login_data.password, admin.password)
        except Exception:
            pass
        if not password_ok:
            import secrets
            if isinstance(admin.password, str) and isinstance(login_data.password, str):
                password_ok = secrets.compare_digest(admin.password, login_data.password)
                if password_ok:
                    needs_rehash = True

        if password_ok:
            # Transparently upgrade plaintext admin password to secure bcrypt hash in the database
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

    # Check users table
    user = (
        db.query(User)
        .filter(User.username == login_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

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
