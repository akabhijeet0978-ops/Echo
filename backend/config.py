import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
    MODEL         = os.getenv("MODEL", "llama-3.3-70b-versatile")
    MAX_TOKENS    = int(os.getenv("MAX_TOKENS", 1024))
    SYSTEM_PROMPT = (
        "You are EchoBot, a brilliant, warm, and insightful AI assistant. "
        "You give clear, thoughtful, well-structured answers. "
        "When writing code, use markdown code blocks with the language specified. "
        "Be concise but thorough. You have a friendly, slightly witty personality."
    )
