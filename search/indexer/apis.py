#coding=utf-8

__version__ = '0.0.1'

import sphinxql
import redis
import json
import math
import services

SORT_MODES = {
    0: ('hit_count', 'DESC', 'MAX'), 
    1: ('time', 'DESC', 'MAX'),
    2: ('price_float', 'ASC', 'MIN'),
}

SORT_TIME_SECTION = 2 * 3600  #排序用， 设定时间范围，每两小时的数据为一个数据区间

SORT_WEIGHT_DEF = {  # 排序用， 设定排序权重
    # 1 - x/2y based on mysteel range
    # then (1-x/2y) / (x/2y) = max_one / current_one
    # then y/x = (1/2)(max_one / current_one) + 0.5
    0:  (1, 10000),  #511steel
    1:  (1, 1000),  #alibaba
    2:  (1, 19000),  #baostar
    3:  (1, 10000),  #fanchuan
    4:  (1, 10000),  #fdc
    5:  (1, 1600),  #mysteel
    6:  (1, 20000),  #opsteel
    7:  (1, 20000),  #steelabc
    8:  (1, 20000),  #steelhome
    9:  (1, 1000),  #usteel
    10: (1, 15000),  #xsy
    11: (1, 1000),  #zhaogang
}

class Searcher(object):

    def __init__(self, index, HOST='127.0.0.1', EXPIRE_TTL=60*60*24):
        super(Searcher, self).__init__()
        self.SPHINX_HOST = HOST
        self.rc = redis.Redis(HOST)
        self.index = index
        self.EXPIRE_TTL = EXPIRE_TTL

    def query(self, keyword, sort, start, count):
        ql = sphinxql.search(self.index, 'json')

        sort_key = 'sort_time_section DESC, sort_weight DESC'
        if sort:
            m = SORT_MODES[sort]
            sort_key = '%s %s'%(m[0], m[1])
        ql.keyword(keyword).sort(sort_key).limit(start, count)
        result = ql.run(self.SPHINX_HOST)        
        return result

    def detail(self, group):
        ql = sphinxql.search(self.index, 'json')
        ql.keyword(group).sort('price_float ASC').limit(0, 40)
        result = ql.run(self.SPHINX_HOST)
        return result

    def steel_detail(self, id):
        ql = sphinxql.search(self.index, 'json')
        ql.keyword(id).sort('price_float ASC').limit(0, 1)
        result = ql.run(self.SPHINX_HOST)
        return result

    def similar_resources(self, group):
        ql = sphinxql.search(self.index, 'json')
        ql.keyword(group).sort('price_float ASC').limit(0, 11)
        result = ql.run(self.SPHINX_HOST)
        return result

    def store(self, store_raw):
        ql = sphinxql.search(self.index, 'json')
        ql.keyword(store_raw).limit(0, 40)
        result = ql.run(self.SPHINX_HOST)
        return result

    def update(self, rows):
        insert_ql, replace_ql = sphinxql.insert(self.index), sphinxql.replace(self.index)
        insert_count, replace_count = 0, 0

        for row in rows:
            if not row: continue
            id_hash, full_hash, json = [row[_] for _ in ['id_hash', 'full_hash', 'json']]

            if self.rc.exists(id_hash):
                check_hash, check_hit, gid = self.rc.lrange(id_hash, 0, 2)
                if full_hash == check_hash: continue
                ql, hit_count = sphinxql.replace(self.index), int(check_hit)+1
                self.rc.lset(id_hash, 0, full_hash)
                self.rc.lset(id_hash, 1, hit_count)
                # no need for update id, because it's never changed.
                self.rc.lset(id_hash, 3, json)
                replace_count += 1
                #services.save_crawresult(True, row)
            else:
                ql, hit_count, gid = sphinxql.insert(self.index), 0, self.rc.incr('GLOBAL_ID')
                sort_weight = self.generate_random_sort_weight(row) #TODO: move it to crawer ?
                self.rc.rpush(id_hash, full_hash)
                self.rc.rpush(id_hash, 0)
                self.rc.rpush(id_hash, gid)
                self.rc.rpush(id_hash, json)
                self.rc.rpush(id_hash, sort_weight)
                row['id'] = gid
                insert_count += 1
                row['sort_weight'] = sort_weight
                row['sort_time_section'] = self.generate_sort_time_section(row)
                #services.save_crawresult(False, row)

            self.rc.expire(id_hash, self.EXPIRE_TTL)
            row['id'] = gid
            row['hit_count'] = hit_count
            sql = ql.add(row)
            try:
                sql.run()
            except:
                print 'error', sql.sql()

        print insert_count, replace_count
        return insert_count, replace_count

    def reindex(self, BATCH_COUNT=1):
        sphinxql.truncate(self.index).run()
        print 'rt truncated.'

        all_keys = self.rc.keys('id_*')
        print '%d rows in redis.'%len(all_keys)

        done = 0
        for page in range(int(math.ceil(float(len(all_keys))/BATCH_COUNT))):
            ql = sphinxql.insert(self.index)
            for key in all_keys[page*BATCH_COUNT:(page+1)*BATCH_COUNT]:
                try:
                    row = json.loads(self.rc.lindex(key, 3))
                    hit_count, gid = self.rc.lindex(key, 1), self.rc.incr('GLOBAL_ID')
                    row['id'] = gid
                    row['hit_count'] = hit_count
                    row['json'] = self.rc.lindex(key, 3)
                    row['sort_weight'] = self.rc.lindex(key, 4)
                    row['sort_time_section'] = self.generate_sort_time_section(row)
                    ql.add(row)
                    done += 1
                except:
                    print 'ADD error:',row['id'], row['id_hash'], row
            try:
                ql.run(self.SPHINX_HOST)
            except:
                print ql.sql()
                import traceback
                traceback.print_exc()
            print '%d / %d'%(done, len(all_keys))
        print 'finished.'
        return done

    def generate_dashboard_models(self, modellist = [], min_price = 2000.0):
        from models import DashboardModels

        for model in modellist:
            try:
                ql = sphinxql.search(self.index, 'json')
                ql.range( price_float = ( min_price, 999999.0) )
                ql.keyword(model).sort('sort_time_section DESC, price_float ASC').limit(0, 3)
                result = ql.run(self.SPHINX_HOST)

                dm = DashboardModels.objects(model=model).first()
                if dm:
                    dm.steels = result['result']
                    dm.save()
                else:
                    dm = DashboardModels()
                    dm.model = model;
                    dm.steels = result['result']
                    dm.save()
                #DashboardModels.objects(model=model).update_one(set__steels=result['result'])
            except Exception,e:
                print e;
                print 'gen dashboard model error:',model.encode('utf8')

        return True

    def generate_random_sort_weight(self, data):
        from random import randrange
        source_unit = data['source_uint']
        rd_range = SORT_WEIGHT_DEF[source_unit]
        sort_weight = randrange(rd_range[0], rd_range[1]);
        return sort_weight

    def generate_sort_time_section(self, data):
        return int(data['time']/1000.0/SORT_TIME_SECTION) * SORT_TIME_SECTION





