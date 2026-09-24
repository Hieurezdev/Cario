import io
import json
import unittest
from unittest.mock import patch

from cario.api.schemas import CoachResponse
from cario.core.config import settings
from cario.services.llm_proxy import ProxyError, chat_completion, structured_completion


def proxy_response(content: str) -> io.BytesIO:
    return io.BytesIO(json.dumps({"choices": [{"message": {"content": content}}]}).encode())


class LlmProxyTests(unittest.TestCase):
    def test_chat_preserves_recent_conversation_and_strips_thinking(self) -> None:
        with patch.object(settings, "qwen_base_url", "http://proxy.test/v1"), patch.object(settings, "qwen_api_key", "test-key"), patch(
            "cario.services.llm_proxy.urlopen", return_value=proxy_response("<think>internal</think>Chào bạn!")
        ) as send:
            answer = chat_completion("Follow the system rules", "How are you?", history=[{"role": "user", "content": "Hello"}])
        self.assertEqual(answer, "Chào bạn!")
        body = json.loads(send.call_args.args[0].data)
        self.assertEqual([item["role"] for item in body["messages"]], ["system", "user", "user"])
        self.assertFalse(body["thinking"])

    def test_structured_answer_accepts_json_fence(self) -> None:
        answer = '```json\n{"answer":"Chào!","next_steps":[],"disclaimer":""}\n```'
        with patch("cario.services.llm_proxy.chat_completion", return_value=answer):
            result = structured_completion("rules", "hello", CoachResponse)
        self.assertEqual(result.answer, "Chào!")

    def test_structured_answer_rejects_invalid_json(self) -> None:
        with patch("cario.services.llm_proxy.chat_completion", return_value="not JSON"):
            with self.assertRaises(ProxyError):
                structured_completion("rules", "hello", CoachResponse)


if __name__ == "__main__":
    unittest.main()
