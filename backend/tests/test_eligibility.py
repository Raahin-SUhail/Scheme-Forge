import pytest
import os
import sys

# Add backend root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from database import db
from seed import seed_database

@pytest.fixture(scope='module')
def test_client():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    app = create_app()
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
        # Seed test data
        seed_database()

    with app.test_client() as client:
        yield client

def test_case_1_pm_kisan_non_farmer(test_client):
    """Case 1: PM-KISAN for Non-Farmer must return NOT_ELIGIBLE with farmer failure message"""
    payload = {
        "state": "Tamil Nadu",
        "age": 30,
        "annualIncome": 200000,
        "isFarmer": False
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    # Find PM-KISAN in results
    pm_kisan = next((item for item in data['data'] if item['scheme']['shortName'] == 'PM-KISAN'), None)
    assert pm_kisan is not None
    assert pm_kisan['eligibility']['status'] == 'NOT_ELIGIBLE'
    
    # Check failed rules
    failed_rule_names = [f['rule'] for f in pm_kisan['eligibility']['failedRules']]
    assert 'farmerStatus' in failed_rule_names

def test_case_2_pm_kisan_farmer(test_client):
    """Case 2: PM-KISAN for Farmer must pass farmer rule and return POTENTIALLY_ELIGIBLE due to land ownership condition"""
    payload = {
        "state": "Tamil Nadu",
        "age": 30,
        "annualIncome": 200000,
        "isFarmer": True
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    pm_kisan = next((item for item in data['data'] if item['scheme']['shortName'] == 'PM-KISAN'), None)
    assert pm_kisan is not None
    assert pm_kisan['eligibility']['status'] == 'POTENTIALLY_ELIGIBLE'
    
    passed_rule_names = [p['rule'] for p in pm_kisan['eligibility']['passedRules']]
    assert 'farmerStatus' in passed_rule_names
    assert len(pm_kisan['eligibility']['unknownRules']) > 0

def test_case_3_women_only_scheme_male(test_client):
    """Case 3: Women-only scheme for Male must return NOT_ELIGIBLE"""
    payload = {
        "state": "Tamil Nadu",
        "age": 30,
        "annualIncome": 200000,
        "gender": "Male"
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    magalir = next((item for item in data['data'] if 'Magalir Urimai' in item['scheme']['shortName']), None)
    assert magalir is not None
    assert magalir['eligibility']['status'] == 'NOT_ELIGIBLE'
    
    failed_rule_names = [f['rule'] for f in magalir['eligibility']['failedRules']]
    assert 'gender' in failed_rule_names

def test_case_4_women_only_scheme_female(test_client):
    """Case 4: Women-only scheme for Female must pass gender rule"""
    payload = {
        "state": "Tamil Nadu",
        "age": 30,
        "annualIncome": 200000,
        "gender": "Female"
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    magalir = next((item for item in data['data'] if 'Magalir Urimai' in item['scheme']['shortName']), None)
    assert magalir is not None
    assert magalir['eligibility']['status'] in ['ELIGIBLE', 'POTENTIALLY_ELIGIBLE']
    
    passed_rule_names = [p['rule'] for p in magalir['eligibility']['passedRules']]
    assert 'gender' in passed_rule_names

def test_case_5_age_failure(test_client):
    """Case 5: Citizen outside scheme age range must be NOT_ELIGIBLE"""
    payload = {
        "state": "Tamil Nadu",
        "age": 85, # Exceeds PMMVY max age of 45
        "annualIncome": 100000,
        "gender": "Female"
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    pmmvy = next((item for item in data['data'] if item['scheme']['shortName'] == 'PMMVY'), None)
    assert pmmvy is not None
    assert pmmvy['eligibility']['status'] == 'NOT_ELIGIBLE'
    
    failed_rule_names = [f['rule'] for f in pmmvy['eligibility']['failedRules']]
    assert 'age' in failed_rule_names

def test_case_6_income_failure(test_client):
    """Case 6: Annual income exceeding maximum ceiling must be NOT_ELIGIBLE"""
    payload = {
        "state": "Tamil Nadu",
        "age": 30,
        "annualIncome": 20000000 # Exceeds PM-KISAN limit of 300,000
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    pm_kisan = next((item for item in data['data'] if item['scheme']['shortName'] == 'PM-KISAN'), None)
    assert pm_kisan is not None
    assert pm_kisan['eligibility']['status'] == 'NOT_ELIGIBLE'
    
    failed_rule_names = [f['rule'] for f in pm_kisan['eligibility']['failedRules']]
    assert 'annualIncome' in failed_rule_names

def test_case_7_state_failure(test_client):
    """Case 7: State-specific scheme for citizen of another state must be NOT_ELIGIBLE"""
    payload = {
        "state": "Maharashtra", # Magalir Urimai is TN only
        "age": 30,
        "annualIncome": 100000,
        "gender": "Female"
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    magalir = next((item for item in data['data'] if 'Magalir Urimai' in item['scheme']['shortName']), None)
    assert magalir is not None
    assert magalir['eligibility']['status'] == 'NOT_ELIGIBLE'
    
    failed_rule_names = [f['rule'] for f in magalir['eligibility']['failedRules']]
    assert 'state' in failed_rule_names

def test_case_8_all_india_state_pass(test_client):
    """Case 8: All India scheme for citizen from Tamil Nadu must pass state rule"""
    payload = {
        "state": "Tamil Nadu",
        "age": 30,
        "annualIncome": 100000
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    
    pm_kisan = next((item for item in data['data'] if item['scheme']['shortName'] == 'PM-KISAN'), None)
    assert pm_kisan is not None
    passed_rule_names = [p['rule'] for p in pm_kisan['eligibility']['passedRules']]
    assert 'state' in passed_rule_names

def test_case_9_invalid_age_negative(test_client):
    """Case 9: Negative age must return HTTP 400 Bad Request"""
    payload = {
        "state": "Tamil Nadu",
        "age": -1,
        "annualIncome": 100000
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert data['success'] is False

def test_case_10_invalid_boolean_string(test_client):
    """Case 10: Invalid boolean value 'maybe' must return HTTP 400 Bad Request"""
    payload = {
        "state": "Tamil Nadu",
        "age": 25,
        "isFarmer": "maybe"
    }
    res = test_client.post('/api/find-schemes', json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert data['success'] is False
