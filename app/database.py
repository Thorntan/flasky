# -*- coding: utf-8 -*-
import sys
import MySQLdb
from MySQLdb.cursors import DictCursor

reload(sys)
sys.setdefaultencoding('utf-8')


class DataBase:

    host = ''
    port = ''
    user = ''
    passwd = ''
    db = ''

    def __int__(self, host, port, db, user, passwd):
        self.host = host
        self.port = port
        self.user = user
        self.passwd = passwd
        self.db = db

    def __get_connection(self):
        conn = MySQLdb.connect(host=self.host, port=self.port, user=self.user, passwd=self.pwd, db=self.db,
                               charset="utf8")
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
            cur.close()
        except MySQLdb.Error, e:
            print("ExecuteSQLs error: %s" % str(e))
            return False
        return ret

    def fetch(sql, args=None, size=None):
        results = []
        try:
            conn = self.__get_connection()
            cur = conn.cursor(cursorclass=DictCursor)
            cur.execute(sql, args)
            rs = cur.fetchall()
            for row in rs:
                results.append(row)
        except MySQLdb.Error, e:
            print("QueryBySQL error: %s" % str(e))
            return None
        finally:
            cur.close()
        return results
