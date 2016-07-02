# -*- coding: utf-8 -*-
from ..database import db_hotel

def query_hotel(data):
    hotel_id = data['hotel_ID']
    sql = "select *  from devdb.hotel limit 2"
    result = db_hotel.fetch(sql)
    data['result'] = result
    return data

