import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from database import db
from models import Scheme, SchemeEligibilityRule, SchemeSource
from seed import seed_database
from services.eligibility_engine import DeterministicEligibilityEngine
from services.scheme_retrieval import build_llm_grounded_context, retrieve_grounded_schemes
from migrate_codes_and_sources import run_migration

@pytest.fixture(scope='module')
def test_app():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    app = create_app()
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
        seed_database()
        run_migration()
        yield app

def test_case_1_all_scheme_codes_unique(test_app):
    """Case 1: Verify all 26 schemes have unique non-null scheme_code values"""
    with test_app.app_context():
        schemes = Scheme.query.all()
        assert len(schemes) == 26
        codes = [s.scheme_code for s in schemes]
        assert len(codes) == len(set(codes))
        assert all(c is not None and len(c) > 0 for c in codes)

def test_case_2_no_generic_scheme_codes(test_app):
    """Case 2: Verify no scheme uses generic 'scheme-<id>' identifiers"""
    with test_app.app_context():
        schemes = Scheme.query.all()
        generic_codes = [s.scheme_code for s in schemes if s.scheme_code.startswith('scheme-')]
        assert len(generic_codes) == 0

def test_case_3_scheme_code_lookup(test_app):
    """Case 3: Verify scheme code retrieval achieves 26/26 success"""
    with test_app.app_context():
        schemes = Scheme.query.all()
        for s in schemes:
            retrieved = retrieve_grounded_schemes(query_text=s.scheme_code, limit=5)
            assert any(item['id'] == s.id for item in retrieved), f"Failed code lookup for {s.scheme_code}"

def test_case_4_income_sentinel_does_not_fail(test_app):
    """Case 4: Unrestricted income sentinel must not fail citizen earning > ₹1 Crore"""
    with test_app.app_context():
        startup_scheme = Scheme.query.filter_by(scheme_code='startup-india-seed-fund').first()
        assert startup_scheme is not None
        
        profile = {"age": 30, "annualIncome": 15000000, "state": "Delhi"}
        eval_res = DeterministicEligibilityEngine.evaluate_scheme(startup_scheme, profile)
        
        passed_rules = [r['rule'] for r in eval_res['eligibility']['passedRules']]
        failed_rules = [r['rule'] for r in eval_res['eligibility']['failedRules']]
        
        assert "annualIncome" in passed_rules
        assert "annualIncome" not in failed_rules
        assert eval_res['eligibility']['status'] in ['ELIGIBLE', 'POTENTIALLY_ELIGIBLE']

def test_case_5_age_sentinel_does_not_fail(test_app):
    """Case 5: Unrestricted age sentinel must not fail senior citizen aged 105"""
    with test_app.app_context():
        pmjdy_scheme = Scheme.query.filter_by(scheme_code='pmjdy').first()
        assert pmjdy_scheme is not None
        
        profile = {"age": 105, "annualIncome": 100000, "state": "Delhi"}
        eval_res = DeterministicEligibilityEngine.evaluate_scheme(pmjdy_scheme, profile)
        
        passed_rules = [r['rule'] for r in eval_res['eligibility']['passedRules']]
        failed_rules = [r['rule'] for r in eval_res['eligibility']['failedRules']]
        
        assert "age" in passed_rules
        assert "age" not in failed_rules

def test_case_6_ai_context_sentinel_income_formatting(test_app):
    """Case 6: AI context builder must format income sentinel cleanly"""
    with test_app.app_context():
        startup_scheme = Scheme.query.filter_by(scheme_code='startup-india-seed-fund').first()
        schemes_data = [startup_scheme.to_dict()]
        context_text = build_llm_grounded_context(schemes_data)
        
        assert "No maximum income restriction recorded" in context_text
        assert "Max Income: ₹10,000,000" not in context_text

def test_case_7_ai_context_sentinel_age_formatting(test_app):
    """Case 7: AI context builder must format age sentinel cleanly"""
    with test_app.app_context():
        pmjdy_scheme = Scheme.query.filter_by(scheme_code='pmjdy').first()
        schemes_data = [pmjdy_scheme.to_dict()]
        context_text = build_llm_grounded_context(schemes_data)
        
        assert "No structured upper age limit recorded" in context_text
        assert "Age 0-100 years" not in context_text

def test_case_8_sources_relationship_no_orphans(test_app):
    """Case 8: Verify all SchemeSource records link to valid existing schemes"""
    with test_app.app_context():
        sources = SchemeSource.query.all()
        assert len(sources) >= 26
        for src in sources:
            parent_scheme = db.session.get(Scheme, src.scheme_id)
            assert parent_scheme is not None

def test_case_9_no_duplicate_sources(test_app):
    """Case 9: Verify no scheme has duplicate source URLs"""
    with test_app.app_context():
        schemes = Scheme.query.all()
        for s in schemes:
            sources = SchemeSource.query.filter_by(scheme_id=s.id).all()
            urls = [src.source_url for src in sources]
            assert len(urls) == len(set(urls)), f"Duplicate source URL found for scheme {s.id}"

def test_case_10_verification_status_policy(test_app):
    """Case 10: Every VERIFIED scheme must have at least one verified primary source"""
    with test_app.app_context():
        verified_schemes = Scheme.query.filter_by(verification_status='VERIFIED').all()
        assert len(verified_schemes) == 26
        for s in verified_schemes:
            primary_src = SchemeSource.query.filter_by(scheme_id=s.id, is_primary=True).first()
            assert primary_src is not None, f"Scheme {s.name} marked VERIFIED but lacks primary source"
