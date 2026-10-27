from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os
import shutil

from database import get_db
from app.models.news import News
from dependencies import require_admin

news_router = APIRouter(prefix="/news", tags=["news"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@news_router.get("/")
def get_news(year: int = datetime.now().year, db: Session = Depends(get_db)):
    items = (
        db.query(News)
        .filter(News.year == year)
        .order_by(News.created_at.desc())
        .all()
    )
    return {
        "news": [
            {c.key: getattr(n, c.key) for c in n.__table__.columns}
            for n in items
        ]
    }


from app.utils.uploads import save_upload_file

@news_router.post("/")
async def create_news(
    title: str = Form(...),
    content: str = Form(...),
    year: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    filename = save_upload_file(image, UPLOAD_DIR)

    news = News(
        title=title,
        content=content,
        image=filename,
        year=year or datetime.now().year
    )
    db.add(news)
    db.commit()
    return {"message": "News posted"}


@news_router.delete("/{nid}")
def delete_news(
    nid: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    item = db.query(News).filter(News.id == nid).first()
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    db.delete(item)
    db.commit()
    return {"message": "News deleted"}
