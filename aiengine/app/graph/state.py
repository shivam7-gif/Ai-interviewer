from dataclasses import dataclass, field
from typing import Literal

from app.agents.judge.schema import AnswerEvaluation
from app.agents.planner.schema import InterviewPlan, Topic

Action = Literal["ask", "probe", "nudge", "wrap_up"]


@dataclass
class InterviewState:
    session_id: str
    plan: InterviewPlan
    role: str = "Backend Engineer Intern"
    topic_idx: int = 0
    probes_used: int = 0          
    nudges_used: int = 0        
    questions_asked: int = 0     
    current_question: str = ""
    last_action: Action | None = None
    finished: bool = False
    transcript: list[dict] = field(default_factory=list)
    evaluations: list[AnswerEvaluation] = field(default_factory=list)

    @property
    def topic(self) -> Topic:
        return self.plan.topics[self.topic_idx]