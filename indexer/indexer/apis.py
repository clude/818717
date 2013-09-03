#coding=utf-8

__version__ = '0.0.1'

import sphinxql
import redis
import json
import math

class Searcher(object):

    def __init__(self, index, HOST='127.0.0.1', EXPIRE_TTL=60*60*24):
        super(Searcher, self).__init__()
        self.SPHINX_HOST = HOST
        self.rc = redis.Redis(HOST)
        self.index = index
        self.EXPIRE_TTL = EXPIRE_TTL

    def query(self, keyword='', sort='', start=0, limit=20):
        ql = sphinxql.search(self.index, 'json')
        if keyword: ql.keyword(keyword)
        if sort: ql.sort(sort)
        ql.limit(start, limit)
        result = ql.run(self.SPHINX_HOST)
        return result

    def update(self, rows):
        insert_ql, replace_ql = sphinxql.insert(self.index), sphinxql.replace(self.index)
        insert_count, replace_count = 0, 0
        for row in rows:
            id_hash, full_hash, json = [row[_] for _ in ['id_hash', 'full_hash', 'json']]

            if self.rc.exists(id_hash):
                check_hash, check_hit, gid = self.rc.lrange(id_hash, 0, 2)
                if full_hash == check_hash: continue
                ql, hit_count = replace_ql, int(check_hit)+1
                self.rc.lset(id_hash, 0, full_hash)
                self.rc.lset(id_hash, 1, hit_count)
                # no need for update id, because it's never changed.
                self.rc.lset(id_hash, 3, json)
                replace_count += 1
            else:
                ql, hit_count, gid = insert_ql, 0, self.rc.incr('GLOBAL_ID')
                self.rc.rpush(id_hash, full_hash)
                self.rc.rpush(id_hash, 0)
                self.rc.rpush(id_hash, gid)
                self.rc.rpush(id_hash, json)
                row['id'] = gid
                insert_count += 1

            self.rc.expire(id_hash, self.EXPIRE_TTL)
            row['id'] = gid
            row['hit_count'] = hit_count
            ql.add(row)

        if insert_count: insert_ql.run(self.SPHINX_HOST)
        if replace_count: replace_ql.run(self.SPHINX_HOST)
        return insert_count, replace_count

    def reindex(self, BATCH_COUNT=50):
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
                    ql.add(row)
                except:
                    pass
                done += 1
            try:
                ql.run(self.SPHINX_HOST)
            except:
                pass
            print '%d / %d'%(done, len(all_keys))
        print 'finished.'
        return done

