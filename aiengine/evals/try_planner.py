import asyncio
from pathlib import Path

from app.agents.planner.agent import plan_interview

resume = Path("data/sample_resume.txt").read_text(encoding="utf-8")
jd = Path("data/sample_jd.txt").read_text(encoding="utf-8")


async def main():
    plan = await plan_interview(resume, jd)
    print("SUMMARY:", plan.candidate_summary, "\n")
    for t in plan.topics:
        print(f"[{t.id}] {t.title}  ({t.category}, {t.difficulty})")
        print(f"     grounded in: {t.grounded_in}")
        print(f"     focus: {t.focus}\n")


asyncio.run(main())