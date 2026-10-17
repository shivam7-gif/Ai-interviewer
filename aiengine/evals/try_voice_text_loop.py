import asyncio
import json
import time

from app.voice.audio import play_wav
from datetime import datetime
from pathlib import Path

from app.agents.interviewer.agent import interviewer_turn
from app.agents.judge.agent import judge_answer
from app.agents.planner.agent import plan_interview
from app.graph.routing import apply_action, decide_action
from app.graph.state import InterviewState
from app.voice.tts import split_sentences, synthesize

ROOT = Path(__file__).resolve().parent.parent
VOICE_DIR = ROOT / "voice_data"
PLAY_AUDIO = True  # set False to only save the files


def read_input(name: str) -> str:
    for p in (ROOT / name, ROOT / "data" / name):
        if p.exists():
            return p.read_text(encoding="utf-8")
    raise FileNotFoundError(f"{name} not found in {ROOT} or {ROOT / 'data'}")


async def speak(text: str, turn: int, out_dir: Path) -> None:
    print(f"\nINTERVIEWER: {text}")
    # Generate all sentences at once, then save and play them in order.
    tasks = [asyncio.create_task(synthesize(s)) for s in split_sentences(text)]
    for i, task in enumerate(tasks, 1):
        try:
            wav = await task
        except Exception as e:  # keep the interview going even if TTS fails
            print(f"   [tts error: {e}]")
            continue

        (out_dir / f"turn{turn:02d}_s{i}.wav").write_bytes(wav)

        if PLAY_AUDIO:
            try:
                await asyncio.to_thread(play_wav, wav)
            except Exception as e:  # a speaker problem should not kill the interview
                print(f"   [playback error: {e}]")
                
def save_session(state: InterviewState, out_dir: Path) -> None:
    data = {
        "transcript": state.transcript,
        "evaluations": [
            {
                "question_id": e.question_id,
                "overall": e.overall,
                "scores": [s.model_dump() for s in e.scores],
                "followup_suggestion": e.followup_suggestion,
            }
            for e in state.evaluations
        ],
    }
    (out_dir / "session.json").write_text(json.dumps(data, indent=2), encoding="utf-8")


async def main():
    out_dir = VOICE_DIR / f"session_{datetime.now():%Y%m%d_%H%M%S}"
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"Saving audio to {out_dir}\nType /q to quit.")

    plan = await plan_interview(read_input("sample_resume.txt"), read_input("sample_jd.txt"))
    state = InterviewState(session_id=out_dir.name, plan=plan)

    turn = 1
    state.last_action = "ask"
    state.questions_asked = 1
    await speak(await interviewer_turn(state, "ask"), turn, out_dir)

    try:
        while not state.finished:
            answer = (await asyncio.to_thread(input, "\nYOU: ")).strip()
            if answer.lower() in {"/q", "/quit"}:
                break
            if not answer:
                continue
            state.transcript.append({"role": "candidate", "text": answer})

            t0 = time.perf_counter()
            evaluation = await judge_answer(
                f"q{state.questions_asked}", state.current_question, answer, role=state.role
            )
            t1 = time.perf_counter()
            state.evaluations.append(evaluation)

            action = decide_action(state, answer, evaluation)
            apply_action(state, action)

            line = await interviewer_turn(state, action, answer, evaluation.followup_suggestion)
            t2 = time.perf_counter()
            print(
                f"   [debug: score {evaluation.overall}/10 -> {action}, topic t{state.topic_idx + 1} "
                f"| judge {t1 - t0:.1f}s, interviewer {t2 - t1:.1f}s]"
            )

            turn += 1
            await speak(line, turn, out_dir)
    finally:
        save_session(state, out_dir)
        print(f"\nSession saved to {out_dir}")


asyncio.run(main())