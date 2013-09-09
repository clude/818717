from django.shortcuts import render_to_response
import uuid

def index(request):
    rsp = render_to_response('index.html')

    # check the cookie for the user, for tracing purpose, if user do not have a uid, we generate one for him
    uid = request.COOKIES.get('uid', None);
    if not uid:
        rsp.set_cookie('uid',str(uuid.uuid1()))

    return rsp

