from datetime import datetime, timezone
from database import db

def utc_now():
    return datetime.now(timezone.utc)

class Scheme(db.Model):
    __tablename__ = 'schemes'

    id = db.Column(db.Integer, primary_key=True)
    scheme_code = db.Column(db.String(100), nullable=False, unique=True, index=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    short_name = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, default='Central', index=True)
    state = db.Column(db.String(100), nullable=False, default='All India', index=True)
    min_age = db.Column(db.Integer, nullable=False, default=0)
    max_age = db.Column(db.Integer, nullable=False, default=100)
    max_income = db.Column(db.Integer, nullable=False, default=10000000)
    beneficiary = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(255), nullable=True)
    short_description = db.Column(db.Text, nullable=False)
    full_description = db.Column(db.Text, nullable=False)
    subsidy_amount = db.Column(db.String(100), nullable=False)
    application_procedure = db.Column(db.Text, nullable=False)
    official_link = db.Column(db.String(500), nullable=False)
    benefits = db.Column(db.JSON, nullable=False)
    documents_required = db.Column(db.JSON, nullable=False)
    rating = db.Column(db.Float, default=4.5)
    is_featured = db.Column(db.Boolean, default=False, index=True)
    is_popular = db.Column(db.Boolean, default=False, index=True)

    # Phase 5 Data Provenance & Verification Fields
    verification_status = db.Column(db.String(50), nullable=False, default='VERIFIED', index=True)
    lifecycle_status = db.Column(db.String(50), nullable=False, default='ACTIVE', index=True)
    eligibility_data_status = db.Column(db.String(50), nullable=False, default='STRUCTURED', index=True)
    last_verified_at = db.Column(db.DateTime, default=utc_now)
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    eligibility_rule = db.relationship('SchemeEligibilityRule', backref='scheme', uselist=False, cascade='all, delete-orphan')
    sources = db.relationship('SchemeSource', backref='scheme', cascade='all, delete-orphan')

    def to_dict(self):
        """Serialization to camelCase matching React frontend expectations"""
        data = {
            "id": self.id,
            "schemeCode": self.scheme_code or f"scheme-{self.id}",
            "name": self.name,
            "shortName": self.short_name or self.name,
            "category": self.category,
            "type": self.type,
            "state": self.state,
            "minAge": self.min_age,
            "maxAge": self.max_age,
            "maxIncome": self.max_income,
            "beneficiary": self.beneficiary,
            "department": self.department or "",
            "shortDescription": self.short_description,
            "fullDescription": self.full_description,
            "benefits": self.benefits if isinstance(self.benefits, list) else [],
            "subsidyAmount": self.subsidy_amount,
            "documentsRequired": self.documents_required if isinstance(self.documents_required, list) else [],
            "applicationProcedure": self.application_procedure,
            "officialLink": self.official_link,
            "rating": self.rating or 4.5,
            "isFeatured": bool(self.is_featured),
            "isPopular": bool(self.is_popular),
            "verificationStatus": self.verification_status,
            "lifecycleStatus": self.lifecycle_status,
            "eligibilityDataStatus": self.eligibility_data_status,
            "lastVerifiedAt": self.last_verified_at.isoformat() if self.last_verified_at else None
        }
        if self.eligibility_rule:
            data["eligibilityRule"] = self.eligibility_rule.to_dict()
        return data


class SchemeEligibilityRule(db.Model):
    __tablename__ = 'scheme_eligibility_rules'

    id = db.Column(db.Integer, primary_key=True)
    scheme_id = db.Column(db.Integer, db.ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False, unique=True)
    
    min_age = db.Column(db.Integer, nullable=False, default=0)
    max_age = db.Column(db.Integer, nullable=False, default=100)
    max_income = db.Column(db.Integer, nullable=False, default=10000000)
    allowed_states = db.Column(db.JSON, nullable=False)
    
    gender_requirement = db.Column(db.String(20), nullable=False, default='ANY')
    farmer_requirement = db.Column(db.String(20), nullable=False, default='NOT_REQUIRED')
    student_requirement = db.Column(db.String(20), nullable=False, default='NOT_REQUIRED')
    bpl_requirement = db.Column(db.String(20), nullable=False, default='NOT_REQUIRED')
    senior_citizen_requirement = db.Column(db.String(20), nullable=False, default='NOT_REQUIRED')
    disability_requirement = db.Column(db.String(20), nullable=False, default='NOT_REQUIRED')
    
    allowed_occupations = db.Column(db.JSON, nullable=True)
    allowed_social_categories = db.Column(db.JSON, nullable=True)
    additional_conditions = db.Column(db.JSON, nullable=False, default=list)
    
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    def to_dict(self):
        return {
            "minAge": self.min_age,
            "maxAge": self.max_age,
            "maxIncome": self.max_income,
            "allowedStates": self.allowed_states if isinstance(self.allowed_states, list) else [],
            "genderRequirement": self.gender_requirement,
            "farmerRequirement": self.farmer_requirement,
            "studentRequirement": self.student_requirement,
            "bplRequirement": self.bpl_requirement,
            "seniorCitizenRequirement": self.senior_citizen_requirement,
            "disabilityRequirement": self.disability_requirement,
            "allowedOccupations": self.allowed_occupations if isinstance(self.allowed_occupations, list) else None,
            "allowedSocialCategories": self.allowed_social_categories if isinstance(self.allowed_social_categories, list) else None,
            "additionalConditions": self.additional_conditions if isinstance(self.additional_conditions, list) else []
        }


class SchemeSource(db.Model):
    __tablename__ = 'scheme_sources'

    id = db.Column(db.Integer, primary_key=True)
    scheme_id = db.Column(db.Integer, db.ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False)
    
    source_type = db.Column(db.String(100), nullable=False, default='OFFICIAL_SCHEME_PORTAL')
    source_title = db.Column(db.String(255), nullable=False)
    source_url = db.Column(db.String(500), nullable=False)
    source_authority = db.Column(db.String(255), nullable=False)
    source_scope = db.Column(db.String(100), nullable=False, default='FULL_GUIDELINES')
    is_primary = db.Column(db.Boolean, default=True)
    notes = db.Column(db.Text, nullable=True)
    
    retrieved_at = db.Column(db.DateTime, default=utc_now)
    last_verified_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "schemeId": self.scheme_id,
            "sourceType": self.source_type,
            "sourceTitle": self.source_title,
            "sourceUrl": self.source_url,
            "sourceAuthority": self.source_authority,
            "sourceScope": self.source_scope,
            "isPrimary": bool(self.is_primary),
            "notes": self.notes or "",
            "lastVerifiedAt": self.last_verified_at.isoformat() if self.last_verified_at else None
        }


class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    query_type = db.Column(db.String(100), nullable=True, default='General Enquiry')
    subject = db.Column(db.String(255), nullable=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='new')
    created_at = db.Column(db.DateTime, default=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "queryType": self.query_type,
            "subject": self.subject,
            "message": self.message,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
