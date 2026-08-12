import sqlite3
import os

def migrate_database():
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'schemeforge.db')
    if not os.path.exists(db_path):
        db_path = os.path.join(os.path.dirname(__file__), 'schemeforge.db')

    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}, skipped manual ALTER TABLE.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check existing columns in schemes table
    cursor.execute("PRAGMA table_info(schemes)")
    columns = [row[1] for row in cursor.fetchall()]

    new_columns = [
        ("scheme_code", "VARCHAR(100)"),
        ("verification_status", "VARCHAR(50) DEFAULT 'VERIFIED'"),
        ("lifecycle_status", "VARCHAR(50) DEFAULT 'ACTIVE'"),
        ("eligibility_data_status", "VARCHAR(50) DEFAULT 'STRUCTURED'"),
        ("last_verified_at", "DATETIME")
    ]

    added_cols = 0
    for col_name, col_type in new_columns:
        if col_name not in columns:
            print(f"Adding column '{col_name}' to schemes table...")
            cursor.execute(f"ALTER TABLE schemes ADD COLUMN {col_name} {col_type}")
            added_cols += 1

    # Ensure scheme_sources table exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scheme_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_id INTEGER NOT NULL,
        source_type VARCHAR(100) NOT NULL DEFAULT 'OFFICIAL_SCHEME_PORTAL',
        source_title VARCHAR(255) NOT NULL,
        source_url VARCHAR(500) NOT NULL,
        source_authority VARCHAR(255) NOT NULL,
        source_scope VARCHAR(100) NOT NULL DEFAULT 'FULL_GUIDELINES',
        is_primary BOOLEAN DEFAULT 1,
        notes TEXT,
        retrieved_at DATETIME,
        last_verified_at DATETIME,
        FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()

    print(f"Migration completed. Added {added_cols} new columns to schemes table.")

if __name__ == '__main__':
    migrate_database()
