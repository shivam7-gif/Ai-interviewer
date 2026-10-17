import re

import httpx

from app.config import get_settings

settings = get_settings()

SPEECH_URL = "https://api.groq.com/openai/v1/audio/speech"
_http = httpx.AsyncClient(timeout=30)


async def synthesize(text: str, voice: str | None = None) -> bytes:
    resp = await _http.post(
        SPEECH_URL,
        headers={"Authorization": f"Bearer {settings.groq_api_key}"},
        json={
            "model": settings.groq_tts_model,
            "voice": voice or settings.groq_tts_voice,
            "input": text,
            "response_format": "wav",
        },
    )
    if resp.status_code != 200:
        raise RuntimeError(f"TTS failed ({resp.status_code}): {resp.text}")
    return resp.content


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]