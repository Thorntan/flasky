# -*- coding: utf-8 -*-
from ..database import *
import re
import os
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

def to_query_string(name_list):
	"""将字符串转换成sql语句里的in括号里的字符串
	eg：'ht1234,ht567' => 'ht1234', 'ht567'
	"""
	name_list = name_list.replace('，',',').split(',')
	name_string = ''
	for i in name_list:
		name_string += (i.encode('utf-8')+"','")
	name_string = "'" + name_string[:-3] + "'"
	return name_string.encode('utf-8')


def get_comment_count(poi_id):
	"""获取单个poi的评论数
	Args:
		poi_id: poi的妙计ID
	"""
	sql = "SELECT id, count FROM comment_count WHERE id = '%s'" % poi_id
	result = db_comment.fetch(sql)
	if result:
		return result[0]
	else:
		return 0


def get_all_comment_count(category=''):
	"""获取整个类的所有点的评论信息
	Args:
		所属类别,如hotel,rest,view(即attr),shop
	"""
	category = category.replace('attr','view')
	if category:
		sql = "SELECT id, count FROM comment_count WHERE hname = '%s' and count>0 " % category
	else:
		sql = "SELECT id, count FROM comment_count WHERE count>0 "
	result = db_comment.fetch(sql)
	comment_count_dict = {}
	for i in result:
		comment_count_dict[i['id']] = i['count']
	return comment_count_dict

def get_comments_of_ids(city_ids):
	sql = "SELECT uid as id FROM hotel WHERE city_mid in(%s) " % city_ids
	result = db.fetch(sql)
	
def calculate_percentage(part,whole):
	if int(whole) and int(part):
		percentage = float(part) / float(whole)
		return str("%.2f%%" % (percentage*100))
	else:
		return "0.00%"

def calculate_total_hotel_of_city(db_connection,comment_count_dict):
	"""查询所有城市的酒店数量，有图比例，有评论比例
	Args:
		指定的数据库连接
	Return:
		返回一个dict，city_id为key，各统计数目为value
	"""
	query_all_hotel = "SELECT city_mid AS city_id, \
sum(CASE WHEN uid !='' THEN 1 ELSE 0 END) AS total, \
sum(CASE WHEN img_list !='' THEN 1 ELSE 0 END) AS image_total, \
group_concat(uid) AS comment_total \
FROM hotel GROUP BY city_mid"	
	result = db_connection.fetch(query_all_hotel)
	# 因为mysql的sum()函数是Decimal型，没有转换成int型，这里直接用replace处理掉
	result = eval( str(result).replace('Decimal(','').replace(')','') )
	# 查询所有评论
	comment_count_dict = get_all_comment_count('hotel')

	cities = {}
	for row in result:
		city = {}
		city['total'] = row['total']
		city['image_total'] = row['image_total'] 
		city['comment_total'] = 0
		# 计算有评论的点
		ids = row['comment_total'].encode('utf-8')
		for sid in ids.split(','):
			city['comment_total'] +=  1 if comment_count_dict.has_key(sid) else 0
		city['image_percentage'] = calculate_percentage( city['image_total'] , city['total'] )
		city['comment_percentage'] = calculate_percentage( city['comment_total'] , city['total'] )
		cities[ row['city_id'] ] = city

	return cities
			
	
	
def calculate_total_attr_of_city(db_connection,comment_count_dict):
	"""查询所有城市的景点数量，有图比例，有评论比例
	Args:
		指定的数据库连接
	Return:
		返回一个dict，city_id为key，各统计数目为value
	"""
	query_all_hotel = "SELECT city_id AS city_id, \
sum(CASE WHEN id !='' THEN 1 ELSE 0 END) AS total, \
sum(CASE WHEN image_list !='' THEN 1 ELSE 0 END) AS image_total, \
group_concat(id) AS comment_total \
FROM attraction WHERE online=1 GROUP BY city_id"	
	result = db_connection.fetch(query_all_hotel)
	result = eval( str(result).replace('Decimal(','').replace(')','') )
	# 查询所有评论
	#comment_count_dict = get_all_comment_count('attr')

	cities = {}
	for row in result:
		city = {}
		city['total'] = row['total']
		city['image_total'] = row['image_total'] 
		# 计算有评论的点
		city['comment_total'] = 0
		ids = row['comment_total'].encode('utf-8')
		for sid in ids.split(','):
			city['comment_total'] +=  1 if comment_count_dict.has_key(sid) else 0
		city['image_percentage'] = calculate_percentage( city['image_total'] , city['total'] )
		city['comment_percentage'] = calculate_percentage( city['comment_total'] , city['total'] )
		cities[ row['city_id'] ] = city

	return cities

