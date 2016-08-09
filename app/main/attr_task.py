# -*- coding: utf-8 -*-
from ..database import db_gc, db_bi
from utils import *

def attr_task_query( data={}):
	"""查询标注信息
	Args: 
		data: 由js提交的表单转换的dict数据,即用户提交的查询条件
	Returns:
		查询结果dict, {"result":查询结果,"status": 状态(0表成功，1表失败)}		
	"""
	#print data
	taskName = data["taskName"][0].encode('utf-8')
	matchFlag = data["matchFlag"][0].encode('utf-8')
	isCheck = data["isCheck"][0].encode('utf-8')
	isSync = data["isSync"][0].encode('utf-8')
	sortTag = data["sortTag"][0].encode('utf-8')
	sortOrder = data["sortOrder"][0].encode('utf-8')

	taskID = data["taskID"][0].encode('utf-8')
	checkWho = data["checkWho"][0].encode('utf-8')
	cityName = data["cityName"][0].encode('utf-8')

	# 标注字段,data["labelField[]"]是一个list
	labelField = ','.join(data["labelField[]"])
	# 标注人
	annoWho = ','.join(data["annoWho[]"])

	# 查询bi系统的用户
	user_dict = get_bi_user()
	# 查询城市的id,name,country
	dict_tuple = get_city_dict()	
	id_dict = dict_tuple[0]
	name_dict = dict_tuple[1]

	if cityName:
		city_id = name_dict[cityName]

	sql = "SELECT A.tid AS tid, A.name AS name, A.city_id AS cid,\
A.fields AS fields,A.modifier AS modifier, \
A.checked AS checked, A.finish AS finish, A.checkUser as checkWho, \
A.checkRemark as checkRemark, A.synState as synState, \
CAST( A.generTime AS CHAR) AS generTime, \
CAST( A.checkTime AS CHAR) AS checkTime, \
CAST( A.synTime AS CHAR) AS synTime, \
A.deadline as deadline, \
CAST( sum(CASE WHEN C.status = 1 THEN 1 ELSE 0 END) AS CHAR) as doneTask, \
count(*) as totalTask \
FROM attr_merge.task AS A INNER JOIN cityscenic.task_attr AS C ON A.tid = C.tid WHERE A.type = 2 AND 1 "

	condition = ''

	if taskName:
		if matchFlag == "mohu":
			condition += "AND A.name LIKE '%%%s%%' " % taskName
		else:
			condition += "AND A.name = '%s' " % taskName

	if taskID:
		condition += "AND A.tid IN (%s) " % to_query_string(taskID)
	
	if cityName:
		condition += "AND C.city_id IN (%s) " % to_query_string(city_id)
	
	if isCheck != "all":
		condition += "AND A.checked = '%s' " % isCheck
	
	if isSync !="all":
		condition += "AND A.synState = '%s' " % isSync

	if labelField:
		condition += "AND ( "
		# "AND (""a like '%s' or ""b like '%s' or "")"
		for i in labelField.split(','):
			condition += "A.fields LIKE '%%%s%%' AND " % i
		condition = condition[:-4]
		condition += ") "

	if annoWho:
		condition += "AND ( "
		for i in annoWho.split(','):
			condition += "A.modifier LIKE '%%%s%%' AND " % i
		condition = condition[:-4]
		condition += ") "
				
	if checkWho:
		condition += "AND A.checkUser IN (%s) " % to_query_string(checkWho)

	condition += " GROUP BY A.tid "

	if sortTag:
		condition += " ORDER BY A.%s %s " % (sortTag,sortOrder)

	sql += condition
	#print sql.encode('utf-8')
	
	try:
		result =  db_bi.fetch(sql)	
	except:
		return {"result":[],"status":"任务查询失败"}
	if not result or len(result)==0:
		return {"result":[],"status":"没有符合条件的任务"}

	result = result[:]
		
	for i in range(len(result)):
		if result[i]['cid']:
			result[i]['city'] = id_dict[ result[i]['cid'] ]['name']
			result[i]['country'] = id_dict[ result[i]['cid'] ]['country']
		if result[i]['modifier']:
			# 将id替换成对应的username
			tmp = ''
			for uid in result[i]['modifier'].encode('utf-8').split('|'):
				tmp += (user_dict[uid] + '|')
			if tmp:
				tmp = tmp[:-1]
			result[i]['modifier'] = tmp
		
	data = {}
	data = {"result":result,"status":"success"}
	return data

