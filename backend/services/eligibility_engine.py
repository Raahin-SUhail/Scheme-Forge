from typing import Dict, Any, List
from models import Scheme, SchemeEligibilityRule

class DeterministicEligibilityEngine:
    """
    Deterministic rule-based eligibility evaluation engine.
    This engine is the SOLE AUTHORITATIVE DETERMINER of scheme eligibility status.
    AI components MUST NEVER independently assign ELIGIBLE, NOT_ELIGIBLE, or POTENTIALLY_ELIGIBLE.
    """

    @staticmethod
    def normalize_profile(raw_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize citizen profile input into standard types and clean defaults.
        Unspecified fields default to None (UNKNOWN). Raises ValueError for invalid inputs.
        """
        normalized = {
            "age": None,
            "annualIncome": None,
            "state": None,
            "gender": None,
            "isFarmer": None,
            "isStudent": None,
            "isBPL": None,
            "hasDisability": None,
            "socialCategory": None,
            "occupation": None
        }

        if not raw_profile or not isinstance(raw_profile, dict):
            return normalized

        # 1. Age
        age_val = raw_profile.get('age')
        if age_val is not None:
            try:
                val = int(age_val)
                if val < 0 or val > 120:
                    raise ValueError(f"Age must be between 0 and 120. Got: {val}")
                normalized["age"] = val
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid age parameter: {str(e)}")

        # 2. Annual Income
        inc_val = raw_profile.get('annualIncome', raw_profile.get('income'))
        if inc_val is not None:
            try:
                val = int(inc_val)
                if val < 0:
                    raise ValueError(f"Income cannot be negative. Got: {val}")
                normalized["annualIncome"] = val
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid income parameter: {str(e)}")

        # 3. State
        state_val = raw_profile.get('state')
        if state_val and isinstance(state_val, str) and state_val.strip():
            normalized["state"] = state_val.strip()

        # 4. Gender
        gender_val = raw_profile.get('gender')
        if gender_val and isinstance(gender_val, str) and gender_val.strip():
            g = gender_val.strip().title()
            if g in ['Male', 'Female', 'Other']:
                normalized["gender"] = g

        # 5. Social Category
        soc_val = raw_profile.get('socialCategory')
        if soc_val and isinstance(soc_val, str) and soc_val.strip():
            normalized["socialCategory"] = soc_val.strip()

        # 6. Occupation
        occ_val = raw_profile.get('occupation')
        if occ_val and isinstance(occ_val, str) and occ_val.strip():
            normalized["occupation"] = occ_val.strip()

        # 7. Booleans (Support 'is_bpl' and raise ValueError on invalid string booleans)
        def parse_bool(val, field_name):
            if val is None:
                return None
            if isinstance(val, bool):
                return val
            if isinstance(val, (int, float)):
                return bool(val)
            if isinstance(val, str):
                s = val.strip().lower()
                if s in ['true', '1', 'yes']:
                    return True
                if s in ['false', '0', 'no']:
                    return False
            raise ValueError(f"Boolean field '{field_name}' received invalid value: '{val}'")

        if 'isFarmer' in raw_profile or 'is_farmer' in raw_profile:
            normalized["isFarmer"] = parse_bool(raw_profile.get('isFarmer', raw_profile.get('is_farmer')), 'isFarmer')
        if 'isStudent' in raw_profile or 'is_student' in raw_profile:
            normalized["isStudent"] = parse_bool(raw_profile.get('isStudent', raw_profile.get('is_student')), 'isStudent')
        if 'isBPL' in raw_profile or 'is_bpl' in raw_profile:
            normalized["isBPL"] = parse_bool(raw_profile.get('isBPL', raw_profile.get('is_bpl')), 'isBPL')
        if 'hasDisability' in raw_profile or 'has_disability' in raw_profile:
            normalized["hasDisability"] = parse_bool(raw_profile.get('hasDisability', raw_profile.get('has_disability')), 'hasDisability')

        return normalized

    @classmethod
    def evaluate_scheme(cls, scheme: Scheme, raw_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate a single scheme against a citizen profile.
        Returns explicit rule checklist, overall status, statusRank, and match score.
        """
        profile = cls.normalize_profile(raw_profile)
        rule = scheme.eligibility_rule

        passed_rules = []
        failed_rules = []
        unknown_rules = []

        # Fallback values if structured rule doesn't exist on scheme
        min_age = rule.min_age if rule else scheme.min_age
        max_age = rule.max_age if rule else scheme.max_age
        max_income = rule.max_income if rule else scheme.max_income
        allowed_states = rule.allowed_states if rule and rule.allowed_states else [scheme.state]
        gender_req = rule.gender_requirement if rule else 'ANY'
        farmer_req = rule.farmer_requirement if rule else ('REQUIRED' if scheme.beneficiary.lower() == 'farmers' else 'NOT_REQUIRED')
        student_req = rule.student_requirement if rule else ('REQUIRED' if scheme.category.lower() == 'education' else 'NOT_REQUIRED')
        bpl_req = rule.bpl_requirement if rule else 'NOT_REQUIRED'
        additional_conds = rule.additional_conditions if (rule and rule.additional_conditions) else []

        has_max_age_restriction = (max_age < 100)
        has_max_income_restriction = (max_income < 10000000)

        # Rule 1: Age
        age = profile['age']
        if age is not None:
            if has_max_age_restriction:
                if min_age <= age <= max_age:
                    passed_rules.append({
                        "rule": "age",
                        "status": "PASS",
                        "message": f"Your age of {int(age)} is within the required range of {min_age}–{max_age} years."
                    })
                else:
                    failed_rules.append({
                        "rule": "age",
                        "status": "FAIL",
                        "message": f"This scheme requires age between {min_age}–{max_age} years. Your age of {int(age)} does not qualify."
                    })
            else:
                if age >= min_age:
                    passed_rules.append({
                        "rule": "age",
                        "status": "PASS",
                        "message": f"Your age of {int(age)} meets the minimum age requirement of {min_age} years (no upper age limit)."
                    })
                else:
                    failed_rules.append({
                        "rule": "age",
                        "status": "FAIL",
                        "message": f"This scheme requires a minimum age of {min_age} years. Your age of {int(age)} does not qualify."
                    })
        else:
            unknown_rules.append({
                "rule": "age",
                "status": "UNKNOWN",
                "message": f"Age not specified in profile. Requires age {min_age}+ years." if not has_max_age_restriction else f"Age not specified in profile. Requires age {min_age}–{max_age} years."
            })

        # Rule 2: Annual Income
        income = profile['annualIncome']
        if income is not None:
            if has_max_income_restriction:
                if income <= max_income:
                    passed_rules.append({
                        "rule": "annualIncome",
                        "status": "PASS",
                        "message": f"Your annual income of ₹{int(income):,} is below the maximum ceiling of ₹{int(max_income):,}."
                    })
                else:
                    failed_rules.append({
                        "rule": "annualIncome",
                        "status": "FAIL",
                        "message": f"This scheme has a maximum income ceiling of ₹{int(max_income):,}. Your annual income of ₹{int(income):,} exceeds the limit."
                    })
            else:
                passed_rules.append({
                    "rule": "annualIncome",
                    "status": "PASS",
                    "message": f"Your annual income of ₹{int(income):,} satisfies eligibility (no maximum income ceiling recorded)."
                })
        else:
            unknown_rules.append({
                "rule": "annualIncome",
                "status": "UNKNOWN",
                "message": f"Annual income not specified in profile." if not has_max_income_restriction else f"Annual income not specified. Requires income below ₹{int(max_income):,}."
            })

        # Rule 3: State / Jurisdiction
        req_state = profile['state']
        if req_state:
            state_match = (
                req_state == 'All India' or
                'All India' in allowed_states or
                scheme.state == 'All India' or
                req_state in allowed_states or
                req_state.lower() == scheme.state.lower()
            )
            if state_match:
                passed_rules.append({
                    "rule": "state",
                    "status": "PASS",
                    "message": f"State ({req_state}) is covered under scheme jurisdiction ({scheme.state})."
                })
            else:
                failed_rules.append({
                    "rule": "state",
                    "status": "FAIL",
                    "message": f"This scheme is restricted to residents of {scheme.state}. Your location ({req_state}) does not qualify."
                })
        else:
            unknown_rules.append({
                "rule": "state",
                "status": "UNKNOWN",
                "message": f"State not specified in profile. Scheme applies to: {scheme.state}."
            })

        # Rule 4: Gender
        user_gender = profile['gender']
        if gender_req != 'ANY':
            if user_gender == gender_req:
                passed_rules.append({
                    "rule": "gender",
                    "status": "PASS",
                    "message": f"Gender requirement ({gender_req}) satisfied."
                })
            elif user_gender is not None:
                failed_rules.append({
                    "rule": "gender",
                    "status": "FAIL",
                    "message": f"This scheme is exclusively for {gender_req} applicants."
                })
            else:
                unknown_rules.append({
                    "rule": "gender",
                    "status": "UNKNOWN",
                    "message": f"Gender not specified in profile. Requires {gender_req} applicants."
                })

        # Rule 5: Farmer Status
        if farmer_req == 'REQUIRED':
            if profile['isFarmer'] is True:
                passed_rules.append({
                    "rule": "farmerStatus",
                    "status": "PASS",
                    "message": "Applicant is a verified farmer."
                })
            elif profile['isFarmer'] is False:
                failed_rules.append({
                    "rule": "farmerStatus",
                    "status": "FAIL",
                    "message": "This scheme requires the applicant to be a farmer."
                })
            else:
                unknown_rules.append({
                    "rule": "farmerStatus",
                    "status": "UNKNOWN",
                    "message": "Farmer status unconfirmed. Scheme requires farmer applicant."
                })

        # Rule 6: Student Status
        if student_req == 'REQUIRED':
            if profile['isStudent'] is True:
                passed_rules.append({
                    "rule": "studentStatus",
                    "status": "PASS",
                    "message": "Applicant is currently a student."
                })
            elif profile['isStudent'] is False:
                failed_rules.append({
                    "rule": "studentStatus",
                    "status": "FAIL",
                    "message": "This scheme requires student status."
                })
            else:
                unknown_rules.append({
                    "rule": "studentStatus",
                    "status": "UNKNOWN",
                    "message": "Student status unconfirmed. Scheme requires active student."
                })

        # Rule 7: BPL Status
        if bpl_req == 'REQUIRED':
            if profile['isBPL'] is True:
                passed_rules.append({
                    "rule": "bplStatus",
                    "status": "PASS",
                    "message": "Applicant holds verified Below Poverty Line (BPL) status."
                })
            elif profile['isBPL'] is False:
                failed_rules.append({
                    "rule": "bplStatus",
                    "status": "FAIL",
                    "message": "This scheme is restricted to BPL / EWS cardholders."
                })
            else:
                unknown_rules.append({
                    "rule": "bplStatus",
                    "status": "UNKNOWN",
                    "message": "BPL status unconfirmed. Requires BPL / EWS card validation."
                })

        # Rule 8: Social Category
        user_soc_cat = profile['socialCategory']
        if rule and rule.allowed_social_categories:
            if user_soc_cat in rule.allowed_social_categories:
                passed_rules.append({
                    "rule": "socialCategory",
                    "status": "PASS",
                    "message": f"Social category ({user_soc_cat}) satisfied."
                })
            elif user_soc_cat is not None:
                failed_rules.append({
                    "rule": "socialCategory",
                    "status": "FAIL",
                    "message": f"This scheme is restricted to {', '.join(rule.allowed_social_categories)} categories."
                })
            else:
                unknown_rules.append({
                    "rule": "socialCategory",
                    "status": "UNKNOWN",
                    "message": f"Social category unconfirmed. Allowed: {', '.join(rule.allowed_social_categories)}."
                })

        # Un-evaluable Additional Conditions
        if additional_conds:
            for cond in additional_conds:
                unknown_rules.append({
                    "rule": "additionalCondition",
                    "status": "UNKNOWN",
                    "message": f"Unconfirmed condition: {cond}. Requires document verification."
                })

        # Determine Overall Status
        if len(failed_rules) > 0:
            overall_status = "NOT_ELIGIBLE"
        elif len(unknown_rules) > 0:
            overall_status = "POTENTIALLY_ELIGIBLE"
        else:
            overall_status = "ELIGIBLE"

        # Calculate Match Score
        total_known = len(passed_rules) + len(failed_rules)
        if total_known > 0:
            match_score = int(round((len(passed_rules) / total_known) * 100))
        else:
            match_score = 0

        status_rank = 1 if overall_status == "ELIGIBLE" else (2 if overall_status == "POTENTIALLY_ELIGIBLE" else 3)

        return {
            "scheme": scheme.to_dict(),
            "eligibility": {
                "status": overall_status,
                "overallStatus": overall_status,
                "statusRank": status_rank,
                "matchScore": match_score,
                "passedRules": passed_rules,
                "failedRules": failed_rules,
                "unknownRules": unknown_rules,
                "hasAgeRestriction": has_max_age_restriction,
                "hasIncomeRestriction": has_max_income_restriction
            }
        }
