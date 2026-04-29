import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    # Note: Use Gunicorn or Waitress in production instead of app.run
    app.run(host='0.0.0.0', port=port, debug=os.environ.get("FLASK_ENV") == "development")