def calculate_total_rest_of_city(db_connection,comment_count_dict):
	"""查询所有城市的餐厅数量，有图比例，有评论比例
	Args:
		指定的数据库连接
	Return:
		返回一个dict，city_id为key，各统计数目为value
	"""
	query_all_hotel = "SELECT city_id AS city_id, \
sum(CASE WHEN id !='' THEN 1 ELSE 0 END) AS total, \
sum(CASE WHEN image_list !='' THEN 1 ELSE 0 END) AS image_total, \
group_concat(id) AS comment_total \
FROM restaurant WHERE online=1 GROUP BY city_id"	
	result = db_connection.fetch(query_all_hotel)
	result = eval( str(result).replace('Decimal(','').replace(')','') )
	# 查询所有评论
	#comment_count_dict = get_all_comment_count('rest')

	cities = {}
	for row in result:
		city = {}
		city['total'] = row['total']
		city['image_total'] = row['image_total'] 
		# 计算有评论的点
		city['comment_total'] = 0
		ids = row['comment_total'].encode('utf-8')
		for sid in ids.split(','):
			city['comment_total'] +=  1 if comment_count_dict.has_key(sid) else 0
		city['image_percentage'] = calculate_percentage( city['image_total'] , city['total'] )
		city['comment_percentage'] = calculate_percentage( city['comment_total'] , city['total'] )
		cities[ row['city_id'] ] = city

	return cities
			
			
def calculate_total_shop_of_city(db_connection,comment_count_dict):
	"""查询所有城市的购物数量，有图比例，有评论比例
	Args:
		指定的数据库连接
	Return:
		返回一个dict，city_id为key，各统计数目为value
	"""
	query_all_hotel = "SELECT city_id AS city_id, \
sum(CASE WHEN id !='' THEN 1 ELSE 0 END) AS total, \
sum(CASE WHEN image_list !='' THEN 1 ELSE 0 END) AS image_total, \
group_concat(id) AS comment_total \
FROM shopping WHERE online=1 GROUP BY city_id"	
	result = db_connection.fetch(query_all_hotel)
	result = eval( str(result).replace('Decimal(','').replace(')','') )

	cities = {}
	for row in result:
		city = {}
		city['total'] = row['total']
		city['image_total'] = row['image_total'] 
		# 计算有评论的点
		city['comment_total'] = 0
		ids = row['comment_total'].encode('utf-8')
		for sid in ids.split(','):
			city['comment_total'] +=  1 if comment_count_dict.has_key(sid) else 0
		city['image_percentage'] = calculate_percentage( city['image_total'] , city['total'] )
		city['comment_percentage'] = calculate_percentage( city['comment_total'] , city['total'] )
		cities[ row['city_id'] ] = city

	return cities
			
			
def get_bi_urls():
	sql = "SELECT * FROM task_attraction_url"
	result = db_bi.fetch(sql)
	id_url_dict = {}
	for i in result:
		if id_url_dict.has_key(i['id']):
			id_url_dict[i['id']] += ('|'+(i['source']+":"+i['url']))
		else:
			id_url_dict[i['id']] = ""
			id_url_dict[i['id']] += (i['source']+":"+i['url'])
	return id_url_dict

#def dump_data():
#	id_list = ["r0119193","r0027322"]
#	db_name = "rest_merge"
#	table_name = "restaurant"
#	if len(id_list)<1:
#		return ""
#	id_str = "\'"+ str("\',\'".join(id_list)) +"\'"
#	comm = "mysqldump -uroot -pplatform %s %s --where=\"id in ( %s )\" " % (db_name,table_name,id_str)
#	import commands
#	res = commands.getstatusoutput(comm)
#	if not res[0]:
#		print 'dump success'
#		return res[1]
#	else:
#		print 'dump failed'
#		return ""


