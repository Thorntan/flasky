# -*- coding: utf-8 -*-
from ..database import db_test,db_online
from utils import *
import re

def query_hotel_detail(data):
	"""查询酒店的详细信息
	Args: 
		data: 由js提交的表单转换的dict数据,即用户提交的查询条件
	Returns:
		查询结果dict, {"result":查询结果,"status": 状态(0表成功，1表失败)}		
	"""

	hotel_ids = data['hotelID'][0].encode('utf-8')
	hotel_names = data['hotelName'][0].encode('utf-8')
	city_ids = data['cityID'][0].encode('utf-8')
	city_names = data['cityName'][0].encode('utf-8')	
	country_names = data['country'][0].encode('utf-8')
	sort_tag = data['sortTag'][0].encode('utf-8')
	sort_order = data['sortOrder'][0].encode('utf-8')
	env = data['environment'][0]

	# 想要查询的环境对应的数据库
	if env=='test':
		db = db_test
	elif env=='online':
		db = db_online
	else:
		pass

	sql = "SELECT C.country AS country, C.name AS city_name, C.id as city_id, H.uid AS hotel_id, H.hotel_name AS hotel_name, H.hotel_name_en AS hotel_name_en, H.map_info AS map_info, H.address AS address, H.star AS star, H.grade AS grade, H.all_grade AS all_grade, H.all_source AS source, H.comment_num AS comment_num, H.img_list AS img_list  FROM city AS C, hotel AS H WHERE H.city_mid = C.id AND ";

	# 查询条件
	if hotel_ids:
		sql += "H.uid IN (%s) AND "  % to_query_string(hotel_ids)
	
	if hotel_names:
		sql += "H.hotel_name IN (%s) AND "  % to_query_string(hotel_names)

	if city_ids:
		sql += "C.id IN (%s) AND " % to_query_string(city_ids)

	if city_names:
		sql += "C.name IN (%s) AND " % to_query_string(city_names)

	if country_names:
		sql += "C.country IN (%s) AND " % to_query_string(country_names)

	sql += ' 1 '

	# 排序
	if sort_tag:
		sql += " ORDER BY %s %s" % (sort_tag,sort_order)

	result = db.fetch(sql)

	# 查询酒店评论数
	comment_count_dict = get_all_comment_count('hotel')
	for i in range(len(result)):
		sid = result[i]['hotel_id']
		result[i]['comment_num'] = comment_count_dict[sid] if comment_count_dict.has_key(sid) else 0

	data = {}
	data = {"result":result,"status":0}
	return data




def query_hotel_city(data):
	"""查询整个城市的酒店统计信息
	Args: 
		data: 由js提交的表单转换的dict数据,即用户提交的查询条件
	Returns:
		查询结果dict, {"result":查询结果,"status": 状态(0表成功，1表失败)}
	"""
	city_ids = data['cityID'][0].encode('utf-8')
	city_names =data['cityName'][0].encode('utf-8')	
	country_names = data['country'][0].encode('utf-8')
	city_status = data['city_status'][0].encode('utf-8')
	city_type = data['city_type'][0].encode('utf-8')
	sort_tag = data['sortTag'][0].encode('utf-8')
	sort_order = data['sortOrder'][0].encode('utf-8')
	env = data['environment'][0]

	# 想要查询的环境对应的数据库
	if env=='test':
		db = db_test
	elif env=='online':
		db = db_online
	else:
		pass

	# 因为group_concat()的长度限制，注意修改数据库的环境变量：sql = "SET SESSION group_concat_max_len =20000;"

	sql = "SELECT C.name AS name, C.id AS id, C.country AS country, \
		C.status AS city_status, C.visit_num AS visit_num, \
		sum(CASE WHEN H.uid !='' THEN 1 ELSE 0 END) AS hotel_num_online, \
		sum(CASE WHEN H.uid !='' THEN 1 ELSE 0 END) AS hotel_num_total, \
		sum(CASE WHEN H.img_list !='' AND H.img_list is not null THEN 1 ELSE 0 END) AS hotel_image_total, \
		sum(CASE WHEN H.hotel_name !='' AND H.hotel_name!='NULL' THEN 1 ELSE 0 END) AS hotel_name_total, \
		sum(CASE WHEN H.hotel_name_en !='' AND H.hotel_name_en!='NULL' THEN 1 ELSE 0 END) AS hotel_name_en_total, \
		group_concat(H.uid) as hotel_comment_total FROM city as C, hotel as H where C.id = H.city_mid AND  "

	# 查询条件

	if city_ids:
		sql += "C.id IN (%s) AND " % to_query_string(city_ids)

	if city_names:
		sql += "C.name IN (%s) AND " % to_query_string(city_names)

	if country_names:
		sql += "C.country IN (%s) AND " % to_query_string(country_names)
	
	if city_status:
		sql += "C.status = %s AND " % to_query_string(city_status)
	
	if city_type:
		sql += "C.city_type = %s AND " % to_query_string(city_type)	
	
	sql += ' 1 GROUP BY C.id'

	if sort_tag:
		sql += " ORDER BY %s %s" % (sort_tag,sort_order)

	result = db.fetch(sql)
	result = eval( str(result).replace('Decimal(','').replace(')','') )

	# 查询酒店评论数
	comment_count_dict = get_all_comment_count('hotel')
	for i in range(len(result)):
		ids = result[i]['hotel_comment_total'].encode('utf-8')
		city_comment_count = 0
		for sid in ids.split(','):
			city_comment_count +=  1 if comment_count_dict.has_key(sid) else 0
		result[i]['hotel_comment_total'] = city_comment_count

	data = {}
	data = {"result":result,"status":0}
	return data
