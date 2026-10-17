import json
from typing import TypeVar ,Literal

from groq import AsyncGroq, BadRequestError
from pydantic import BaseModel, ValidationError

from app.config import get_settings

settings = get_settings()
client = AsyncGroq(api_key=settings.groq_api_key)

T = TypeVar("T", bound=BaseModel)


async def chat_text(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.6,
    max_tokens: int = 600,
) -> str:
    resp = await client.chat.completions.create(
        model=model or settings.groq_fast_model,
        messages=messages,
        temperature=temperature,
        max_completion_tokens=max_tokens,
        reasoning_effort="low",   # keeps the interviewer fast
    )
    return resp.choices[0].message.content or ""


async def chat_json(
    messages: list[dict],
    schema: type[T],
    model: str | None = None,
    temperature: float = 0.0,
    retries: int = 2,
    max_tokens: int = 4096,
    reasoning_effort: Literal["low", "medium", "high"] = "low",
) -> T:
    """Call Groq in JSON mode and return a validated Pydantic object.
    Assumes messages[0] is the system message."""
    msgs = list(messages)
    msgs[0] = {
        "role": "system",
        "content": msgs[0]["content"]
        + "\n\nRespond with ONLY a JSON object matching this JSON schema:\n"
        + json.dumps(schema.model_json_schema()),
    }

    last_error: Exception | None = None
    for _ in range(retries + 1):
        try:
            resp = await client.chat.completions.create(
                model=model or settings.groq_smart_model,
                messages=msgs,
                temperature=temperature,
                response_format={"type": "json_object"},
                max_completion_tokens=max_tokens,
                reasoning_effort=reasoning_effort,
            )
        except BadRequestError as e:
            # e.g. json_validate_failed: model ran out of tokens or produced bad JSON
            last_error = e
            continue

        content = resp.choices[0].message.content or ""
        try:
            return schema.model_validate_json(content)
        except ValidationError as e:
            last_error = e
            msgs.append({"role": "assistant", "content": content})
            msgs.append(
                {
                    "role": "user",
                    "content": f"Invalid JSON for the schema: {e}. Fix it and return only the JSON.",
                }
            )

    raise RuntimeError(f"LLM failed to return valid {schema.__name__}: {last_error}")