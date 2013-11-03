# encoding: utf-8

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from indexer import apis
from optparse import make_option

INDEX = 'steel_package'
PAGE_SIZE = 100

class Command(BaseCommand):
    help = 'generate dashboard models'

    def handle(self, *args, **options):
        #modellist = [u'Q235']
        modellist = [u'热轧',u'冷轧',u'热镀锌',u'酸洗',u'取向电工钢',u'无取向电工钢',u'电镀锌',u'彩涂',u'镀锌',u'镀铝锌',u'轧硬卷',u'镀铬']
        searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
        result = searcher.generate_dashboard_models(modellist)
        print result

    