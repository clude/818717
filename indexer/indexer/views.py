
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import apis
import json

def reindex(request):
	searcher = apis.Searcher('steel_package', settings.INDEX_SERVER)
	result = searcher.reindex()
	return HttpResponse(result)

@csrf_exempt
def update(request):
	searcher = apis.Searcher('steel_package', settings.INDEX_SERVER)
	rows = json.loads(request.body)
	result = searcher.update(rows)
	print result
	return HttpResponse(result)

def query(request, keyword):
	searcher = apis.Searcher('steel_package', settings.INDEX_SERVER)
	result = searcher.query(keyword)
	return HttpResponse(json.dumps(result), 'application/json')