from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from indexer import apis

INDEX = 'steel_package'

class Command(BaseCommand):
    help = 'rebuild sphinx index using values remained in redis.'

    def handle(self, *args, **options):
        searcher = apis.Searcher(INDEX, settings.INDEX_SERVER)
        result = searcher.reindex()
        self.stdout.write('%d'%result)
