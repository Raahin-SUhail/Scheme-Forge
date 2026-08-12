from flask import Blueprint, request, jsonify
import re
from database import db
from models import ContactMessage

contact_bp = Blueprint('contact', __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

@contact_bp.route('/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "error": "Invalid or missing JSON payload"}), 400

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        query_type = data.get('type', 'General Enquiry').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()

        # Validation
        if not name:
            return jsonify({"success": False, "error": "Name is required"}), 400

        if not email or not EMAIL_REGEX.match(email):
            return jsonify({"success": False, "error": "A valid email address is required"}), 400

        if not message:
            return jsonify({"success": False, "error": "Message content is required"}), 400

        # Create Record
        contact_entry = ContactMessage(
            name=name,
            email=email,
            query_type=query_type,
            subject=subject or 'Scheme Enquiry',
            message=message,
            status='new'
        )

        db.session.add(contact_entry)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Your enquiry has been received.",
            "data": {
                "id": contact_entry.id,
                "status": contact_entry.status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Failed to submit message: {str(e)}"}), 500
