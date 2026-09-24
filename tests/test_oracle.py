from copy import deepcopy
from random import Random
import unittest

from cario.oracle.questions import DIMENSIONS, QUESTION_BANK
from cario.oracle.scoring import InvalidAnswers, score_answers, validate_answers
from cario.api.schemas import OracleAnalysis


def answers_for(option_id: str) -> list[dict[str, str]]:
    return [{"question_key": question["key"], "option_id": option_id} for question in QUESTION_BANK]


class OracleScoringTests(unittest.TestCase):
    def test_ai_analysis_accepts_extra_list_items_without_losing_result(self) -> None:
        analysis = OracleAnalysis.model_validate({
            "overview": "Một cách đọc từ lựa chọn của bạn.",
            "observations": ["Một", "Hai", "Ba", "Bốn"],
            "next_experiments": ["Một", "Hai", "Ba", "Bốn"],
            "reflection_questions": ["Một?", "Hai?", "Ba?"],
        })
        self.assertEqual(analysis.observations, ["Một", "Hai", "Ba"])
        self.assertEqual(analysis.next_experiments, ["Một", "Hai", "Ba"])
        self.assertEqual(analysis.reflection_questions, ["Một?", "Hai?"])

    def test_bank_is_balanced_and_complete(self) -> None:
        self.assertEqual(len(QUESTION_BANK), 18)
        self.assertEqual(len({question["key"] for question in QUESTION_BANK}), len(QUESTION_BANK))
        for question in QUESTION_BANK:
            self.assertEqual(len(question["options"]), 4)
            self.assertEqual({option["id"] for option in question["options"]}, {"A", "B", "C", "D"})
            for option in question["options"]:
                self.assertTrue(set(option["weights"]).issubset(DIMENSIONS))


    def test_scores_are_deterministic_and_bounded(self) -> None:
        answers = answers_for("A")
        selected = validate_answers(QUESTION_BANK, answers, complete=True)
        self.assertEqual(score_answers(QUESTION_BANK, selected), score_answers(deepcopy(QUESTION_BANK), selected))
        self.assertTrue(all(0 <= score <= 100 for score in score_answers(QUESTION_BANK, selected).values()))
        self.assertEqual(sum(score_answers(QUESTION_BANK, selected).values()), 100)
        for option_id in "BCD":
            selected = validate_answers(QUESTION_BANK, answers_for(option_id), complete=True)
            self.assertEqual(sum(score_answers(QUESTION_BANK, selected).values()), 100)
        random = Random(2026)
        for _ in range(100):
            varied = [{"question_key": question["key"], "option_id": random.choice("ABCD")} for question in QUESTION_BANK]
            selected = validate_answers(QUESTION_BANK, varied, complete=True)
            self.assertEqual(sum(score_answers(QUESTION_BANK, selected).values()), 100)


    def test_rejects_missing_duplicate_and_fake_options(self) -> None:
        with self.assertRaises(InvalidAnswers):
            validate_answers(QUESTION_BANK, answers_for("A")[:-1], complete=True)
        with self.assertRaises(InvalidAnswers):
            validate_answers(QUESTION_BANK, answers_for("A") + [answers_for("A")[0]], complete=True)
        with self.assertRaises(InvalidAnswers):
            validate_answers(QUESTION_BANK, [{"question_key": QUESTION_BANK[0]["key"], "option_id": "Z"}], complete=False)


if __name__ == "__main__":
    unittest.main()
