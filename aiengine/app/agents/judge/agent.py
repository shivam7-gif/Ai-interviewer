from app.agents.judge.prompts import JUDGE_SYSTEM, build_user_prompt
from app.agents.judge.schema import AnswerEvaluation, JudgeOutput
from app.config import get_settings
from app.llm.groq_client import chat_json

settings = get_settings()


async def judge_answer(
    question_id: str,
    question: str,
    answer: str,
    role: str = "Backend Engineer",
    reference: str | None = None,
    level: str = "first-year student / intern",
) -> AnswerEvaluation:
    messages = [
        {"role": "system", "content": JUDGE_SYSTEM},
        {
            "role": "user",
            "content": build_user_prompt(question, answer, role, reference, level),
        },
    ]
    out = await chat_json(
        messages,
        JudgeOutput,
        model=settings.groq_smart_model,
        temperature=0.0,
        reasoning_effort="medium",
    )
    return AnswerEvaluation(question_id=question_id, **out.model_dump())