# -*- coding: utf-8 -*-
import sys
import MySQLdb
from MySQLdb.cursors import DictCursor

reload(sys)
sys.setdefaultencoding('utf-8')

MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
MYSQL_USER = 'root'
MYSQL_PWD = 'admin'
MYSQL_DB ='yanlihua'


def GetConnection():
    conn = MySQLdb.connect(host=MYSQL_HOST, user=MYSQL_USER, passwd=MYSQL_PWD, db=MYSQL_DB, charset="utf8")
    return conn


def ExecuteSQL(sql, args = None):
    ret = 0
    try:
        conn = GetConnection()
        cur = conn.cursor()

        ret = cur.execute(sql, args)
        conn.commit()
        cur.close()
        conn.close()
    except MySQLdb.Error, e:
        print("ExecuteSQL error: %s" % str(e))
        return False
    return ret


def ExecuteSQLs(sql, args = None):
    ret = 0
    try:
        conn = GetConnection()
        cur = conn.cursor()

        ret = cur.executemany(sql, args)
        conn.commit()
        cur.close()
        cur.close()
    except MySQLdb.Error, e:
        print("ExecuteSQLs error: %s" %str(e))
        return False
    return ret


def QueryBySQL(sql, args = None, size = None):
    results = []
    try:
        conn = GetConnection()
        cur = conn.cursor(cursorclass = DictCursor)

        cur.execute(sql, args)
        rs = cur.fetchall()
        for row in rs :
            results.append(row)
    except MySQLdb.Error, e:
        print("QueryBySQL error: %s" %str(e))
        return None
    finally:
        cur.close()

    return results

