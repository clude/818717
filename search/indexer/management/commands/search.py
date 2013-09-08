from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from indexer import apis
from optparse import make_option

INDEX = 'steel_package'
PAGE_SIZE = 100

class Command(BaseCommand):
    args = '<keyword keyword ...>'
    help = 'search sphinxrt'

    def handle(self, *args, **options):
        keyword = ' '.join(args)
        page, sort = 0, 0
        searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
        result = searcher.query(keyword, sort, page*PAGE_SIZE, PAGE_SIZE)
        print result
    