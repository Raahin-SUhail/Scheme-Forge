from flask import Blueprint, request, jsonify
from models import Scheme
from services.eligibility_engine import DeterministicEligibilityEngine

eligibility_bp = Blueprint('eligibility', __name__)

@eligibility_bp.route('/find-schemes', methods=['POST'])
def find_schemes():
    try:
        data = request.get_json(silent=True) or {}

        # 1. Normalize citizen profile
        try:
            profile = DeterministicEligibilityEngine.normalize_profile(data)
        except ValueError as ve:
            return jsonify({"success": False, "error": str(ve)}), 400

        # Query Option: includeIneligible (default True)
        include_ineligible_param = request.args.get('includeIneligible', 'true').strip().lower()
        include_ineligible = include_ineligible_param in ['true', '1']

        # Fetch all active schemes
        schemes = Scheme.query.all()

        evaluated_results = []
        eligible_count = 0
        potential_count = 0
        not_eligible_count = 0

        for scheme in schemes:
            eval_output = DeterministicEligibilityEngine.evaluate_scheme(scheme, profile)
            status = eval_output['eligibility']['status']

            if status == 'ELIGIBLE':
                eligible_count += 1
            elif status == 'POTENTIALLY_ELIGIBLE':
                potential_count += 1
            elif status == 'NOT_ELIGIBLE':
                not_eligible_count += 1

            if include_ineligible or status != 'NOT_ELIGIBLE':
                evaluated_results.append(eval_output)

        # Sort results: 1. Status Rank (ELIGIBLE=1, POTENTIALLY_ELIGIBLE=2, NOT_ELIGIBLE=3)
        #               2. Match Score Descending
        evaluated_results.sort(
            key=lambda x: (x['eligibility']['statusRank'], -x['eligibility']['matchScore'])
        )

        # Remove internal statusRank from output
        for res in evaluated_results:
            res['eligibility'].pop('statusRank', None)

        return jsonify({
            "success": True,
            "profile": profile,
            "summary": {
                "eligible": eligible_count,
                "potentiallyEligible": potential_count,
                "notEligible": not_eligible_count,
                "totalEvaluated": len(schemes)
            },
            "data": evaluated_results
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Eligibility engine error: {str(e)}"}), 500


@eligibility_bp.route('/schemes/<int:scheme_id>/check-eligibility', methods=['POST'])
def check_single_scheme_eligibility(scheme_id):
    try:
        scheme = Scheme.query.get(scheme_id)
        if not scheme:
            return jsonify({"success": False, "error": "Scheme not found"}), 404

        data = request.get_json(silent=True) or {}
        try:
            profile = DeterministicEligibilityEngine.normalize_profile(data)
        except ValueError as ve:
            return jsonify({"success": False, "error": str(ve)}), 400

        eval_output = DeterministicEligibilityEngine.evaluate_scheme(scheme, profile)
        eval_output['eligibility'].pop('statusRank', None)

        return jsonify({
            "success": True,
            "profile": profile,
            "data": eval_output
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
