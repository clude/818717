__author__ = 'zhuclude'

from mongoengine.fields import *
import datetime
from utils.mongo import BaseDocument


class CrawResult(BaseDocument):
    # source data
    url = StringField()
    model = StringField()
    trademark = StringField()
    spec = StringField()
    warehouse = StringField()
    producer = StringField()
    store_raw = StringField()
    price_raw = StringField()
    weight_raw = StringField()
    source_raw = StringField()
    source_uint = IntField()
    cell_raw = StringField()

    extended = StringField()
    width = FloatField()
    thick = FloatField();
    group_hash = StringField()
    json = StringField()
    time = DateTimeField(default=datetime.datetime.now)
    price_float = FloatField()
    weight_float = FloatField()
    cell_uint = IntField()
    id_hash = StringField()
    full_hash = StringField()

    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)


class DashboardModels(BaseDocument):
    model = StringField()
    steels = ListField()





