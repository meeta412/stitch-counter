import httpx

from config import settings


class LLMError(Exception):
    pass


def generate_text(prompt: str, model: str | None = None) -> str:
    if not settings.openai_api_key:
        raise LLMError('OPENAI_API_KEY is not configured')

    model_name = model or settings.openai_model
    url = 'https://api.openai.com/v1/chat/completions'
    payload = {
        'model': model_name,
        'messages': [
            {
                'role': 'system',
                'content': 'You return only valid JSON when asked. No markdown fences or commentary.',
            },
            {'role': 'user', 'content': prompt},
        ],
        'temperature': 0.2,
    }
    headers = {
        'Authorization': f'Bearer {settings.openai_api_key}',
        'Content-Type': 'application/json',
    }

    try:
        with httpx.Client(verify=settings.ssl_verify, timeout=60.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:200]
        raise LLMError(f'OpenAI API error ({exc.response.status_code}): {detail}') from exc
    except httpx.HTTPError as exc:
        raise LLMError(f'Could not reach OpenAI API: {exc}') from exc

    try:
        content = data['choices'][0]['message']['content']
        return content.strip() if content else ''
    except (KeyError, IndexError, TypeError) as exc:
        raise LLMError('OpenAI API returned an unexpected response') from exc
