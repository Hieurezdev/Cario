"""Small server-side client for the user's OpenAI-compatible Qwen proxy."""

import json
import re
from typing import TypeVar
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from pydantic import BaseModel

from cario.core.config import settings


T = TypeVar("T", bound=BaseModel)


class ProxyError(RuntimeError):
    def __init__(self, message: str, code: int | None = None) -> None:
        super().__init__(message)
        self.code = code


def chat_completion(
    system: str,
    user: str,
    *,
    history: list[dict[str, str]] | None = None,
    temperature: float = 0.35,
    max_tokens: int = 1200,
) -> str:
    if not settings.qwen_base_url or not settings.qwen_api_key:
        raise ProxyError("Qwen proxy is not configured.")
    if not settings.qwen_base_url.startswith(("https://", "http://")):
        raise ProxyError("QWEN_BASE_URL must use http:// or https://.")
    messages = [{"role": "system", "content": system}, *(history or []), {"role": "user", "content": user}]
    payload = json.dumps({
        "model": settings.qwen_model,
        "messages": messages,
        "thinking": False,
        "stream": False,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }, ensure_ascii=False).encode("utf-8")
    request = Request(
        f"{settings.qwen_base_url}/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {settings.qwen_api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=settings.qwen_timeout) as response:
            body = json.load(response)
    except HTTPError as error:
        raise ProxyError(f"Qwen proxy returned HTTP {error.code}.", error.code) from error
    except (URLError, TimeoutError) as error:
        raise ProxyError("Qwen proxy is unreachable or timed out.") from error
    try:
        content = body["choices"][0]["message"]["content"]
        if not isinstance(content, str):
            raise ValueError("Non-text Qwen response")
        answer = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
        if not answer:
            raise ValueError("Empty Qwen response")
        return answer
    except (KeyError, IndexError, TypeError, ValueError) as error:
        raise ProxyError("Qwen proxy returned an invalid response.") from error


def structured_completion(system: str, user: str, schema: type[T], *, max_tokens: int = 1600) -> T:
    schema_prompt = f"{system}\nReturn only a JSON object matching this schema, with no Markdown or commentary:\n{json.dumps(schema.model_json_schema(), ensure_ascii=False)}"
    answer = chat_completion(schema_prompt, user, temperature=0.2, max_tokens=max_tokens)
    cleaned = answer.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE).strip()
    try:
        return schema.model_validate_json(cleaned)
    except ValueError as error:
        raise ProxyError("Qwen proxy returned invalid structured JSON.") from error
