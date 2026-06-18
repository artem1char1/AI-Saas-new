from openai import AsyncOpenAI

from app.core.config import settings


class GroqProvider:
    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is not configured")

        self._client = AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        self._model = settings.groq_model

    async def complete(self, *, system_prompt: str, user_prompt: str) -> str:
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=700,
        )

        content = response.choices[0].message.content
        if not content or not content.strip():
            raise ValueError("Empty response from Groq")

        return content.strip()
