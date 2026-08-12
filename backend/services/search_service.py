import re
from sqlalchemy import or_, case
from database import db
from models import Scheme, SchemeSource

# Stop words to ignore during tokenized search match evaluation
STOP_WORDS = {'scheme', 'schemes', 'government', 'india', 'for', 'the', 'and', 'with', 'that', 'this', 'need', 'want', 'give', 'get', 'show', 'list', 'tell', 'me', 'about', 'what', 'which', 'are', 'is', 'a', 'an', 'in', 'on', 'at', 'to', 'from', 'by', 'my', 'training', 'could', 'can', 'you', 'suggest', 'some', 'recommend', 'available', 'there', 'any', 'please', 'help', 'find', 'looking', 'who', 'how', 'am'}

# Controlled Alias Dictionary mapping natural citizen search terms to normalized targets
SEARCH_ALIASES = {
    # Women & Girl Child
    "women": ["Women", "Female", "Mother", "Girl", "Ladki", "Magalir", "Kanya", "Welfare", "PMMVY", "Subhadra", "Gruha Lakshmi"],
    "woman": ["Women", "Female", "Mother", "Girl", "Ladki", "Gruha Lakshmi"],
    "female": ["Women", "Female", "Mother", "Girl"],
    "girl": ["Women", "Girl Child", "Ladli", "Kanya", "Sukanya"],
    "welfare": ["Women", "Social Welfare", "Financial Inclusion", "Senior Citizens"],
    
    # Farmers & Agriculture
    "farmer": ["Agriculture", "Farmers", "Kisan", "Crop", "Cultivator", "PM-KISAN", "KUSUM", "Sahay"],
    "farmers": ["Agriculture", "Farmers", "Kisan", "Crop", "PM-KISAN"],
    "farming": ["Agriculture", "Farmers", "Kisan", "Crop"],
    "kisan": ["Agriculture", "Farmers", "PM-KISAN", "KUSUM"],
    "agriculture": ["Agriculture", "Farmers", "Crop"],
    "agricultural": ["Agriculture", "Farmers", "Crop"],
    
    # Education, Students & Scholarships
    "scholarship": ["Education", "Students", "Scholarship", "NMMSS", "Abhyudaya", "Vidyalaxmi"],
    "scholarships": ["Education", "Students", "Scholarship", "NMMSS", "Abhyudaya", "Vidyalaxmi"],
    "student": ["Education", "Students", "Scholarship", "Vidyalaxmi", "NMMSS", "Abhyudaya"],
    "students": ["Education", "Students", "Scholarship", "Vidyalaxmi", "NMMSS", "Abhyudaya"],
    "education": ["Education", "Students", "Vidyalaxmi", "Abhyudaya"],
    "educational": ["Education", "Students"],
    "school": ["Education", "Students", "NMMSS"],
    "college": ["Education", "Students", "Vidyalaxmi"],
    "youth": ["Education", "Students", "Employment", "Startup India"],

    # Housing & Awas
    "house": ["Housing", "PMAY", "Awas", "Urban", "Gramin"],
    "houses": ["Housing", "PMAY", "Awas"],
    "housing": ["Housing", "PMAY", "Awas"],
    "home": ["Housing", "PMAY", "Awas"],
    "awas": ["Housing", "PMAY"],
    "awaas": ["Housing", "PMAY"],

    # Business, Loans & Startups
    "startup": ["Business", "Entrepreneurs", "Startup India", "SISFS"],
    "startups": ["Business", "Entrepreneurs", "Startup India", "SISFS"],
    "business": ["Business", "Employment", "Entrepreneurs", "Startup", "Mudra", "PMEGP", "Stand Up India", "Vishwakarma"],
    "loan": ["Business", "Employment", "Mudra", "SVANidhi", "Vidyalaxmi", "PMEGP", "Credit", "Stand Up India"],
    "loans": ["Business", "Employment", "Mudra", "SVANidhi", "PMEGP"],
    "credit": ["Business", "Employment", "Mudra", "SVANidhi", "CGTMSE"],
    "entrepreneur": ["Business", "Entrepreneurs", "Startup India", "SISFS", "Stand Up India"],
    "entrepreneurs": ["Business", "Entrepreneurs", "Startup India", "Stand Up India"],

    # Senior Citizens & Pension
    "senior": ["Senior Citizens", "Social Welfare", "Pension", "Old Age", "IGNOAPS", "APY"],
    "seniors": ["Senior Citizens", "Social Welfare", "Pension", "Old Age"],
    "pension": ["Social Welfare", "Senior Citizens", "Pension", "Atal Pension", "IGNOAPS", "APY"],
    "pensions": ["Social Welfare", "Senior Citizens", "Pension", "Atal Pension", "IGNOAPS", "APY"],
    "elderly": ["Senior Citizens", "Social Welfare", "IGNOAPS"],

    # Healthcare & Medical Insurance
    "health": ["Healthcare", "PM-JAY", "Ayushman", "Health Insurance"],
    "healthcare": ["Healthcare", "PM-JAY", "Ayushman"],
    "medical": ["Healthcare", "PM-JAY", "Ayushman"],
    "insurance": ["Healthcare", "Financial Inclusion", "PMJJBY", "PMSBY", "PM-JAY", "PM-KUSUM"],
    "ayushman": ["Healthcare", "PM-JAY", "Ayushman"],

    # Employment & Workers
    "employment": ["Employment", "MGNREGA", "Workers", "PMEGP"],
    "job": ["Employment", "MGNREGA", "Workers", "PMEGP"],
    "jobs": ["Employment", "MGNREGA", "Workers", "PMEGP"],
    "worker": ["Employment", "MGNREGA", "Workers", "SVANidhi", "Vishwakarma"],
    "workers": ["Employment", "MGNREGA", "Workers", "SVANidhi", "Vishwakarma"],
    "mgnrega": ["Employment", "MGNREGA", "Rural Workers"],
    "unemployed": ["Employment", "MGNREGA", "PMEGP", "Workers"],
    "unemployment": ["Employment", "MGNREGA", "PMEGP"],

    # Disability & Special Support
    "disabled": ["Social Welfare", "Financial Inclusion", "Healthcare"],
    "disability": ["Social Welfare", "Financial Inclusion"],
    "handicapped": ["Social Welfare", "Healthcare"],

    # Poverty & Low Income
    "poor": ["Low Income Families", "Social Welfare", "PM-JAY", "PMAY", "IGNOAPS", "MGNREGA", "PMJDY"],
    "poverty": ["Low Income Families", "Social Welfare"],
    "bpl": ["Low Income Families", "Social Welfare", "IGNOAPS", "PM-JAY"],
}

