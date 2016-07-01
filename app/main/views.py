# -*- coding: utf-8 -*-
from flask import render_template, session, redirect, url_for
from . import blueprint
from .forms import NameForm
from flask import jsonify

from datetime import datetime
from db_add import QueryBySQL


@blueprint.route('/', methods=['GET', 'POST'])
def index():
    form = NameForm()
    if form.validate_on_submit():
        session['name'] = form.name.data
        return redirect(url_for('index'))
    return render_template('index.html', form=form, name=session.get('name'))


@blueprint.route('/get_date')
def get_date():
    return render_template('get_date.html', current_time=datetime.utcnow())


@blueprint.route('/user/<your_name>')
def user(your_name):
    return render_template('user.html', name=your_name)

@blueprint.route('/data')
def data():
    sql = "select * from api limit 10"
    result = QueryBySQL(sql)
    return jsonify({"result:":result})

@blueprint.route('/test')
def test():
	return render_template('test.html')

@blueprint.route('/hotel')
def test1():
	return render_template('hotel.html')
