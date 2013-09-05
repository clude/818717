
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import apis
import json

INDEX = 'steel_package'
PAGE_SIZE = 20

def reindex(request):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.reindex()
    return HttpResponse(result)

@csrf_exempt
def update(request):
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    rows = json.loads(request.body)
    result = searcher.update(rows)
    return HttpResponse(result)

def query(request):
    keyword = request.GET.get('query', '')
    page = int(request.GET.get('page', '0'))
    sort = int(request.GET.get('sort', '0'))
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.query(keyword, sort, page*PAGE_SIZE, PAGE_SIZE)
    return HttpResponse(json.dumps(result), 'application/json')

def detail(request, group_hash):
    keyword = request.GET.get('query', '')
    sort = int(request.GET.get('sort', '0'))
    searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
    result = searcher.detail(group_hash, keyword, sort)
    return HttpResponse(json.dumps(result), 'application/json')