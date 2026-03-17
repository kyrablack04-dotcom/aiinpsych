import os


def _truncate(text: str, max_len: int) -> str:
    cleaned = " ".join(text.split())
    if len(cleaned) <= max_len:
        return cleaned
    return f"{cleaned[: max_len - 3]}..."


def _fallback_summary(title: str, content: str, tags: list[str]) -> str:
    body = _truncate(content, 260)
    risk_hint = "No explicit risk language detected."
    lowered = content.lower()
    if any(word in lowered for word in ["suicidal", "self-harm", "harm", "unsafe", "crisis"]):
        risk_hint = "Potential risk language present; prioritize safety follow-up."

    lines = [
        f"Summary for '{title.strip() or 'Untitled note'}':",
        f"- Key points: {body}",
        f"- Risks: {risk_hint}",
        f"- Interventions/themes: {', '.join(tags) if tags else 'No tags provided'}.",
        "- Follow-up: Confirm next session goals and any coping actions before closing.",
    ]
    return "\n".join(lines)


def generate_note_summary(title: str, content: str, tags: list[str] | None = None) -> tuple[str, str]:
    tag_list = [tag.strip() for tag in (tags or []) if tag.strip()]
    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            model_name = "gemini-2.5-flash"
            model = genai.GenerativeModel(model_name)
            prompt = (
                "You are an assistant helping summarize psychotherapy-related notes. "
                "Write 4 bullets in this exact order: Key points, Risks, Interventions/themes, Follow-up. "
                "Use neutral language and avoid diagnosis claims.\n\n"
                f"Title: {title}\n"
                f"Tags: {', '.join(tag_list) if tag_list else 'none'}\n"
                f"Note content:\n{content}"
            )
            response = model.generate_content(prompt)
            summary = (response.text or "").strip()
            if summary:
                return summary, model_name
        except Exception:
            pass

    return _fallback_summary(title, content, tag_list), "fallback-local"
