import sys
import os

# Fix import paths for both local and Render deployment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template
from flask_cors import CORS
from routes.chat import chat_bp
from routes.history import history_bp


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.dirname(__file__), "../frontend/templates"),
        static_folder=os.path.join(os.path.dirname(__file__), "../frontend/static")
    )

    CORS(app)

    app.register_blueprint(chat_bp,    url_prefix="/api/chat")
    app.register_blueprint(history_bp, url_prefix="/api/history")

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/login")
    def login():
        return render_template("login.html")

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
