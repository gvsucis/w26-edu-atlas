from flask import Flask
from app.api.routes import api
from app.config.settings import Config

"""
Create and configure the Flask application.
"""

def create_app():
    app = Flask(__name__)
    
    app.register_blueprint(api, url_prefix='/api')
    
    return app


if __name__ == '__main__':
    app = create_app()

    app.run(debug=True, port=5000)