# coding=utf-8
from flask import Flask
from flask.ext.script import Manager
from flask.ext.bootstrap import Bootstrap
from flask.ext.moment import Moment
from flask.ext.sqlalchemy import SQLAlchemy
from .config import config


manager = Manager()
bootstrap = Bootstrap()
moment = Moment()
db = SQLAlchemy()


def create_app(config_name):
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'hard to guess string'

    bootstrap.init_app(app)
    moment.init_app(app)
    db.init_app(app)

    from .main import blueprint as my_blueprint
    app.register_blueprint(my_blueprint)

    return app
