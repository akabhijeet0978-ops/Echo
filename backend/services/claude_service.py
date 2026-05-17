import json
from groq import Groq
from config import Config
from models.conversation import ConversationStore

store = ConversationStore()


class ClaudeService:
    def __init__(self):
        self.client = Groq(api_key=Config.GROQ_API_KEY)

    def chat(self, messages: list, conversation_id: str = None) -> tuple[str, str]:
        """
        Send messages to Groq and return (reply_text, conversation_id).
        Persists the conversation to the store.
        """
        response = self.client.chat.completions.create(
            model=Config.MODEL,
            max_tokens=Config.MAX_TOKENS,
            messages=[{"role": "system", "content": Config.SYSTEM_PROMPT}] + messages,
        )

        reply = response.choices[0].message.content

        # Persist conversation
        all_messages = list(messages) + [{"role": "assistant", "content": reply}]
        conv_id = store.save_conversation(all_messages, conversation_id)

        return reply, conv_id

    def stream_chat(self, messages: list):
        """
        Stream Groq response as text chunks (generator).
        Yields raw text deltas as JSON strings.
        """
        stream = self.client.chat.completions.create(
            model=Config.MODEL,
            max_tokens=Config.MAX_TOKENS,
            messages=[{"role": "system", "content": Config.SYSTEM_PROMPT}] + messages,
            stream=True,
        )

        for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                yield json.dumps({"delta": delta})
