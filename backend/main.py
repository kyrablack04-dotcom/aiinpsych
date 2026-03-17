from datetime import datetime
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import or_
from sqlalchemy.orm import Session

try:
    from .database import Base, SessionLocal, engine
    from .models import Note, Tag
except ImportError:
    from database import Base, SessionLocal, engine
    from models import Note, Tag

app = FastAPI()


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    tags: list[str] = []


class NoteTagsUpdate(BaseModel):
    tags: list[str]


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    tags: list[str] = []

    model_config = ConfigDict(from_attributes=True)

    @field_validator('tags', mode='before')
    @classmethod
    def convert_tags(cls, value):
        if value and hasattr(value[0], 'name'):
            return [tag.name for tag in value]
        return value


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_or_create_tag(db: Session, name: str) -> Tag:
    tag = db.query(Tag).filter(Tag.name == name).first()
    if tag is None:
        tag = Tag(name=name)
        db.add(tag)
    return tag


def query_notes(db: Session, keyword: str | None = None, tag: str | None = None) -> list[Note]:
    query = db.query(Note)

    if keyword:
        search_term = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Note.title.ilike(search_term),
                Note.content.ilike(search_term),
            )
        )

    if tag:
        query = query.join(Note.tags).filter(Tag.name == tag.strip().lower())

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
def list_notes(
    tag: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return query_notes(db, tag=tag)


@app.get("/notes/search", response_model=list[NoteResponse])
def search_notes(
    q: str = Query(default="", alias="q"),
    tag: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return query_notes(db, q, tag=tag)


@app.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    timestamp = datetime.utcnow()
    tag_names = [tag.strip().lower() for tag in note.tags if tag.strip()]
    new_note = Note(
        title=note.title.strip(),
        content=note.content.strip(),
        created_at=timestamp,
        updated_at=timestamp,
        tags=[get_or_create_tag(db, name) for name in tag_names],
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


@app.patch("/notes/{note_id}/tags", response_model=NoteResponse)
def update_note_tags(note_id: int, payload: NoteTagsUpdate, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    tag_names = [tag.strip().lower() for tag in payload.tags if tag.strip()]
    note.tags = [get_or_create_tag(db, name) for name in tag_names]
    db.commit()
    db.refresh(note)
    return note


@app.get("/tags", response_model=list[str])
def list_tags(db: Session = Depends(get_db)):
    rows = db.query(Tag.name).order_by(Tag.name).all()
    return [row[0] for row in rows]