import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


def summarize_note(content: str) -> str:
    """Use Gemini to produce a concise summary of the given note content."""
    prompt = (
        "You are a helpful assistant. Summarize the following note in 2-3 sentences:\n\n"
        f"{content}"
    )
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as exc:
        logger.error("Gemini summarization failed: %s", exc)
        raise
