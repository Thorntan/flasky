# -*- coding: utf-8 -*-
from ..database import db_test, db_online,db_attr
from utils import to_query_string, get_all_comment_count,calculate_percentage,calculate_chinese_count,calculate_not_chinese_count
import re

def attr_city_query(data={}):
	"""查询整个城市的景点统计信息
	Args:
		data: 由js提交的表单转换的dict数据,即用户提交的查询条件
	Returns:
		查询结果dict, {"result":查询结果,"status": 成功或失败信息（成功为“success”）}
	"""
	if data:
		city_names =data['cityName'][0].encode('utf-8')
		country_names = data['countryName'][0].encode('utf-8')
		city_status = data['cityStatus'][0].encode('utf-8')
		sort_tag = data['sortTag'][0].encode('utf-8')
		sort_order = data['sortOrder'][0].encode('utf-8')
		env = data['environment'][0]
		is_online = data['isOnline'][0]
		limitNum = 0
	else:
		city_names = ""
		country_names = ""
		city_status = ""
		sort_tag = ""
		sort_order = ""
		env = "test"
		is_online = "online"
		limitNum = 10

	# 想要查询的环境对应的数据库
	if env=='test':
		db = db_test
	elif env=='online':
		db = db_online
	elif env=='dev':
		db = db_attr
	else:
		db = db_test

	sql = "SELECT C.id, C.name, C.country, C.visit_num, C.status AS city_status, \
count(*) AS total, \
sum(CASE WHEN A.online = 1 THEN 1 ELSE 0 END) AS online_total, \
group_concat(A.id) AS comment_total, \
sum(CASE WHEN A.image_list !='' THEN 1 ELSE 0 END) AS image_total, \
group_concat(A.name,'|||') AS name_bad, \
group_concat(A.name_en,'|||') AS name_en_bad, \
sum(CASE WHEN A.name = '' OR A.name = 'NULL' THEN 1 ELSE 0 END) AS name_null, \
sum(CASE WHEN A.name_en = '' OR A.name_en = 'NULL' THEN 1 ELSE 0 END) AS name_en_null, \
sum(CASE WHEN A.map_info = '' OR A.map_info = 'NULL' THEN 1 ELSE 0 END) AS map_null, \
sum(CASE WHEN A.address = '' OR A.address = 'NULL' THEN 1 ELSE 0 END) AS address_null, \
sum(CASE WHEN A.open = '' OR A.open = 'NULL' THEN 1 ELSE 0 END) AS open_null, \
sum(CASE WHEN A.norm_tagid = '' OR A.norm_tagid = 'NULL' THEN 1 ELSE 0 END) AS tag_null, \
sum(CASE WHEN A.norm_tagid_en = '' OR A.norm_tagid_en = 'NULL' THEN 1 ELSE 0 END) AS tag_en_null, \
group_concat(A.description,'|||') AS desc_bad, \
group_concat(A.description_en,'|||') AS desc_en_bad, \
sum(CASE WHEN A.description = '' OR A.description = 'NULL' THEN 1 ELSE 0 END) AS desc_null, \
sum(CASE WHEN A.description_en = '' OR A.description_en = 'NULL' THEN 1 ELSE 0 END) AS desc_en_null \
FROM city AS C, attraction AS A WHERE C.id = A.city_id AND 1 "

	condition = ""

	if is_online:
		if is_online == 'online':
			condition += "AND A.online = 1 "
		if is_online == 'offline':
			condition += "AND A.online != 1 "

	if city_names:
		 condition += "AND C.name IN (%s) " % to_query_string(city_names)

	if country_names:
		 condition += "AND C.country IN (%s) " % to_query_string(country_names)

	if city_status:
		 condition += "AND C.status = %s " % to_query_string(city_status)

	condition += ' GROUP BY C.id '
	

	if sort_tag:
		 condition += " ORDER BY %s %s " % (sort_tag.replace('id','C.id'),sort_order)
	
	if limitNum:
		condition += " limit %s " % limitNum

	sql += condition
	
	try:
		result = db.fetch(sql)
	except:
		result = []
		status = "没有查询到符合条件的城市"

	if not result or len(result)==0:
		status = "查询的地区没有符合条件的景点"
		return {"result":result,"status":status}

	result = eval( str(result).replace('Decimal(','').replace(')','') )

	# 查询整个城市有多少景点有评论
	comment_count_dict = get_all_comment_count('attr')
	for i in range(len(result)):
		ids = result[i]['comment_total'].encode('utf-8')	
		city_comment_count = 0
		for sid in ids.split(','):
			city_comment_count +=  1 if comment_count_dict.has_key(sid) else 0
		result[i]['comment_total'] = city_comment_count

	# 计算空比例
	for i in range(len(result)):
		total = result[i]['total']
		result[i]['name_null'] = calculate_percentage(result[i]['name_null'],total)
		result[i]['name_en_null'] = calculate_percentage(result[i]['name_en_null'],total)
		result[i]['map_null'] = calculate_percentage(result[i]['map_null'],total)
		result[i]['address_null'] = calculate_percentage(result[i]['address_null'],total)
		result[i]['open_null'] = calculate_percentage(result[i]['open_null'],total)
		result[i]['tag_null'] = calculate_percentage(result[i]['tag_null'],total)
		result[i]['tag_en_null'] = calculate_percentage(result[i]['tag_en_null'],total)
		result[i]['desc_null'] = calculate_percentage(result[i]['desc_null'],total)
		result[i]['desc_en_null'] = calculate_percentage(result[i]['desc_en_null'],total)
		# 计算字段中文比例
		result[i]['name_bad'] = calculate_percentage( calculate_not_chinese_count(result[i]['name_bad']), total)
		result[i]['name_en_bad'] = calculate_percentage( calculate_chinese_count(result[i]['name_en_bad']), total)
		result[i]['desc_bad'] = calculate_percentage( calculate_not_chinese_count(result[i]['desc_bad']), total)
		result[i]['desc_en_bad'] = calculate_percentage( calculate_chinese_count(result[i]['desc_en_bad']), total)


	return {"result":result,"status":"success"}

