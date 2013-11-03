
from django.conf.urls import patterns, url

urlpatterns = patterns('indexer.views',
    url(r'^reindex/$', 'reindex'),
    url(r'^update/$', 'update'),
    url(r'^query/$', 'query'),
    url(r'^detail/(.*)', 'detail'),
    url(r'^store/(.*)', 'store'),
    url(r'^steel_detail/(.*)', 'steel_detail'),
    url(r'^similar_resources/(.*)', 'similar_resources'),
    url(r'^dashboard_models/', 'dashboard_models'),
)