def attr_task_delete( request_data ):
	"""删除单个标注任务，或者批量删除标注任务
	"""
	# 用curl向BI系统打请求删除任务
	tids = request_data['tid[]']
	task_type = request_data['type'][0]
	for tid in tids:
		print tid
		#comm = 'curl -s -X POST -d "tid=%s&type=%s" "http://10.10.167.111/Api/DeleteMarkTask"' % (tid,task_type)
		url = "http://10.10.167.111/Api/DeleteMarkTask"
		post_data = "tid=%s&type=%s" % (tid,task_type)	
		status = post_by_curl(post_data,url)	
	if status:
		data = {"result":[],"status":"删除失败，请联系管理员"}
	else:
		data = {"result":[],"status":"success"}
	return data


def post_by_curl(post_data,url):
	import commands
	comm = 'curl -s -X POST -d "%s" "%s"' % (post_data,url)
	status,output = commands.getstatusoutput(comm)
	print '-- post result --'
	print "status:",status
	print "output:",output.encode('utf-8')
	return status

def attr_task_add( data = {} ):
	print '-'*10
	print data	
	#{'checkUser': [u'luozhen'], 'isTest': [u'0'], 'task': [u'test'], 'isMultiCity': [u'0'], 'checkRate': [u'10'], 'isMulti': [u'0'], 'items': [u'1'], 'ids': [u'v202456,v201363'], 'checkNum': [u'10'], 'deadline': [u'2016'], 'operator': [u'10']}
	
	task = data['task'][0]
	operator = data['operator'][0]
	items = str(data['items'][0])
	checkUser = str(data['checkUser'][0])
	checkRate = int(data['checkRate'][0])
	checkNum = int(data['checkNum'][0])
	deadline = str(data['deadline'][0])
	isTest = int(data['isTest'][0])
	isMulti = str(data['isMulti'][0])
	isMultiCity = str(data['isMultiCity'][0])
	#allPeople = getAllPeople()[0]	

	id_list = data['ids']
	operator_list = data['operator']
	ids = ','.join(id_list)
	operators = '|'.join(operator_list)

	print '--'*20
	city_dict = get_city_by_ids(ids)
	city_list = []
	for c in city_dict.items():
		city_list.append(c[0])
	
	url = "http://10.10.167.111/Api/CreateMarkTask"
	import urllib
	
	if isMulti == '0':
		# 不分城不分人
		if isMultiCity =='0':
			post_data = urllib.urlencode({
				"task":task,
				"type":2,
				"city_id":city_list[0],
				"operator":operator,
				"items":items,
				"ids":ids,
				"checkUser":checkUser,
				"deadline":deadline,
				"checkRate":checkRate,
				"checkNum":checkNum,
				"isTest":isTest
			})
			print post_data
			print post_by_curl(post_data,url)
		else:
			for city in city_list:
				post_data = urllib.urlencode({
					"task": city_dict[city]['name'].encode('utf-8')+'|'+task,
					"type":2,
					"city_id":city,
					"operator":operators,
					"items":items,
					"ids":ids,
					"checkUser":checkUser,
					"deadline":deadline,
					"checkRate":checkRate,
					"checkNum":checkNum,
					"isTest":isTest
				})
				print post_data
				print post_by_curl(post_data,url)
	else:
		# 分人不分城
		if isMultiCity =='0':
			for num in range(len(operator_list)):
				post_data = urllib.urlencode({
					"task":task,
					"type":2,
					"city_id":city_list[0],
					"operator":operator_list[num]+'|'+operators,
					"items":items,
					"ids":ids,
					"checkUser":checkUser,
					"deadline":deadline,
					"checkRate":checkRate,
					"checkNum":checkNum,
					"isTest":isTest
				})
				print post_data
				print post_by_curl(post_data,url)
					
		# 分人分城市
		else:
			for num in range(len(operator_list)):
				for city in city_list:
					post_data = urllib.urlencode({
						"task":city_dict[city]['name'].encode('utf-8')+'|'+task,
						"type":2,
						"city_id":city,
						"operator":operator_list[num]+'|'+operators,
						"items":items,
						"ids":ids,
						"checkUser":checkUser,
						"deadline":deadline,
						"checkRate":checkRate,
						"checkNum":checkNum,
						"isTest":isTest
					})
					print post_data
					print post_by_curl(post_data,url)
							

	return {"result":[],"status":"success"}
