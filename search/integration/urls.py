__author__ = 'zhuclude'

from django.conf.urls import patterns, url

urlpatterns = patterns('integration.views',
    url(r'^fdc_buy/$', 'api_fdc_buy'),
    url(r'^trace/$', 'api_trace'),
    url(r'^correct_error/$', 'api_correct_error'),
    url(r'^rpt_pv/$', 'api_rpt_pv'),
)