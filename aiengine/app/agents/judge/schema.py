from typing import Literal
from pydantic import BaseModel, Field

Criterion = Literal["technical_accuracy", "depth", "structure", "communication"]


class CriterionScore(BaseModel):
    criterion: Criterion
    evidence: str = Field(description="Short VERBATIM quote from the answer, or 'NONE' if nothing supports this criterion")
    reasoning: str = Field(description="One or two sentences justifying the score")
    score: int = Field(ge=0, le=10)


class JudgeOutput(BaseModel):
    """What the LLM returns."""
    scores: list[CriterionScore]
    followup_suggestion: str | None = Field(
        default=None,
        description="A probing question the interviewer should ask next, or null if the answer was solid",
    )


class AnswerEvaluation(JudgeOutput):
    """JudgeOutput plus the bookkeeping our code adds."""
    question_id: str

    @property
    def overall(self) -> float:
        return round(sum(s.score for s in self.scores) / len(self.scores), 1)