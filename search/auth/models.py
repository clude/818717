__author__ = 'zhuclude'

from mongoengine.fields import *
import datetime
import json
import hashlib
from bson.objectid import ObjectId
from utils.mongo import BaseDocument
from mongoengine.django.auth import User as MongoAuthUser


class User(MongoAuthUser):

    cell = StringField(max_length=32, required=False)

    #TODO define the out put user object
    def to_dict(self):
        return {
            'id': str(self.pk),
            'username': self.username,
            'cell': self.username
        }


class Member(BaseDocument):
    name = StringField(max_length=64, required=True)
    password = StringField(max_length=128, required=True)
    phone = StringField(max_length=32, required=False)
    im = StringField(max_length=32, required=False)
    email = StringField(max_length=32, required=False)
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)


class Feedback(BaseDocument):
    user_name = StringField(max_length=64)
    user_id = ObjectIdField(required=False)
    feedback = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.now)
