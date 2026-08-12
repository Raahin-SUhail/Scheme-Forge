import sqlite3

conn = sqlite3.connect("schemeforge.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    min_age INTEGER,
    max_income INTEGER,
    category TEXT,
    state TEXT,
    benefits TEXT,
    procedure TEXT
)
""")

# Insert sample scheme
cursor.execute("""
INSERT INTO schemes (name, min_age, max_income, category, state, benefits, procedure)
VALUES ('Old Age Pension Scheme', 60, 100000, 'SC', 'Tamil Nadu',
        'Monthly pension support',
        'Apply at local government office with Aadhaar and income certificate')
""")

conn.commit()
conn.close()

print("Database and sample data created.")
