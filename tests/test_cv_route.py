import unittest
from unittest.mock import patch

from fastapi import HTTPException

from cario.api.routes.cv import create_cv_review
from cario.api.schemas import CvReviewRequest
from cario.core.config import settings


class CvRouteTests(unittest.TestCase):
    def setUp(self) -> None:
        self.payload = CvReviewRequest(
            cv_text="Học vấn: Công nghệ thông tin. Dự án: phân tích dữ liệu bằng SQL.",
            target_role="Kỹ sư dữ liệu",
            evidence=[],
        )

    def test_missing_key_is_actionable(self) -> None:
        with patch.object(settings, "google_api_key", None):
            with self.assertRaises(HTTPException) as caught:
                create_cv_review(self.payload)
        self.assertEqual(caught.exception.status_code, 503)
        self.assertIn("GOOGLE_API_KEY", caught.exception.detail)

    def test_generation_failure_is_not_hidden_as_unavailable(self) -> None:
        with patch.object(settings, "google_api_key", "test-key"), patch(
            "cario.api.routes.cv.review_cv", side_effect=RuntimeError("test failure")
        ), patch("cario.api.routes.cv.logger.exception"):
            with self.assertRaises(HTTPException) as caught:
                create_cv_review(self.payload)
        self.assertEqual(caught.exception.status_code, 502)
        self.assertIn("thử", caught.exception.detail)


if __name__ == "__main__":
    unittest.main()
