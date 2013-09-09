__author__ = 'zhuclude'

from mongoengine.fields import *
import datetime
from utils.mongo import BaseDocument


class Trace(BaseDocument):
    cookie_id = StringField(max_length=64)
    uid = StringField(max_length=64)
    type = StringField(max_length=32)
    func_name = StringField(max_length=64)
    func_content = StringField()
    ip = StringField()
    user_id = StringField(max_length=64)
    req_url = StringField()
    req_referer = StringField()
    agent = StringField()
    day = StringField()

    created_at = DateTimeField(default=datetime.datetime.now)


class Feedback(BaseDocument):
    user_name = StringField(max_length=64)
    user_id = ObjectIdField(required=False)
    feedback = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.now)


