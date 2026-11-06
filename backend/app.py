from flask import Flask
from flask_cors import CORS

from api import register_blueprints

app = Flask(__name__)
CORS(app, expose_headers=["X-Data-Source", "X-Oracle-Provider"])
register_blueprints(app)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
