from django.conf.urls import patterns, include, url
from django.shortcuts import render_to_response
from django.views.generic import RedirectView

urlpatterns = patterns('',
    url(r'^search/', include('indexer.urls')),
    #url(r'^$', lambda req: render_to_response('index.html')),
    url(r'^sc/$', 'search.views.index'),
    url(r'^$', 'search.views.index'),
)

urlpatterns += patterns('',
    url(r'^api/auth/', include('auth.urls')),
    url(r'^api/integration/', include('integration.urls')),
)

# keep below urlpattern at the end, for fixing angularJS html5Mode issue
urlpatterns += patterns('',
    url(r'^', 'search.views.index'),
)
