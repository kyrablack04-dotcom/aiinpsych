from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base


note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('notes.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True),
)


class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False, index=True)

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}')>"

class Note(Base):
    __tablename__ = 'notes'

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    tags = relationship('Tag', secondary=note_tags, backref='notes')
    summary_record = relationship('NoteSummary', back_populates='note', uselist=False)

    @property
    def summary(self):
        if self.summary_record is None:
            return None
        return self.summary_record.summary

    @property
    def summary_updated_at(self):
        if self.summary_record is None:
            return None
        return self.summary_record.generated_at

    @property
    def summary_model(self):
        if self.summary_record is None:
            return None
        return self.summary_record.model_name

    def __repr__(self):
        return f"<Note(id={self.id}, title='{self.title}')>"


class NoteSummary(Base):
    __tablename__ = 'note_summaries'

    id = Column(Integer, primary_key=True)
    note_id = Column(Integer, ForeignKey('notes.id'), nullable=False, unique=True, index=True)
    summary = Column(String, nullable=False)
    generated_at = Column(DateTime, nullable=False)
    model_name = Column(String, nullable=False)
    note = relationship('Note', back_populates='summary_record')

    def __repr__(self):
        return f"<NoteSummary(note_id={self.note_id}, model='{self.model_name}')>"
