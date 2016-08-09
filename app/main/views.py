# -*- coding: utf-8 -*-
#coding=utf-8
from flask import render_template, url_for, request, make_response,Response,jsonify
from . import blueprint
from utils import get_bi_username
from hotel import *
from attr import *
from rest import *
from shop import *
from city import *

from attr_task import *

@blueprint.app_errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@blueprint.app_errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

@blueprint.route('/')
def default():
	"""城市总览
	"""
	data = all_city_query()
	return render_template('index.html',data=data)

@blueprint.route('/index')
def index():
	"""城市总览
	"""
	data = all_city_query()
	return render_template('index.html',data=data)

@blueprint.route('/hotel_detail')
def hotel_detail():
	"""酒店详情页
	"""
	return render_template('hotel_detail.html')


# --- 酒店 ---
@blueprint.route('/hotel_city')
def hotel_city():
	"""城市酒店页
	"""
	return render_template('hotel_city.html')


@blueprint.route('/get_hotel_detail', methods=['POST'])
def get_hotel_detail():
	"""酒店详情查询
	Args:
		js提交过来的表单, request.form是 <class 'werkzeug.datastructures.ImmutableMultiDict'>
	Returns:
		response,用flask提供的jsonify将查询结果(dict型)封装成json数据并作为reponse的response body
	"""
	data = query_hotel_detail(dict(request.form))
	return jsonify(data)


@blueprint.route('/get_hotel_city', methods=['POST'])
def get_hotel_city():
	"""城市酒店统计数据查询
	"""
	data = query_hotel_city(dict(request.form))
	return jsonify(data)
# ---------


# --- 景点 ---
@blueprint.route('/attr_detail')
def attr_detail():
	"""景点详情页
	"""
	users = get_bi_username()
	return render_template('attr_detail.html',users=users)

@blueprint.route('/api/attr_detail',methods=['GET','POST'])
def get_attr_detail():
	if request.method == 'GET':
		data = attr_detail_query()
	if request.method == 'POST':
		data = attr_detail_query( dict(request.form) )
	return jsonify(data)

@blueprint.route('/attr_city')
def attr_city():
	"""景点城市页
	"""
	return render_template('attr_city.html')

@blueprint.route('/api/attr_city',methods=['GET','POST'])
def get_attr_cities():
	if request.method == 'POST':
		data = attr_city_query(dict(request.form))
	if request.method == 'GET':
		data = attr_city_query()
	return jsonify(data)

@blueprint.route('/attr_task')
def attr_task():
	users = get_bi_username()
	return render_template('attr_task.html',users=users)

# ---------



# --- 餐厅 ---
@blueprint.route('/rest_detail')
def rest_detail():
	"""餐厅详情页
	"""
	return render_template('rest_detail.html')

@blueprint.route('/api/rest_detail',methods=['GET','POST'])
def get_rest_detail():
	if request.method == 'GET':
		data = rest_detail_query()
	if request.method == 'POST':
		data = rest_detail_query( dict(request.form) )
	return jsonify(data)

@blueprint.route('/rest_city')
def rest_city():
	"""餐厅城市页
	"""
	return render_template('rest_city.html')

@blueprint.route('/api/rest_city',methods=['GET','POST'])
def get_rest_cities():
	if request.method == 'POST':
		data = rest_city_query(dict(request.form))
	if request.method == 'GET':
		data = rest_city_query()
	return jsonify(data)
# ---------


# --- 购物 ---
@blueprint.route('/shop_detail')
def shop_detail():
	"""购物详情页
	"""
	return render_template('shop_detail.html')

@blueprint.route('/api/shop_detail',methods=['GET','POST'])
def get_shop_detail():
	if request.method == 'GET':
		data = shop_detail_query()
	if request.method == 'POST':
		data = shop_detail_query( dict(request.form) )
	return jsonify(data)

@blueprint.route('/shop_city')
def shop_city():
	"""购物城市页
	"""
	return render_template('shop_city.html')

@blueprint.route('/api/shop_city',methods=['GET','POST'])
def get_shop_cities():
	if request.method == 'POST':
		data = shop_city_query(dict(request.form))
	if request.method == 'GET':
		data = shop_city_query()
	return jsonify(data)
# ---------



@blueprint.route('/cities')
def get_all_cities():
	"""城市查询
	"""
	return render_template('cities.html')

@blueprint.route('/get_all_city',methods=['POST'])
def get_all():
	"""城市总览查询
	"""
	data = all_city_query( dict(request.form) )
	return jsonify(data)



@blueprint.route('/api/cities',methods=['GET','POST'])
def cities():
	if request.method == 'GET':
		data = all_city_query()
	if request.method == 'POST':
		data = all_city_query( dict(request.form) )
	return jsonify(data)

@blueprint.route('/api/hotel_cities')
def hotel_cities():
	data = hotel_cities()
	return jsonify(data) 
	

@blueprint.route('/change_online_status',methods=['POST'])
def change_online_status():
	"""批量下线，批量上线
	"""
	text = reset_online_status( dict(request.form) )
	response = make_response( text )
	response.headers['Content-Disposition'] = "attachment; filename=update.sql"
	return response


@blueprint.route('/export',methods=['POST'])
def export():
	"""导出csv
	"""
	#from collections import OrderedDict
	#print OrderedDict(request.form)
	#data = request.get_json()
	#print data
	data_list =  eval( dict(request.form)['data'][0].encode('utf-8') ) 
	text = ""
	for d in data_list[:1]:
		for k,v in d.items():
			text += ( '"'+k+'",' )
	text = text[:-1] + '\n'

	for d in data_list:
		for k,v in d.items():
			text += ( '"'+ str(v).encode('utf-8') +'",' )
		text = text[:-1] + '\n'

	response = make_response( text )
	response.headers['Content-Disposition'] = "attachment; filename=test.csv"
	return response

# --- 标注任务 ---
@blueprint.route('/attr_task_query',methods=['POST'])
def get_attr_task():
	"""查询标注任务
	"""
	data = attr_task_query( dict(request.form) )
	return jsonify(data)


@blueprint.route('/attr_task_delete',methods=['POST'])
def delete_attr_task():
	"""删除标注任务
	"""
	data =  attr_task_delete( dict(request.form) )
	return jsonify(data)


@blueprint.route('/attr_task_add',methods=['POST'])
def add_attr_task():
	"""新添标注任务
	"""
	data = attr_task_add( dict(request.form) )
	return jsonify(data)

# ----------

# 用于跨域请求
#@blueprint.after_request
#def after_request(response):
#	print '--- after request ---'
#	response.headers.add('Access-Control-Allow-Origin', '*')
#	response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#	response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
#	return response
