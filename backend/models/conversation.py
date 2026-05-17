import json
import uuid
import os
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "conversations.json")


def _ensure_data_file():
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({}, f)


def _load() -> dict:
    _ensure_data_file()
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def _save(data: dict):
    _ensure_data_file()
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


class ConversationStore:
    def save_conversation(self, messages: list, conv_id: str = None) -> str:
        data   = _load()
        now    = datetime.utcnow().isoformat()
        cid    = conv_id or str(uuid.uuid4())

        # Build title from first user message
        title = next(
            (m["content"][:50] + ("…" if len(m["content"]) > 50 else "")
             for m in messages if m["role"] == "user"),
            "Untitled"
        )

        if cid in data:
            data[cid]["messages"] = messages
            data[cid]["updated_at"] = now
        else:
            data[cid] = {
                "id":         cid,
                "title":      title,
                "messages":   messages,
                "created_at": now,
                "updated_at": now,
            }

        _save(data)
        return cid

    def list_conversations(self) -> list:
        data = _load()
        convos = [
            {
                "id":         v["id"],
                "title":      v["title"],
                "created_at": v["created_at"],
                "updated_at": v["updated_at"],
                "message_count": len(v["messages"]),
            }
            for v in data.values()
        ]
        return sorted(convos, key=lambda x: x["updated_at"], reverse=True)

    def get_conversation(self, conv_id: str) -> dict | None:
        data = _load()
        return data.get(conv_id)

    def delete_conversation(self, conv_id: str):
        data = _load()
        data.pop(conv_id, None)
        _save(data)

    def clear_all(self):
        _save({})
