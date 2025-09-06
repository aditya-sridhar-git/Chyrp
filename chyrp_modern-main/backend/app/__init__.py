from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from datetime import timedelta

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Session configuration
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # Initialize extensions
    db.init_app(app)

    with app.app_context():
        db.create_all()
    
    # Configure CORS
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
    
    # Import and register blueprints
    from app.routes import main
    app.register_blueprint(main)
    
    return app
