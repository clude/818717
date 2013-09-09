__author__ = 'zhuclude'

from mongoengine import Document
from bson import json_util

class BaseDocument(Document):
    meta = {
        'abstract': True,
        }

    def to_dict(self):
        return json_util._json_convert(self.to_mongo());