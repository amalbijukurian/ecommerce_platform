import os
from dotenv import load_dotenv

# Find and load the .env file
load_dotenv()

class Config:
    """
    This class reads your secret settings from the .env file 
    so your main application can use them.
    """
    
    # Get the database connection string from the .env file
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
    
    # Get the JWT secret key from the .env file
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # This setting is recommended to be False to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False