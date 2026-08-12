import os
import json
import logging
from datetime import datetime, timezone
from database import db
from models import Scheme, SchemeEligibilityRule, SchemeSource

logger = logging.getLogger(__name__)

def seed_database(app=None):
    """
    Idempotently seeds the database from verified scheme JSON data.
    Can be called standalone or programmatically during app startup.
    """
    if app is not None:
        _perform_seed()
    else:
        from app import create_app
        standalone_app = create_app()
        with standalone_app.app_context():
            _perform_seed()

def _perform_seed():
    db.create_all()

    seed_file = os.path.join(os.path.dirname(__file__), 'data', 'verified_schemes.json')
    if not os.path.exists(seed_file):
        seed_file = os.path.join(os.path.dirname(__file__), 'schemes_seed.json')

    if not os.path.exists(seed_file):
        logger.warning(f"Seed file not found at: {seed_file}")
        return

    with open(seed_file, 'r', encoding='utf-8') as f:
        schemes_data = json.load(f)

    inserted_schemes = 0
    updated_schemes = 0
    rules_configured = 0
    sources_configured = 0

    for item in schemes_data:
        scheme_code = item.get('schemeCode') or item['name'].lower().replace(' ', '-').replace('(', '').replace(')', '')
        
        scheme = Scheme.query.filter((Scheme.scheme_code == scheme_code) | (Scheme.name == item['name'])).first()

        if not scheme:
            scheme = Scheme(
                scheme_code=scheme_code,
                name=item['name'],
                short_name=item.get('shortName', item['name']),
                category=item.get('category', 'General'),
                type=item.get('type', 'Central'),
                state=item.get('state', 'All India'),
                min_age=item.get('minAge', 0),
                max_age=item.get('maxAge', 100),
                max_income=item.get('maxIncome', 10000000),
                beneficiary=item.get('beneficiary', 'Citizens'),
                department=item.get('department', 'Government Department'),
                short_description=item.get('shortDescription', ''),
                full_description=item.get('fullDescription', ''),
                subsidy_amount=item.get('subsidyAmount', 'Financial Aid'),
                application_procedure=item.get('applicationProcedure', ''),
                official_link=item.get('officialLink', 'https://india.gov.in'),
                benefits=item.get('benefits', []),
                documents_required=item.get('documentsRequired', []),
                rating=item.get('rating', 4.5),
                is_featured=bool(item.get('isFeatured', False)),
                is_popular=bool(item.get('isPopular', False)),
                verification_status=item.get('verificationStatus', 'VERIFIED'),
                lifecycle_status=item.get('lifecycleStatus', 'ACTIVE'),
                eligibility_data_status=item.get('eligibilityDataStatus', 'STRUCTURED'),
                last_verified_at=datetime.now(timezone.utc)
            )
            db.session.add(scheme)
            db.session.flush()
            inserted_schemes += 1
        else:
            scheme.scheme_code = scheme_code
            scheme.verification_status = item.get('verificationStatus', 'VERIFIED')
            scheme.lifecycle_status = item.get('lifecycleStatus', 'ACTIVE')
            scheme.eligibility_data_status = item.get('eligibilityDataStatus', 'STRUCTURED')
            scheme.last_verified_at = datetime.now(timezone.utc)
            updated_schemes += 1

        rule_cfg = item.get('ruleConfig', {})
        if not scheme.eligibility_rule:
            elig_rule = SchemeEligibilityRule(
                scheme_id=scheme.id,
                min_age=rule_cfg.get('min_age', scheme.min_age),
                max_age=rule_cfg.get('max_age', scheme.max_age),
                max_income=rule_cfg.get('max_income', scheme.max_income),
                allowed_states=rule_cfg.get('allowed_states', [scheme.state]),
                gender_requirement=rule_cfg.get('gender_requirement', 'ANY'),
                farmer_requirement=rule_cfg.get('farmer_requirement', 'NOT_REQUIRED'),
                student_requirement=rule_cfg.get('student_requirement', 'NOT_REQUIRED'),
                bpl_requirement=rule_cfg.get('bpl_requirement', 'NOT_REQUIRED'),
                allowed_occupations=rule_cfg.get('allowed_occupations'),
                allowed_social_categories=rule_cfg.get('allowed_social_categories'),
                additional_conditions=rule_cfg.get('additional_conditions', [])
            )
            db.session.add(elig_rule)
            rules_configured += 1

        sources_list = item.get('sources', [])
        for src_item in sources_list:
            existing_src = SchemeSource.query.filter_by(
                scheme_id=scheme.id,
                source_url=src_item.get('sourceUrl')
            ).first()

            if not existing_src:
                src = SchemeSource(
                    scheme_id=scheme.id,
                    source_type=src_item.get('sourceType', 'OFFICIAL_SCHEME_PORTAL'),
                    source_title=src_item.get('sourceTitle', 'Official Scheme Guidelines'),
                    source_url=src_item.get('sourceUrl', scheme.official_link),
                    source_authority=src_item.get('sourceAuthority', scheme.department or 'Government Authority'),
                    source_scope=src_item.get('sourceScope', 'FULL_GUIDELINES'),
                    is_primary=bool(src_item.get('isPrimary', True)),
                    notes=src_item.get('notes', 'Verified official government portal.')
                )
                db.session.add(src)
                sources_configured += 1

    db.session.commit()

    total_schemes = Scheme.query.count()
    total_rules = SchemeEligibilityRule.query.count()
    total_sources = SchemeSource.query.count()

    logger.info(f"Database seed complete. Inserted: {inserted_schemes}, Updated: {updated_schemes}, Total Schemes: {total_schemes}, Rules: {total_rules}, Sources: {total_sources}")

if __name__ == '__main__':
    seed_database()
