# -*- coding: utf-8 -*-
from flask import Blueprint

blueprint = Blueprint('blueprint', __name__)

from . import views, errors