def attr_detail_query( data = {}):
	"""查询景点的详细信息
	Args:
		data: 由js提交的表单转换的dict数据,即用户提交的查询条件
	Returns:
		查询结果dict, {"result":查询结果,"status": 成功或失败信息（成功为“success”）}
	"""
	if data:
		attr_names = data['sourceName'][0].encode('utf-8')
		match_method = data['matchMethod'][0]
		attr_ids = data['sourceID'][0].encode('utf-8')
		city_names = data['cityName'][0].encode('utf-8')
		country_names = data['countryName'][0].encode('utf-8')
		sort_tag = data['sortTag'][0].encode('utf-8')
		sort_order = data['sortOrder'][0].encode('utf-8')
		is_online = data['isOnline'][0]
		data_source = data['dataSource'][0]
		limit_num = data['limitNum'][0]
		env = data['environment'][0]	
	else:
		attr_names = ""
		match_method = ""
		attr_ids = ""
		city_names = ""
		country_names = ""
		sort_tag = ""
		sort_order = ""
		is_online = ""
		data_source = "qyer"
		limit_num = "10"
		env = "dev"

	# 想要查询的环境对应的数据库
	if env=='test':
		db = db_test
	elif env=='online':
		db = db_online
	elif env=='dev':
		db = db_attr
	else:
		db = db_test

	sql = "SELECT C.name AS city_name, C.id AS city_id, \
A.id, A.name, A.name_en, A.map_info, A.address, \
A.hot, A.grade, A.ranking, \
A.open,A.image_list, \
A.norm_tagid, A.data_source AS source,A.online \
FROM city AS C, attraction AS A WHERE C.id = A.city_id AND 1 ";


	condition = '';
	
	if attr_ids:
		condition += "AND A.id IN (%s) "  % to_query_string(attr_ids)

	
	if attr_names:
		if match_method=="fuzzy_match":
			condition += "AND A.name like '%%%s%%' " % attr_names
		else:
			condition += "AND A.name ='%s' " % attr_names

	if city_names:
		condition += "AND C.name IN (%s) " % to_query_string(city_names)

	if country_names:
		condition += "AND C.country IN (%s) " % to_query_string(country_names)

	if is_online:
		if is_online=='online':
			condition += "AND A.online=1 "
		else:
			condition += "AND A.online!=1 "

	if data_source:
		#condition += "AND A.source IN (%s) " % to_query_string(data_source)
		condition += "AND A.data_source like '%%%s%%' " % data_source

	if sort_tag:
		condition += " ORDER BY %s %s" % (sort_tag.replace('id','A.id'),sort_order)

	if limit_num:
		condition += " limit %u " %  int(limit_num)

	sql += condition

	try:
		result = db.fetch(sql)
		result = eval( str(result).replace('Decimal(','').replace(')','') )
		result = result[:]
	except:
		return {"result":result,"status":"没有查询到符合条件的景点"}

	if not result or len(result) == 0:
		return {"result":result,"status":"没有查询到符合条件的景点"}

	# 获取评论数	
	comment_count_dict = get_all_comment_count('attr')
	for i in range(len(result)):
		sid = result[i]['id']
		result[i]['comment_count'] = comment_count_dict[sid] if comment_count_dict.has_key(sid) else 0
		result[i]['image_count'] = len(result[i]['image_list'].split('|')) if result[i]['image_list'] else 0

	return {"result":result,"status":"success"}
