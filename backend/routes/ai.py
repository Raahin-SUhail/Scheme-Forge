from flask import Blueprint, request, jsonify
from services.scheme_retrieval import retrieve_grounded_schemes
from services.assistant_service import process_assistant_message

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/ai/search', methods=['POST'])
def ai_scheme_search():
    """
    Natural language scheme discovery endpoint.
    Accepts: { "query": string, "state": optional, "category": optional }
    Returns grounded scheme records retrieved from SQLite database.
    """
    data = request.get_json(silent=True) or {}
    query_text = data.get('query')

    if not query_text or not isinstance(query_text, str) or not query_text.strip():
        return jsonify({
            "success": False,
            "error": "INVALID_QUERY",
            "message": "Query parameter must be a non-empty string."
        }), 400

    target_state = data.get('state')
    category_hint = data.get('category')

    schemes = retrieve_grounded_schemes(
        query_text=query_text,
        state=target_state,
        category=category_hint,
        limit=6
    )

    return jsonify({
        "success": True,
        "query": query_text,
        "count": len(schemes),
        "data": schemes
    }), 200


@ai_bp.route('/ai/assistant', methods=['POST'])
def ai_assistant_chat():
    """
    Grounded SchemeForge Assistant endpoint.
    Accepts: { "message": string, "profile": optional dict }
    Executes intent classification, profile extraction, deterministic engine handoff, and source grounding.
    """
    data = request.get_json(silent=True) or {}
    message = data.get('message')

    if not message or not isinstance(message, str) or not message.strip():
        return jsonify({
            "success": False,
            "error": "INVALID_MESSAGE",
            "message": "Message parameter must be a non-empty string."
        }), 400

    profile = data.get('profile')
    if profile is not None and not isinstance(profile, dict):
        profile = {}

    result = process_assistant_message(message=message, user_profile=profile)
    return jsonify(result), 200
