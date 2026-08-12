import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from database import db
from seed import seed_database
from migrate_codes_and_sources import run_migration

@pytest.fixture(scope='module')
def test_client():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    app = create_app()
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
        seed_database()
        run_migration()

    with app.test_client() as client:
        yield client

def test_case_1_women_welfare_search(test_client):
    """Case 1: 'Women Welfare' search must return relevant women schemes and not 0 results"""
    res = test_client.get('/api/schemes?search=Women Welfare')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']) > 0
    assert any("women" in s['category'].lower() or "mother" in s['beneficiary'].lower() for s in data['data'])

def test_case_2_farmer_scheme_search(test_client):
    """Case 2: 'farmer scheme' search must return agriculture & farmer schemes"""
    res = test_client.get('/api/schemes?search=farmer scheme')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']) > 0
    assert any("agriculture" in s['category'].lower() or "farmer" in s['beneficiary'].lower() for s in data['data'])

def test_case_3_student_scholarship_search(test_client):
    """Case 3: 'student scholarship' search must return education & scholarship schemes"""
    res = test_client.get('/api/schemes?search=student scholarship')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']) > 0
    assert any("education" in s['category'].lower() or "student" in s['beneficiary'].lower() for s in data['data'])

def test_case_4_business_loan_search(test_client):
    """Case 4: 'business loan' search must return business & entrepreneur credit schemes"""
    res = test_client.get('/api/schemes?search=business loan')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']) > 0
    assert any("business" in s['category'].lower() or "employment" in s['category'].lower() for s in data['data'])

def test_case_5_old_age_pension_search(test_client):
    """Case 5: 'old age pension' search must return senior citizen pension schemes"""
    res = test_client.get('/api/schemes?search=old age pension')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']) > 0
    assert any("pension" in s['name'].lower() or "ignoaps" in s['schemeCode'].lower() for s in data['data'])
