from typing import Literal
from pydantic import BaseModel, Field


class Topic(BaseModel):
    id: str = Field(description="Short id like t1, t2")
    title: str
    category: Literal[
        "project_deep_dive", "fundamentals", "system_design", "role_specific", "behavioral"
    ]
    difficulty: Literal["easy", "medium", "hard"]
    grounded_in: str = Field(
        description="The exact resume claim or JD requirement this topic comes from"
    )
    focus: str = Field(description="What the interviewer should probe, in one sentence")


class InterviewPlan(BaseModel):
    candidate_summary: str = Field(description="Two sentences: level and main strengths")
    topics: list[Topic] = Field(min_length=5, max_length=7)