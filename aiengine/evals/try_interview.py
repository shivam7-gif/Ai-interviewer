import asyncio
from pathlib import Path

from app.agents.interviewer.agent import interviewer_turn
from app.agents.judge.agent import judge_answer
from app.agents.planner.agent import plan_interview
from app.graph.routing import apply_action, decide_action
from app.graph.state import InterviewState

resume = Path("data/sample_resume.txt").read_text(encoding="utf-8")
jd = Path("data/sample_jd.txt").read_text(encoding="utf-8")


async def main():
    plan = await plan_interview(resume, jd)
    state = InterviewState(session_id="demo", plan=plan)

    # Opening turn: first topic, no judging yet
    state.last_action = "ask"
    state.questions_asked = 1
    line = await interviewer_turn(state, "ask")
    print(f"\nINTERVIEWER: {line}")

    while not state.finished:
        answer = (await asyncio.to_thread(input, "\nYOU: ")).strip()
        if answer.lower() in {"/q", "/quit"}:
            break
        state.transcript.append({"role": "candidate", "text": answer})

        # For now we wait for the judge. Later it moves to a background task.
        evaluation = await judge_answer(
            f"q{state.questions_asked}", state.current_question, answer, role=state.role
        )
        state.evaluations.append(evaluation)

        action = decide_action(state, answer, evaluation)
        apply_action(state, action)
        print(f"   [debug: score {evaluation.overall}/10 -> {action}, topic t{state.topic_idx + 1}]")

        line = await interviewer_turn(state, action, answer, evaluation.followup_suggestion)
        print(f"\nINTERVIEWER: {line}")


asyncio.run(main())