def search_schemes(query_text="", state=None, category=None, scheme_type=None, beneficiary=None, featured=False, popular=False, limit=20, page=1):
    """
    Unified, deterministic search engine service for SchemeForge.
    Tokenizes search terms, applies controlled aliases, and ranks exact/category matches above description matches.
    """
    base_query = Scheme.query.filter(Scheme.lifecycle_status == 'ACTIVE')

    # State Filter
    if state and state != 'All':
        base_query = base_query.filter(
            or_(
                Scheme.state == state,
                Scheme.state == 'All India'
            )
        )

    # Category Filter
    if category and category != 'All':
        base_query = base_query.filter(Scheme.category.ilike(f"%{category}%"))

    # Type Filter
    if scheme_type and scheme_type != 'All':
        base_query = base_query.filter(Scheme.type.ilike(f"%{scheme_type}%"))

    # Beneficiary Filter
    if beneficiary and beneficiary != 'All':
        base_query = base_query.filter(Scheme.beneficiary.ilike(f"%{beneficiary}%"))

    # Featured Filter
    if featured:
        base_query = base_query.filter(Scheme.is_featured == True)

    # Popular Filter
    if popular:
        base_query = base_query.filter(Scheme.is_popular == True)

    # Keyword Search Logic
    if query_text and query_text.strip():
        clean_q = re.sub(r'[^\w\s-]', '', query_text.strip().lower())
        raw_tokens = [t for t in clean_q.split() if len(t) > 1 and t not in STOP_WORDS]

        # If user searched ONLY stop words / broad general discovery phrases (e.g. "could suggest some schemes", "what can I apply for")
        if not raw_tokens and not any(sw in clean_q for sw in ['pm-kisan', 'nmmss', 'pmay', 'pmmvy', 'kmut', 'ladki']):
            base_query = base_query.order_by(Scheme.is_featured.desc(), Scheme.is_popular.desc(), Scheme.id.asc())
            total_count = base_query.count()
            results = base_query.offset((page - 1) * limit).limit(limit).all()
            return {
                "schemes": results,
                "total": total_count,
                "page": page,
                "limit": limit,
                "pages": (total_count + limit - 1) // limit if total_count > 0 else 1
            }
        
        # Gather token terms + alias expansions
        search_terms = set(raw_tokens)
        for tok in raw_tokens:
            if tok in SEARCH_ALIASES:
                search_terms.update([a.lower() for a in SEARCH_ALIASES[tok]])

        filters = []
        # Full phrase match
        exact_pattern = f"%{clean_q}%"
        filters.append(Scheme.scheme_code.ilike(clean_q))
        filters.append(Scheme.name.ilike(exact_pattern))
        filters.append(Scheme.short_name.ilike(exact_pattern))
        filters.append(Scheme.category.ilike(exact_pattern))
        filters.append(Scheme.beneficiary.ilike(exact_pattern))

        # Individual token and alias matches
        for term in search_terms:
            p = f"%{term}%"
            filters.append(Scheme.name.ilike(p))
            filters.append(Scheme.short_name.ilike(p))
            filters.append(Scheme.category.ilike(p))
            filters.append(Scheme.beneficiary.ilike(p))
            filters.append(Scheme.short_description.ilike(p))
            filters.append(Scheme.department.ilike(p))

        base_query = base_query.filter(or_(*filters))

        # Deterministic Ranking Calculation
        ranking_score = case(
            (Scheme.scheme_code.ilike(clean_q), 100),
            (Scheme.name.ilike(exact_pattern), 90),
            (Scheme.short_name.ilike(exact_pattern), 85),
            (Scheme.category.ilike(exact_pattern), 75),
            (Scheme.beneficiary.ilike(exact_pattern), 70),
            else_=20
        )
        base_query = base_query.order_by(ranking_score.desc(), Scheme.is_featured.desc(), Scheme.is_popular.desc(), Scheme.id.asc())
    else:
        base_query = base_query.order_by(Scheme.is_featured.desc(), Scheme.is_popular.desc(), Scheme.id.asc())

    total_count = base_query.count()
    pages = (total_count + limit - 1) // limit if total_count > 0 else 1

    offset_val = (page - 1) * limit
    results = base_query.offset(offset_val).limit(limit).all()

    return {
        "schemes": results,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": pages
    }
