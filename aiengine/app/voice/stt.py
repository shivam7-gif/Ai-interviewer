from app.config import get_settings
from app.llm.groq_client import client

settings = get_settings()

# Whisper often mangles tech names. A short vocabulary hint helps a lot.
STT_HINT = (
    "Technical interview. Terms: Redis, Neo4j, Pinecone, Qdrant, LangGraph, LangChain, "
    "FastAPI, Docker, Kubernetes, AWS ECS, WebSocket, RAG, PostgreSQL, MongoDB, MySQL, Kafka."
)


async def transcribe(audio: bytes, filename: str = "audio.wav") -> str:
    """filename's extension tells Groq the format (use audio.webm for browser recordings)."""
    r = await client.audio.transcriptions.create(
        file=(filename, audio),
        model=settings.groq_stt_model,
        language="en",
        temperature=0.0,
        prompt=STT_HINT,
    )
    return r.text.strip()