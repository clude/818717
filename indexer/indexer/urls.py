
from django.conf.urls import patterns, url

urlpatterns = patterns('indexer.views',
    url(r'^reindex/$', 'reindex'),
    url(r'^update/$', 'update'),
    url(r'^query/(\S+)/$', 'query'),
)