from app.agents.interviewer.prompts import INTERVIEWER_SYSTEM, build_turn_prompt
from app.config import get_settings
from app.graph.state import Action, InterviewState
from app.llm.groq_client import chat_text

settings = get_settings()


async def interviewer_turn(
    state: InterviewState,
    action: Action,
    last_answer: str | None = None,
    followup: str | None = None,
) -> str:
    messages = [
        {"role": "system", "content": INTERVIEWER_SYSTEM},
        {"role": "user", "content": build_turn_prompt(state, action, last_answer, followup)},
    ]
    text = (
        await chat_text(messages, model=settings.groq_fast_model, temperature=0.6, max_tokens=600)
    ).strip()

    state.transcript.append({"role": "interviewer", "text": text})
    if action != "wrap_up":
        state.current_question = text
    return text