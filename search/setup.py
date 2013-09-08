import os
from setuptools import setup

def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name = "indexer",
    version = "0.0.1",
    author = "Kong Lingkai",
    author_email = "reindexer@gmail.com",
    description = ("indexer for 818717"), 
    packages=['indexer', 'indexer.management', 'indexer.management.commands'],
    long_description=read('README.md'),
)
