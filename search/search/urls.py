from django.conf.urls import patterns, include, url
from django.shortcuts import render_to_response

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'search.views.home', name='home'),
    # url(r'^search/', include('search.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^search/', include('indexer.urls')),
    url(r'^', lambda req: render_to_response('index.html')),
)
