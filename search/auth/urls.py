__author__ = 'zhuclude'

from django.conf.urls import patterns, url

urlpatterns = patterns('auth.views',
           url(r'^login/$', 'api_login'),
           url(r'^logout/$', 'api_logout'),
           url(r'^register/', 'api_register'),
           url(r'^autheduser/', 'api_autheduser'),
           url(r'^feedback/$', 'api_feedback'),
)