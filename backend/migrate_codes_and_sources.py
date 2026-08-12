import os
import json
from datetime import datetime, timezone
from app import create_app
from database import db
from models import Scheme, SchemeEligibilityRule, SchemeSource

def run_migration():
    app = create_app()
    with app.app_context():
        print("=== EXECUTING PHASE 6.6 DATA INTEGRITY & PROVENANCE MIGRATION ===")

        # Target explicit legacy schemes 2, 4, 6, 9
        legacy_data = {
            2: {
                "code": "pmay-all",
                "short_name": "PMAY (Urban & Rural)",
                "sources": [
                    {
                        "sourceType": "OFFICIAL_SCHEME_PORTAL",
                        "sourceTitle": "Pradhan Mantri Awas Yojana Official Portal",
                        "sourceUrl": "https://pmaymis.gov.in",
                        "sourceAuthority": "Ministry of Housing and Urban Affairs",
                        "sourceScope": "FULL_GUIDELINES",
                        "isPrimary": True
                    }
                ]
            },
            4: {
                "code": "nmmss",
                "short_name": "NMMSS (Scholarship)",
                "sources": [
                    {
                        "sourceType": "OFFICIAL_SCHEME_PORTAL",
                        "sourceTitle": "National Scholarship Portal (NMMSS)",
                        "sourceUrl": "https://scholarships.gov.in",
                        "sourceAuthority": "Department of School Education & Literacy",
                        "sourceScope": "FULL_GUIDELINES",
                        "isPrimary": True
                    }
                ]
            },
            6: {
                "code": "ignoaps",
                "short_name": "IGNOAPS (Old Age Pension)",
                "sources": [
                    {
                        "sourceType": "OFFICIAL_SCHEME_PORTAL",
                        "sourceTitle": "National Social Assistance Programme (NSAP)",
                        "sourceUrl": "https://nsap.nic.in",
                        "sourceAuthority": "Ministry of Rural Development",
                        "sourceScope": "FULL_GUIDELINES",
                        "isPrimary": True
                    }
                ]
            },
            9: {
                "code": "ladki-bahin-maharashtra",
                "short_name": "Ladki Bahin (Maharashtra)",
                "sources": [
                    {
                        "sourceType": "STATE_GOVERNMENT_PAGE",
                        "sourceTitle": "Mazi Ladki Bahin Official Maharashtra Portal",
                        "sourceUrl": "https://ladkibahin.maharashtra.gov.in",
                        "sourceAuthority": "Government of Maharashtra",
                        "sourceScope": "FULL_GUIDELINES",
                        "isPrimary": True
                    }
                ]
            }
        }

        for sid, info in legacy_data.items():
            scheme = db.session.get(Scheme, sid)
            if scheme:
                scheme.scheme_code = info['code']
                scheme.short_name = info['short_name']
                scheme.verification_status = 'VERIFIED'
                scheme.last_verified_at = datetime.now(timezone.utc)
                print(f"Updated Scheme ID {scheme.id}: Assigned Code '{info['code']}' | Name: {scheme.name}")

                for src_item in info['sources']:
                    url = src_item['sourceUrl']
                    existing = SchemeSource.query.filter_by(scheme_id=scheme.id, source_url=url).first()
                    if not existing:
                        src = SchemeSource(
                            scheme_id=scheme.id,
                            source_type=src_item['sourceType'],
                            source_title=src_item['sourceTitle'],
                            source_url=url,
                            source_authority=src_item['sourceAuthority'],
                            source_scope=src_item['sourceScope'],
                            is_primary=src_item['isPrimary'],
                            notes="Verified official government portal."
                        )
                        db.session.add(src)
                        print(f"  + Added Provenance Source: {src_item['sourceTitle']}")

        # Synchronize all schemes to ensure no None or scheme-<id> codes exist
        all_schemes = Scheme.query.all()
        for s in all_schemes:
            if not s.scheme_code or s.scheme_code.startswith('scheme-'):
                clean_slug = s.name.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('&', 'and')
                s.scheme_code = clean_slug[:50].strip('-')
                print(f"Cleaned slug for Scheme ID {s.id}: {s.scheme_code}")

        db.session.commit()

        total_schemes = Scheme.query.count()
        missing_codes = Scheme.query.filter((Scheme.scheme_code == None) | (Scheme.scheme_code.like('scheme-%'))).count()
        total_sources = SchemeSource.query.count()

        print("\n=== MIGRATION AUDIT RESULT ===")
        print(f"Total Schemes in Database: {total_schemes}")
        print(f"Generic / Missing Scheme Codes Remaining: {missing_codes}")
        print(f"Total Provenance Sources Configured: {total_sources}")

if __name__ == '__main__':
    run_migration()
