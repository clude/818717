# encoding: utf-8
from django.views.decorators.csrf import csrf_exempt
import json
from utils.json_api import HttpResponseJson, JsonAPIResult
import services


#TODO: clude, add csrf checking later
@csrf_exempt
def api_fdc_buy(request):
    import urllib, httplib2, random, string, time
    from hashlib import sha1

    fdc_url = 'http://fdc.baostar.com/services/fdc/api-data-from-818717/'

    #TODO get from post
    post = json.loads(request.body);
    data = {
        'company_name': post.get('store_raw', '').encode('utf8'), #steel.store_name.encode('utf8'),
        'mobile': post.get('seller_cell', '').encode('utf8'), #seller_cell,
        'user_mobile': post.get('buyer_cell', '').encode('utf8'), #buyer_cell,
        'manufacturer': post.get('producer', '').encode('utf8'), #steel.producer.encode('utf8'),
        'warehouse_name': post.get('warehouse', '').encode('utf8'), #steel.stock_location.encode('utf8'),
        'product_name': post.get('model', '').encode('utf8'), #steel.model.encode('utf8'),
        'trademark': post.get('trademark', '').encode('utf8'), #steel.trademark.encode('utf8'),
        'spec': post.get('spec', '').encode('utf8'), #steel.spec.encode('utf8'),
        'weight': post.get('weight_float', 0.00), #steel.weight.encode('utf8'),
        'price': post.get('price_float', 0.00), #steel.price,
        }
    nonce = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
    timestamp = '%d' % int(time.time())
    pre_validate = ['dfw!2ae1eqDSFEdfaeqfDQ!@AZadfqqqfeqw@aae', timestamp, nonce]
    pre_validate.sort()
    signature = sha1(''.join(pre_validate)).hexdigest()
    data.update({
        'nonce': nonce,
        'timestamp': timestamp,
        'signature': signature
    })
    encoded_data = urllib.urlencode(data)
    h = httplib2.Http()
    res, content = h.request(fdc_url+'?'+encoded_data)
    return HttpResponseJson(content);
    #return json.loads(content)


def api_trace(request):
    from integration.models import Trace
    import datetime

    trc = Trace()
    trc.type = request.GET.get('type', '0')
    trc.func_name = request.GET.get('fn', '')
    trc.func_content = request.GET.get('fc', '')
    trc.cookie_id = request.COOKIES.get('sessionid', None)
    trc.uid = request.COOKIES.get('uid', None)
    trc.req_referer = request.META.get('HTTP_REFERER', None)
    trc.agent = request.META.get('HTTP_USER_AGENT', None)
    trc.req_url = request.build_absolute_uri()
    trc.day = datetime.datetime.now().strftime('%Y%m%d')
    if request.META.has_key('HTTP_X_FORWARDED_FOR'):
        trc.ip = request.META['HTTP_X_FORWARDED_FOR']
    else:
        trc.ip = request.META.get('REMOTE_ADDR', None)
    if request.user and request.user.is_authenticated():
        trc.user_id = str(request.user.pk)
    try:
        trc.save()
    except Exception:
        pass

    return HttpResponseJson('');

def api_rpt_pv(request):

    date_start = request.GET.get('ds', '')
    date_end = request.GET.get('de', '')

    #TODO pass date
    conditions = {
        "date_start": date_start,
        "date_end": date_end
    }

    rst = services.get_pv_rpt_by_day(conditions)

    return HttpResponseJson(JsonAPIResult(data = rst))


