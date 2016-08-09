# -*- coding: utf-8 -*-
from flask import Blueprint

blueprint = Blueprint('blueprint', __name__, static_folder='../static')

from . import views, errors
