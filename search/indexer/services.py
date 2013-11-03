__author__ = 'zhuclude'

from indexer.models import CrawResult

def save_crawresult(isUpdate, data):
    try:
        if not isUpdate:
            #cr = CrawResult(id_hash=data['id_hash'], full_hash=data['full_hash'], store_raw=data['store_raw'])
            cr = CrawResult(**data)
            cr.id = None;
            cr.save()
        else:
            CrawResult.objects(id_hash=data['id_hash']).update(set__store_raw=data['store_raw'])
    except Exception,e:
        print 'Logo row to mongo error:', data['id_hash'], data
        print e

    return True
