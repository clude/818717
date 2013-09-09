# encoding: utf-8
from django.views.decorators.csrf import csrf_exempt
from utils.json_api import HttpResponseJson, JsonAPIResult
from django.contrib.auth import login as auth_login
from django.contrib.auth import authenticate
from auth.models import User


def api_login(request):
    credential = request.GET.get('credential', None)
    password = request.GET.get('password', None)

    u = authenticate(username=credential, password=password)
    if u:
        auth_login(request, u)
        rst = JsonAPIResult(data = u.to_dict())
    else:
        rst = JsonAPIResult(status = 0, message = u'手机号或密码错误')

    return HttpResponseJson(rst)


def api_register(request):
    credential = request.GET.get('credential', None)
    password = request.GET.get('password', None)

    u = User.objects(username=credential).first();
    if u:
        rst = JsonAPIResult(status = 0, message = u'此手机号已存在，不能注册')
        return HttpResponseJson(rst)
    else:
        User.create_user(credential, password, None)
        u = authenticate(username=credential, password=password)
        auth_login(request, u);
        return HttpResponseJson(JsonAPIResult(data=u.to_dict()))


def api_logout(request):
    from django.contrib.auth import logout as auth_logout
    auth_logout(request)
    return HttpResponseJson(JsonAPIResult(data = None))


def api_autheduser(request):
    """ get authed user from session,
    this method should be directly called at backend in the future """
    if request.user and request.user.is_authenticated():
        return HttpResponseJson(JsonAPIResult(data = request.user.to_dict()))
    else:
        return HttpResponseJson(JsonAPIResult(data = None))


def api_feedback(request):
    from auth.models import Feedback

    fbTxt = request.GET.get('fb', None)

    mUserId = None;
    mUserName = None;
    if request.user and request.user.is_authenticated():
        mUserId = request.user.pk
        mUserName = request.user.username

    fb = Feedback(user_name=mUserName, user_id=mUserId, feedback=fbTxt)
    fb.save()
    return HttpResponseJson(JsonAPIResult(data = None))


