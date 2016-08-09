# -*- coding: utf-8 -*-
from ..database import *
from utils import *
import re
import time

def all_city_query( request_data={} ):
	"""查询整个城市的景点统计信息
	Args:
		data: 由js提交的表单转换的dict数据,即用户提交的查询条件
	Returns:
		查询结果dict, {"result":查询结果,"status": 状态(0表成功，1表失败)}
	"""
	print "query start:",time.strftime("%Y-%m-%d %A %X %Z", time.localtime())  
	city_ids = ""
	city_names = ""
	if request_data:
		city_ids = ""
		env = request_data['environment'][0]
	else:
		city_ids = ""
		env = 'test'

	query_city = "SELECT C.id AS id, C.name AS name, C.country AS country, C.visit_num, C.status \
FROM city AS C WHERE 1 AND "
	condition = ""


	if city_ids:
		condition += "C.id IN (%s) AND " % to_query_string(city_ids)

	if city_names:
		condition += "C.name IN (%s) AND " % to_query_string(city_names)

	city_status = "OPEN,Ready"
	if city_status:
		condition += "C.status  IN (%s) AND " % to_query_string(city_status)

	condition += ' 1 GROUP BY C.id ORDER BY C.id'

	#if sort_tag:
	#	condition += " ORDER BY %s %s" % (sort_tag,sort_order)


	query_city += condition
	
	comment_count_dict = get_all_comment_count()

	# 想要查询的环境对应的数据库
	if env=='test':
		db = db_test
		hotel_cities = calculate_total_hotel_of_city(db,comment_count_dict)
		attr_cities = calculate_total_attr_of_city(db,comment_count_dict)
		rest_cities = calculate_total_rest_of_city(db,comment_count_dict)
		shop_cities = calculate_total_shop_of_city(db,comment_count_dict)
	elif env=='online':
		db = db_online
		hotel_cities = calculate_total_hotel_of_city(db,comment_count_dict)
		attr_cities = calculate_total_attr_of_city(db,comment_count_dict)
		rest_cities = calculate_total_rest_of_city(db,comment_count_dict)
		shop_cities = calculate_total_shop_of_city(db,comment_count_dict)
	elif env=='dev':
		# 这里的hotel表仍然查db_test的
		db = db_test 
		hotel_cities = calculate_total_hotel_of_city(db_hotel,comment_count_dict)
		attr_cities = calculate_total_attr_of_city(db_attr,comment_count_dict)
		rest_cities = calculate_total_rest_of_city(db_rest,comment_count_dict)
		shop_cities = calculate_total_shop_of_city(db_shop,comment_count_dict)
	else:
		pass

	result1 = db.fetch(query_city);

	result = []

	if result1:
		for row1 in result1:
			city = {}
			#city = dict(city,**row1)
			city['id'] = row1['id']
			city['name'] = row1['name'].encode('utf-8')
			city['country'] = row1['country'].encode('utf-8')
			city['city_status'] = row1['status']
			city['visit_num'] = row1['visit_num']

			city['hotel_total'] = 0
			city['hotel_image_percentage'] = 0
			city['hotel_comment_percentage'] = 0
			if hotel_cities.has_key(row1['id']):
				c = hotel_cities[row1['id']]
				city['hotel_total'] = c['total']
				city['hotel_image_percentage'] = c['image_percentage']
				city['hotel_comment_percentage'] = c['comment_percentage']

			city['attr_total'] = 0
			city['attr_image_percentage'] = 0
			city['attr_comment_percentage'] = 0
			if attr_cities.has_key(row1['id']):
				c = attr_cities[row1['id']]
				city['attr_total'] = c['total']
				city['attr_image_percentage'] = c['image_percentage']
				city['attr_comment_percentage'] = c['comment_percentage']

			city['rest_total'] = 0
			city['rest_image_percentage'] = 0
			city['rest_comment_percentage'] = 0
			if rest_cities.has_key(row1['id']):
				c = rest_cities[row1['id']]
				city['rest_total'] = c['total']
				city['rest_image_percentage'] = c['image_percentage']
				city['rest_comment_percentage'] = c['comment_percentage']


			city['shop_total'] = 0
			city['shop_image_percentage'] = 0
			city['shop_comment_percentage'] = 0
			if shop_cities.has_key(row1['id']):
				c = shop_cities[row1['id']]
				city['shop_total'] = c['total']
				city['shop_image_percentage'] = c['image_percentage']
				city['shop_comment_percentage'] = c['comment_percentage']

			result.append(city)
		
	# 合并两个dict
	# result = dict(result1,**result2)

	res = {"status":0,"result":result}
	if not result: 
		res = {"status":1,"result":result}
	print "query over :",time.strftime("%Y-%m-%d %A %X %Z", time.localtime())  
	return res
