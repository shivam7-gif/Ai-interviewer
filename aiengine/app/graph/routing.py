import re

from app.agents.judge.schema import AnswerEvaluation
from app.graph.state import Action, InterviewState

MAX_PROBES = 2
MAX_QUESTIONS = 10
STRONG_SCORE = 6.5

STUCK = re.compile(
    r"\b(i don'?t know|no idea|not sure|can'?t remember|never (used|worked)|haven'?t (used|worked)|skip|pass)\b",
    re.I,
)


def _advance(state: InterviewState) -> Action:
    last_topic = state.topic_idx + 1 >= len(state.plan.topics)
    if last_topic or state.questions_asked >= MAX_QUESTIONS:
        return "wrap_up"
    return "ask"


def decide_action(
    state: InterviewState, answer: str, evaluation: AnswerEvaluation | None
) -> Action:
    stuck = bool(STUCK.search(answer)) or len(answer.split()) < 4
    if stuck:
        return "nudge" if state.nudges_used < 1 else _advance(state)

    weak = evaluation is not None and evaluation.overall < STRONG_SCORE
    if weak and evaluation.followup_suggestion and state.probes_used < MAX_PROBES:
        return "probe"

    return _advance(state)


def apply_action(state: InterviewState, action: Action) -> None:
    
    if action == "probe":
        state.probes_used += 1
        state.questions_asked += 1
    elif action == "nudge":
        state.nudges_used += 1
    elif action == "ask":
        state.topic_idx += 1
        state.probes_used = 0
        state.nudges_used = 0
        state.questions_asked += 1
    elif action == "wrap_up":
        state.finished = True
    state.last_action = action