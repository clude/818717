__author__ = 'zhuclude'
import json
from django.http import HttpResponse

class HttpResponseJson(HttpResponse):
    def __init__(self, content=None, *args, **kwargs):
        super(HttpResponseJson, self).__init__(*args, **kwargs)

        if isinstance(content, JsonAPIResult):
            self.content = content.to_json()
        else:
            self.content = content

        self['content-type'] = "application/json"


class JsonAPIResult:
    def __init__(self, status=1, message='', data=None):
        self.status = status
        self.message = message
        self.data = data

    def to_json(self):
        return json.dumps(self.__dict__)

