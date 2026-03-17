from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_service import summarize_note

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class SummarizeRequest(BaseModel):
    content: str


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/summarize")
async def summarize(request: SummarizeRequest):
    """Return an AI-generated summary for the given note content."""
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")
    try:
        summary = summarize_note(request.content)
        return {"summary": summary}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate summary.")