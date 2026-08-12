import os
import sys
from app import create_app
from database import db
from models import Scheme, SchemeEligibilityRule, SchemeSource

def generate_data_quality_report():
    app = create_app()
    with app.app_context():
        total_schemes = Scheme.query.count()
        total_rules = SchemeEligibilityRule.query.count()
        total_sources = SchemeSource.query.count()

        verified_count = Scheme.query.filter_by(verification_status='VERIFIED').count()
        partially_verified_count = Scheme.query.filter_by(verification_status='PARTIALLY_VERIFIED').count()
        unverified_count = Scheme.query.filter_by(verification_status='UNVERIFIED').count()
        needs_review_count = Scheme.query.filter_by(verification_status='NEEDS_REVIEW').count()

        active_count = Scheme.query.filter_by(lifecycle_status='ACTIVE').count()
        inactive_count = Scheme.query.filter_by(lifecycle_status='INACTIVE').count()

        structured_elig_count = Scheme.query.filter_by(eligibility_data_status='STRUCTURED').count()
        partial_elig_count = Scheme.query.filter_by(eligibility_data_status='PARTIAL').count()

        # Audit Individual Schemes
        schemes = Scheme.query.all()
        schemes_missing_rules = []
        schemes_missing_primary_source = []
        data_quality_warnings = []

        for s in schemes:
            if not s.eligibility_rule:
                schemes_missing_rules.append(s.name)

            primary_src = SchemeSource.query.filter_by(scheme_id=s.id, is_primary=True).first()
            if not primary_src:
                schemes_missing_primary_source.append(s.name)

            # Quality Check Rules
            if not s.official_link or not s.official_link.startswith('http'):
                data_quality_warnings.append(f"Scheme '{s.name}' has invalid officialLink: {s.official_link}")
            if s.min_age < 0 or s.max_age < s.min_age:
                data_quality_warnings.append(f"Scheme '{s.name}' has invalid age bounds: {s.min_age} - {s.max_age}")
            if s.max_income < 0:
                data_quality_warnings.append(f"Scheme '{s.name}' has negative income ceiling: {s.max_income}")
            if not s.benefits or len(s.benefits) == 0:
                data_quality_warnings.append(f"Scheme '{s.name}' has empty benefits list")

        report = {
            "totalSchemes": total_schemes,
            "totalRules": total_rules,
            "totalSources": total_sources,
            "verificationStatusBreakdown": {
                "VERIFIED": verified_count,
                "PARTIALLY_VERIFIED": partially_verified_count,
                "UNVERIFIED": unverified_count,
                "NEEDS_REVIEW": needs_review_count
            },
            "lifecycleStatusBreakdown": {
                "ACTIVE": active_count,
                "INACTIVE": inactive_count
            },
            "eligibilityDataStatusBreakdown": {
                "STRUCTURED": structured_elig_count,
                "PARTIAL": partial_elig_count
            },
            "schemesMissingRules": schemes_missing_rules,
            "schemesMissingPrimarySource": schemes_missing_primary_source,
            "dataQualityWarnings": data_quality_warnings
        }

        print("=== SCHEMEFORGE DATA QUALITY AUDIT REPORT ===")
        print(f"Total Schemes: {total_schemes}")
        print(f"Total Eligibility Rules: {total_rules}")
        print(f"Total Provenance Sources: {total_sources}")
        print(f"Verification Breakdown: VERIFIED={verified_count}, PARTIALLY_VERIFIED={partially_verified_count}, UNVERIFIED={unverified_count}, NEEDS_REVIEW={needs_review_count}")
        print(f"Lifecycle Breakdown: ACTIVE={active_count}, INACTIVE={inactive_count}")
        print(f"Eligibility Data Status: STRUCTURED={structured_elig_count}, PARTIAL={partial_elig_count}")
        print(f"Schemes Missing Rules: {len(schemes_missing_rules)}")
        print(f"Schemes Missing Primary Source: {len(schemes_missing_primary_source)}")
        print(f"Data Quality Warnings: {len(data_quality_warnings)}")
        if data_quality_warnings:
            for w in data_quality_warnings:
                print(f"  - WARNING: {w}")

        return report

if __name__ == '__main__':
    generate_data_quality_report()
