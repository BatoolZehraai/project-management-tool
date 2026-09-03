import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_SQLITE_PATH = os.path.join(BASE_DIR, 'sdlc_governance.db').replace('\\', '/')

class Config:
    BASE_DIR = BASE_DIR
    DEFAULT_SQLITE_PATH = DEFAULT_SQLITE_PATH
    SECRET_KEY = os.environ.get('SECRET_KEY', 'sdlc-governance-secret-key-12345')
    
    # Persistent SQLite database with absolute path unless overridden in environment
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{DEFAULT_SQLITE_PATH}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload limits: 16MB max file upload size
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

