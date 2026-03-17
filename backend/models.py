from sqlalchemy import Column, DateTime, Integer, String

try:
    from .database import Base
except ImportError:
    from database import Base

class Note(Base):
    __tablename__ = 'notes'

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    def __repr__(self):
        return f"<Note(id={self.id}, title='{self.title}')>"
