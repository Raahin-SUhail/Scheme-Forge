import os
from dotenv import load_dotenv
from app import create_app

# Load production environment variables
load_dotenv()

# Initialize Flask application
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
