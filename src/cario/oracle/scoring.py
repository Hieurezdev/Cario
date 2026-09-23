"""Deterministic inclination scores, not a psychometric diagnosis."""

from collections.abc import Iterable
from fractions import Fraction

from cario.oracle.questions import DIMENSIONS


class InvalidAnswers(ValueError):
    pass


SCORE_REVISION = 2


def validate_answers(questions: list[dict], answers: Iterable[dict], *, complete: bool) -> dict[str, str]:
    by_key = {question["key"]: question for question in questions}
    selected: dict[str, str] = {}
    for answer in answers:
        key, option_id = answer["question_key"], answer["option_id"]
        if key in selected:
            raise InvalidAnswers("Mỗi tình huống chỉ được chọn một phương án.")
        question = by_key.get(key)
        if question is None or option_id not in {option["id"] for option in question["options"]}:
            raise InvalidAnswers("Có tình huống hoặc phương án không hợp lệ.")
        selected[key] = option_id
    if complete and set(selected) != set(by_key):
        raise InvalidAnswers("Hãy trả lời đủ mọi tình huống trước khi xem kết quả.")
    return selected


def score_answers(questions: list[dict], selected: dict[str, str]) -> dict[str, int]:
    """Return six integer shares of observed choices that add up to exactly 100."""
    if set(selected) != {question["key"] for question in questions}:
        raise InvalidAnswers("Bộ câu trả lời chưa hoàn chỉnh.")
    totals = dict.fromkeys(DIMENSIONS, 0)
    for question in questions:
        choice = next((option for option in question["options"] if option["id"] == selected[question["key"]]), None)
        if choice is None:
            raise InvalidAnswers("Có phương án không hợp lệ.")
        for dimension, weight in choice["weights"].items():
            if dimension not in totals or not isinstance(weight, int) or weight < 0:
                raise InvalidAnswers("Trọng số Oracle không hợp lệ.")
            totals[dimension] += weight
    exposure = {dimension: sum(
        option["weights"].get(dimension, 0)
        for question in questions for option in question["options"]
    ) for dimension in DIMENSIONS}
    if sum(totals.values()) <= 0 or any(value <= 0 for value in exposure.values()):
        raise InvalidAnswers("Bộ câu hỏi chưa có trọng số để phân tích.")
    # Correct for unequal exposure in the question bank, then allocate 100 points.
    adjusted = {dimension: Fraction(totals[dimension], exposure[dimension]) for dimension in DIMENSIONS}
    adjusted_total = sum(adjusted.values())
    exact = {dimension: adjusted[dimension] * 100 / adjusted_total for dimension in DIMENSIONS}
    # Largest remainder: no rounding drift, stable tie-break by dimension order.
    scores = {dimension: exact[dimension].numerator // exact[dimension].denominator for dimension in DIMENSIONS}
    remaining = 100 - sum(scores.values())
    order = sorted(DIMENSIONS, key=lambda dimension: -(exact[dimension] - scores[dimension]))
    for dimension in order[:remaining]:
        scores[dimension] += 1
    return scores
