from datetime import datetime
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

try:
    from .database import Base, SessionLocal, engine
    from .models import Note
except ImportError:
    from database import Base, SessionLocal, engine
    from models import Note

app = FastAPI()


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def query_notes(db: Session, keyword: str | None = None) -> list[Note]:
    query = db.query(Note)

    if keyword:
        search_term = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Note.title.ilike(search_term),
                Note.content.ilike(search_term),
            )
        )

    return query.order_by(Note.updated_at.desc(), Note.id.desc()).all()


Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/notes", response_model=list[NoteResponse])
def list_notes(db: Session = Depends(get_db)):
    return query_notes(db)


@app.get("/notes/search", response_model=list[NoteResponse])
def search_notes(
    q: str = Query(default="", alias="q"),
    db: Session = Depends(get_db),
):
    return query_notes(db, q)


@app.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    timestamp = datetime.utcnow()
    new_note = Note(
        title=note.title.strip(),
        content=note.content.strip(),
        created_at=timestamp,
        updated_at=timestamp,
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    db.delete(note)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)