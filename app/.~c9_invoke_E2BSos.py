from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

aUPLOAD_FOLDER = "./app/static/uploads"

app = Flask(__name__)

app.config['SECRET_KEY'] = "change this to be a more random key"
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://admin:secret@localhost/project1"
db = SQLAlchemy(app)
from app import views