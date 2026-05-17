from flask import Flask, render_template, redirect, url_for
from flask_cors import CORS
from routes.chat import chat_bp
from routes.history import history_bp


def create_app():
    app = Flask(
        __name__,
        template_folder="../frontend/templates",
        static_folder="../frontend/static"
    )
    CORS(app)

    app.register_blueprint(chat_bp,     url_prefix="/api/chat")
    app.register_blueprint(history_bp,  url_prefix="/api/history")

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/login")
    def login():
        return render_template("login.html")

    return app

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)