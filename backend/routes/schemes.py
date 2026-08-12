from flask import Blueprint, request, jsonify
from database import db
from models import Scheme, SchemeSource
from services.search_service import search_schemes

schemes_bp = Blueprint('schemes', __name__)

@schemes_bp.route('/schemes', methods=['GET'])
def get_schemes():
    try:
        search = request.args.get('search', '').strip()
        state = request.args.get('state', '').strip()
        category = request.args.get('category', '').strip()
        scheme_type = request.args.get('type', '').strip()
        beneficiary = request.args.get('beneficiary', '').strip()
        featured_param = request.args.get('featured', '').strip().lower()
        popular_param = request.args.get('popular', '').strip().lower()
        verification_status = request.args.get('verificationStatus', '').strip()

        featured = featured_param in ['true', '1']
        popular = popular_param in ['true', '1']

        try:
            page = max(1, int(request.args.get('page', 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            limit = min(100, max(1, int(request.args.get('limit', 20))))
        except (ValueError, TypeError):
            limit = 20

        search_res = search_schemes(
            query_text=search,
            state=state,
            category=category,
            scheme_type=scheme_type,
            beneficiary=beneficiary,
            featured=featured,
            popular=popular,
            limit=limit,
            page=page
        )

        serialized_data = [s.to_dict() for s in search_res['schemes']]

        return jsonify({
            "success": True,
            "data": serialized_data,
            "pagination": {
                "page": search_res['page'],
                "limit": search_res['limit'],
                "total": search_res['total'],
                "pages": search_res['pages']
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to fetch schemes: {str(e)}"}), 500


@schemes_bp.route('/schemes/<int:scheme_id>', methods=['GET'])
def get_scheme_by_id(scheme_id):
    try:
        scheme = db.session.get(Scheme, scheme_id)
        if not scheme:
            return jsonify({"success": False, "error": "Scheme not found"}), 404

        return jsonify({
            "success": True,
            "data": scheme.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@schemes_bp.route('/schemes/<int:scheme_id>/sources', methods=['GET'])
def get_scheme_sources(scheme_id):
    try:
        scheme = db.session.get(Scheme, scheme_id)
        if not scheme:
            return jsonify({"success": False, "error": "Scheme not found"}), 404

        sources = SchemeSource.query.filter_by(scheme_id=scheme.id).all()
        serialized_sources = [source.to_dict() for source in sources]

        return jsonify({
            "success": True,
            "schemeId": scheme.id,
            "schemeName": scheme.name,
            "verificationStatus": scheme.verification_status,
            "data": serialized_sources
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@schemes_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        results = db.session.query(
            Scheme.category,
            db.func.count(Scheme.id).label('count')
        ).group_by(Scheme.category).all()

        categories_data = [
            {"name": cat, "count": count} for cat, count in results
        ]

        return jsonify({
            "success": True,
            "data": categories_data
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@schemes_bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        total_schemes = Scheme.query.count()
        verified_schemes = Scheme.query.filter(Scheme.verification_status == 'VERIFIED').count()
        partially_verified = Scheme.query.filter(Scheme.verification_status == 'PARTIALLY_VERIFIED').count()
        central_schemes = Scheme.query.filter(Scheme.type == 'Central').count()
        state_schemes = Scheme.query.filter(Scheme.type == 'State').count()

        distinct_categories = db.session.query(db.func.count(db.distinct(Scheme.category))).scalar() or 0
        states_with_specific = db.session.query(
            db.func.count(db.distinct(Scheme.state))
        ).filter(Scheme.state != 'All India').scalar() or 0

        return jsonify({
            "success": True,
            "data": {
                "totalSchemes": total_schemes,
                "verifiedSchemes": verified_schemes,
                "partiallyVerifiedSchemes": partially_verified,
                "centralSchemes": central_schemes,
                "stateSchemes": state_schemes,
                "categoriesCount": distinct_categories,
                "statesCovered": 36 if central_schemes > 0 else states_with_specific,
                "statesWithSpecificSchemes": states_with_specific
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
