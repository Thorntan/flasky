# -*- coding: utf-8 -*-
import sys
import MySQLdb
from MySQLdb.cursors import DictCursor

reload(sys)
sys.setdefaultencoding('utf-8')


class DataBase:


    def __init__(self, host, port, db, user, passwd):
        self.host = host
        self.port = port
        self.user = user
        self.passwd = passwd
        self.db = db

    def __get_connection(self):
        conn = MySQLdb.connect(host=self.host, port=self.port, user=self.user, passwd=self.passwd, db=self.db, charset="utf8")
        return conn

    def execute(self, sql, args=None):
        ret = 0
        try:
            conn = self.__get_connection()
            cur = conn.cursor()
            ret = cur.execute(sql, args)
            conn.commit()
            cur.close()
            conn.close()
        except MySQLdb.Error, e:
            print("ExecuteSQL error: %s" % str(e))
            return False
        return ret

    def executemany(self, sql, args=None):
        ret = 0
        try:
            conn = self.__get_connection()
            cur = conn.cursor()
            ret = cur.executemany(sql, args)
            conn.commit()
            cur.close()
        except MySQLdb.Error, e:
            print("ExecuteSQLs error: %s" % str(e))
            return False
        return ret

    def fetch(self, sql, args=None, size=None):
        results = []
        try:
            conn = self.__get_connection()
            cur = conn.cursor(cursorclass=DictCursor)
            cur.execute(sql, args)
            rs = cur.fetchall()
            cur.close()
            for row in rs:
                results.append(row)
        except MySQLdb.Error, e:
            print("QueryBySQL error: %s" % str(e))
            return None
        return results

db_merge = DataBase(host="localhost", port=3306, db="", user="reader", passwd="miaoji1109")
db_gc = DataBase(host="10.10.149.172", port=3306, db="", user="reader", passwd="miaoji1109")
db_bi = DataBase(host="10.10.167.111", port=3306, db="", user="reader", passwd="miaoji1109")
db_zl = DataBase(host="10.10.111.62", port=3306, db="base_data", user="reader", passwd="miaoji1109")
db_hotel = DataBase(host="10.10.87.87", port=3306, db="devdb", user="reader", passwd="miaoji1109")

db_dev = DataBase(host="10.10.87.87", port=3306, db="devdb", user="reader", passwd="miaoji1109")
db_test = DataBase(host="10.10.87.87", port=3306, db="onlinedb", user="reader", passwd="miaoji1109")