def reset_online_status( post_data ):
	"""批量上线，批量下线
	"""
	data = eval(post_data["data"][0])
	id_list = data['idList']
	online_status = int(data['option'])
	env = data['environment']
	table_name = data['category']
	if env =='test':
		db = "devdb"
	elif env =='onlinedb':
		db = db_online
	else:
		db = ''
	ids = "'"+"'".join(id_list)+"'"
	sql = "UPDATE %s.%s SET online=%s WHERE id IN( %s );" % (db,table_name,online_status,ids)
	return sql


def get_city_dict():
	sql = "SELECT id, name, country FROM city"
	result =  db_test.fetch(sql)
	id_dict = {}
	name_dict = {}
	for i in result:
		cid = i['id']
		name = i['name'].encode('utf-8')
		country = i['country'].encode('utf-8')
		id_dict[cid] = {}
		id_dict[cid]['name'] = name
		id_dict[cid]['country'] = country
		name_dict[name] = {}
		name_dict[name] = cid
	return id_dict,name_dict

def get_bi_user():
	sql ="SELECT id,username FROM miojiadmin.mja_user"
	result = db_bi.fetch(sql)
	user_dict = {}
	for i in result:
		uid = i['id']
		name = i['username'].encode('utf-8')
		user_dict[str(uid)] = name
	return user_dict
		
def get_bi_username():
	sql1 = "SELECT id,username FROM miojiadmin.mja_user"
	r1 = db_bi.fetch(sql1)
	sql2 = "SELECT user FROM userCountry"# WHERE country!='ALL'"
	r2 = db_attr.fetch(sql2)
	names1 = []
	names2 = []
	name_dict = {}
	for i in r1:
		name_dict[i['username']] = str(i['id'])
		names1.append(i['username']	)
	for j in r2:
		names2.append(j['user'] )
	names_list = list(set(names1).intersection(set(names2)))

	id_dict = {}
	for k in names_list:
		id_dict[ name_dict[k] ] = k
	return id_dict
	

def get_city_by_ids(ids):
	"""	获取景点的城市
	"""
	sql ="SELECT distinct(A.city_id) AS city, group_concat(A.id) AS ids, C.name FROM city AS C,attraction AS A WHERE C.id=A.city_id AND A.id IN (%s) GROUP BY A.city_id" % to_query_string(ids)
	result = db_attr.fetch(sql)
	city_dict = {}
	for i in result:
		city_dict[i['city']] = {}
		city_dict[i['city']]['ids'] = i['ids'] 
		city_dict[i['city']]['name'] = i['name']
	return city_dict

def has_chinese(contents,encoding='utf-8'):
	"""判断字符串是否为中文，如果有中文则返回True, 没有中文则返回False
	"""
	zh_pattern = re.compile(u'[\u4e00-\u9fa5]+')
	if not isinstance(contents,unicode):
		u_contents = unicode(contents,encoding=encoding)
	results = zh_pattern.findall(u_contents)
	if len(results) > 0:
		return True
	else:
		return False

def calculate_chinese_count( names = ''):
	"""计算中文单词的个数,单词为空字符串或者为'NULL'的忽略不计
	"""
	if not names:
		return 0
	names = names.encode('utf-8')
	total = 0
	for name in names.split('|||'):
		if name=='' or name=='NULL':
			continue
		if has_chinese(name):
			total += 1
	return total


def calculate_not_chinese_count( names = ''):
	"""计算非中文单词的个数
	"""
	if not names:
		return 0
	names = names.encode('utf-8')
	total = 0
	# 考虑到名字中有逗号，所以从mysql中用group_concat取值时必须用不常用的符号分隔(如'|||')
	# 还有mysql中必须设置group_concat_max_len，默认的1024会截断
	for name in names.split('|||'):
		if name=='' or name=='NULL':
			continue
		if not has_chinese(name):
			total += 1
	return total

