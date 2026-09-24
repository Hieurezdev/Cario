from typing import Literal

from pydantic import BaseModel, Field, field_validator


class EvidenceInput(BaseModel):
    title: str = Field(max_length=160)
    skill: str = Field(max_length=80)
    source: str = Field(max_length=160)


class CvReviewRequest(BaseModel):
    cv_text: str = Field(min_length=30, max_length=20_000)
    target_role: str = Field(min_length=2, max_length=120)
    evidence: list[EvidenceInput] = Field(default_factory=list, max_length=30)


class CvSuggestion(BaseModel):
    title: str
    detail: str
    priority: str


class CvReviewResponse(BaseModel):
    summary: str
    strengths: list[str]
    missing_or_unclear: list[str]
    suggestions: list[CvSuggestion]
    rewritten_project_example: str | None = None
    disclaimer: str


class CoachTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class CoachRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2_000)
    interest: str = Field(max_length=120)
    goal: str = Field(max_length=300)
    evidence_count: int = Field(ge=0, le=10_000)
    history: list[CoachTurn] = Field(default_factory=list, max_length=12)


class CoachResponse(BaseModel):
    answer: str
    next_steps: list[str] = Field(max_length=3)
    disclaimer: str


class PostInput(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    body: str = Field(min_length=3, max_length=4_000)
    category: str = Field(min_length=2, max_length=80)


class VoteInput(BaseModel):
    value: int = Field(ge=-1, le=1)


class CommunityInput(BaseModel):
    name: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=10, max_length=500)
    field: str = Field(min_length=2, max_length=80)


class CommentInput(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class RegisterInput(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class LoginInput(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class WorkspaceProfile(BaseModel):
    audience: str = Field(default="student", pattern="^(student|school)$")
    interest: str = Field(default="", max_length=120)
    strength: str = Field(default="", max_length=300)
    value: str = Field(default="", max_length=300)
    currentSkills: list[str] = Field(default_factory=list, max_length=100)
    discoveryCompleted: bool = False
    goal: str = Field(default="", max_length=500)
    savedQuests: list[str] = Field(default_factory=list, max_length=100)
    completedQuests: list[str] = Field(default_factory=list, max_length=100)
    evidence: list[dict] = Field(default_factory=list, max_length=100)


class MentorProfileInput(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    field: str = Field(min_length=2, max_length=80)
    skills: list[str] = Field(min_length=1, max_length=20)
    experience: str = Field(min_length=10, max_length=1000)
    achievement: str = Field(min_length=10, max_length=1000)
    bio: str = Field(min_length=10, max_length=500)
    contact_email: str | None = Field(default=None, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class OracleAnswerInput(BaseModel):
    question_key: str = Field(min_length=3, max_length=80)
    option_id: str = Field(pattern="^[A-D]$")


class OracleAnswersInput(BaseModel):
    version: int = Field(ge=1)
    answers: list[OracleAnswerInput] = Field(default_factory=list, max_length=100)


class OracleAnalysis(BaseModel):
    overview: str
    observations: list[str] = Field(max_length=3)
    next_experiments: list[str] = Field(max_length=3)
    reflection_questions: list[str] = Field(max_length=2)

    @field_validator("observations", "next_experiments", mode="before")
    @classmethod
    def keep_three_items(cls, value: object) -> object:
        return value[:3] if isinstance(value, list) else value

    @field_validator("reflection_questions", mode="before")
    @classmethod
    def keep_two_questions(cls, value: object) -> object:
        return value[:2] if isinstance(value, list) else value
