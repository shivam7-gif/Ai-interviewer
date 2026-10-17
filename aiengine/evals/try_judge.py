import asyncio

from app.agents.judge.agent import judge_answer

QUESTION = "In your project you used Redis caching and got p95 latency under 50ms. How did caching achieve that?"

ANSWERS = {
    "strong": (
        "We cached the most frequent read endpoints in Redis using a cache-aside pattern. "
        "On a miss we query MySQL and write back with a 5 minute TTL, and we invalidate the key on writes. "
        "That removed the database round trip for around 90 percent of reads, which is where most of the latency was. "
        "The trade-off is stale data inside the TTL window, which was fine for our use case."
    ),
    "vague": "Redis is in memory so it is really fast, and we used it to make the API faster and more scalable.",
    "wrong": "Redis makes the code run faster because it compiles the Python to machine code before the request.",
}


async def main():
    for label, answer in ANSWERS.items():
        ev = await judge_answer("q1", QUESTION, answer)
        print(f"\n=== {label.upper()}  overall {ev.overall}/10 ===")
        for s in ev.scores:
            print(f"  {s.criterion:<19} {s.score}/10  | {s.reasoning}")
        print("  follow-up:", ev.followup_suggestion)


asyncio.run(main())