import re
from collections import Counter

from app.agents.planner.prompts import PLANNER_SYSTEM, build_user_prompt
from app.agents.planner.schema import InterviewPlan
from app.config import get_settings
from app.llm.groq_client import chat_json

settings = get_settings()

MINIMUMS = {"project_deep_dive": 1, "fundamentals": 2, "behavioral": 1}
DIFFICULTY_RANK = {"easy": 0, "medium": 1, "hard": 2}
CATEGORY_ORDER = {
    "project_deep_dive": 0,
    "fundamentals": 1,
    "role_specific": 2,
    "system_design": 3,
    "behavioral": 4,
}

PROJECT_VERBS = re.compile(
    r"\b(built|deployed|optimized|optimised|architected|designed|developed|implemented)\b",
    re.I,
)

AREAS = {
    "os": ("operating system", "process", "thread", "scheduling", "deadlock", "memory"),
    "dsa": ("data structure", "algorithm", "complexity", "hash", "tree", "graph"),
    "dbms": ("dbms", "transaction", "normaliz", "acid", "index"),
    "networks": ("network", "tcp", "http", "dns", "socket"),
}


def validate_plan(plan: InterviewPlan) -> list[str]:
    problems: list[str] = []

    # 1. Minimum number of topics per category
    counts = Counter(t.category for t in plan.topics)
    for category, needed in MINIMUMS.items():
        if counts[category] < needed:
            problems.append(
                f"Need at least {needed} '{category}' topic(s) but found {counts[category]}."
            )

    # 2. Per-topic quality checks
    for t in plan.topics:
        if len(t.focus.split()) < 8:
            problems.append(f"Topic {t.id} has a vague focus. Name concrete concepts to probe.")
        if t.grounded_in.count(";") >= 2:
            problems.append(f"Topic {t.id} is grounded in too many claims. Narrow it to one idea.")

    # 3. Fundamentals must be real fundamentals (checks substance, not just the label)
    fundamentals = [t for t in plan.topics if t.category == "fundamentals"]
    covered: set[str] = set()
    for t in fundamentals:
        if PROJECT_VERBS.search(t.grounded_in):
            problems.append(
                f"Topic {t.id} is labelled fundamentals but is grounded in a project claim. "
                "Fundamentals must come from coursework or JD requirements and test concepts "
                "independent of any project."
            )
        text = f"{t.title} {t.focus}".lower()
        covered |= {area for area, keywords in AREAS.items() if any(k in text for k in keywords)}

    if len(covered) < 2:
        problems.append(
            "Fundamentals topics must cover at least two different areas "
            "(operating systems, data structures and algorithms, DBMS, networks)."
        )

    return problems


def normalize(plan: InterviewPlan) -> InterviewPlan:
    """Sort easy -> hard (warm-up project first) and renumber ids t1, t2, ..."""
    plan.topics.sort(key=lambda t: (DIFFICULTY_RANK[t.difficulty], CATEGORY_ORDER[t.category]))
    for i, t in enumerate(plan.topics, 1):
        t.id = f"t{i}"
    return plan


async def plan_interview(
    resume: str, jd: str, role: str = "Backend Engineer Intern", minutes: int = 20
) -> InterviewPlan:
    messages = [
        {"role": "system", "content": PLANNER_SYSTEM},
        {"role": "user", "content": build_user_prompt(resume, jd, role, minutes)},
    ]

    plan = None
    for _ in range(3):
        plan = await chat_json(
            messages, InterviewPlan, model=settings.groq_smart_model, temperature=0.3
        )
        problems = validate_plan(plan)
        if not problems:
            return normalize(plan)
        messages.append({"role": "assistant", "content": plan.model_dump_json()})
        messages.append(
            {
                "role": "user",
                "content": "Fix these problems and return the full corrected plan as JSON only:\n- "
                + "\n- ".join(problems),
            }
        )

    return normalize(plan)  # best effort if it still fails after 3 tries