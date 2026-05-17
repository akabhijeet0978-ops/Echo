from flask import Blueprint, request, jsonify
from models.conversation import ConversationStore

history_bp = Blueprint("history", __name__)
store      = ConversationStore()


@history_bp.route("/", methods=["GET"])
def get_all():
    """GET /api/history/  — list all conversations (meta only)"""
    return jsonify(store.list_conversations())


@history_bp.route("/<conv_id>", methods=["GET"])
def get_one(conv_id):
    """GET /api/history/<id>  — full messages for a conversation"""
    convo = store.get_conversation(conv_id)
    if convo is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(convo)


@history_bp.route("/<conv_id>", methods=["DELETE"])
def delete_one(conv_id):
    """DELETE /api/history/<id>"""
    store.delete_conversation(conv_id)
    return jsonify({"deleted": conv_id})


@history_bp.route("/", methods=["DELETE"])
def delete_all():
    """DELETE /api/history/  — clear everything"""
    store.clear_all()
    return jsonify({"deleted": "all"})
