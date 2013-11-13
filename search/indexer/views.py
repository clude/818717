# encoding: utf-8
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import apis
import json, gzip, tempfile, os

INDEX = 'steel_package'
PAGE_SIZE = 20

json_result = lambda result: HttpResponse(json.dumps(result), 'application/json')

def reindex(request):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.reindex()
    return HttpResponse(result)

@csrf_exempt
def update(request):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    temp_file.write(request.body)
    temp_file.close()
    data = gzip.open(temp_file.name).read()
    rows = json.loads(data)
    os.unlink(temp_file.name)
    result = searcher.update(rows)
    return HttpResponse(0)

def query(request):
    keyword = request.GET.get('query', '')
    page = int(request.GET.get('page', '0'))
    sort = int(request.GET.get('sort', '0'))
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.query(keyword, sort, page*PAGE_SIZE, PAGE_SIZE)
    return json_result(result)

def detail(request, group):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.detail(group)
    return json_result(result)

def store(request, store_raw):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.store(store_raw)
    return json_result(result)

def steel_detail(request, id):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.steel_detail(id)
    return json_result(result)

def similar_resources(request, group):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.similar_resources(group)
    return json_result(result)

def dashboard_models(request):
    from models import DashboardModels
    result = DashboardModels.objects.all().to_json();
    return json_result(result)

