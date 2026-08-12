from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DB_NAME = "schemeforge.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return "Scheme Forge Backend Running"

# Add a new scheme (Admin)
@app.route('/api/add-scheme', methods=['POST'])
def add_scheme():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO schemes (name, min_age, max_income, category, state, benefits, procedure)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data['name'], data['min_age'], data['max_income'],
        data['category'], data['state'], data['benefits'], data['procedure']
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Scheme added successfully"}), 201

# Get all schemes
@app.route('/api/schemes', methods=['GET'])
def get_all_schemes():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM schemes")
    schemes = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in schemes])

# Find schemes based on user eligibility
@app.route('/api/find-schemes', methods=['POST'])
def find_schemes():
    data = request.json
    age = data.get('age')
    category = data.get('category')
    income = data.get('income')
    state = data.get('state')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name FROM schemes
        WHERE min_age <= ? AND max_income >= ?
        AND category = ? AND state = ?
    """, (age, income, category, state))

    schemes = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in schemes])

# Get full scheme details
@app.route('/api/schemes/<int:id>', methods=['GET'])
def scheme_details(id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM schemes WHERE id=?", (id,))
    scheme = cursor.fetchone()
    conn.close()

    if scheme:
        return jsonify(dict(scheme))
    return jsonify({"error": "Scheme not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
