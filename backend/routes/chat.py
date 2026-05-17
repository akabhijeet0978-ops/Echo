from flask import Blueprint, request, jsonify, Response, stream_with_context
from services.claude_service import ClaudeService

chat_bp = Blueprint("chat", __name__)
claude  = ClaudeService()


@chat_bp.route("/send", methods=["POST"])
def send_message():
    """
    POST /api/chat/send
    Body: { "messages": [{role, content}, ...], "conversation_id": str }
    Returns: { "reply": str, "conversation_id": str }
    """
    data = request.get_json(force=True)
    messages        = data.get("messages", [])
    conversation_id = data.get("conversation_id")

    if not messages:
        return jsonify({"error": "messages array is required"}), 400

    try:
        reply, conv_id = claude.chat(messages, conversation_id)
        return jsonify({"reply": reply, "conversation_id": conv_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/stream", methods=["POST"])
def stream_message():
    """
    POST /api/chat/stream  — Server-Sent Events streaming
    Body: { "messages": [{role, content}, ...] }
    """
    data     = request.get_json(force=True)
    messages = data.get("messages", [])

    if not messages:
        return jsonify({"error": "messages array is required"}), 400

    def generate():
        try:
            for chunk in claude.stream_chat(messages):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
