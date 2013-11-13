#coding=utf-8

"""
SphinxQL python wrapper
http://sphinxsearch.com/docs/2.1.1/sphinxql-reference.html
注意: 不需要安装mysql-server, sphinx的searchd进程会假装自己是mysql
"""

import MySQLdb
import json, time, datetime

RESERVED_KEYWORDS = (
    'AND', 'AGENT', 'AS', 'ASC', 'AVG', 'BEGIN', 'BETWEEN', 'BY', 'CALL', 'COLLATION', 'COMMIT', 'COUNT', 'DELETE',
    'DESC', 'DESCRIBE', 'DISTINCT', 'FALSE', 'FROM', 'GLOBAL', 'GROUP', 'IN', 'INSERT', 'INTO', 'LIMIT', 'MATCH', 'MAX',
    'META', 'MIN', 'NOT', 'NULL', 'OPTION', 'OR', 'ORDER', 'REPLACE', 'ROLLBACK', 'SELECT', 'SET', 'SHOW', 'START', 'STATUS',
    'SUM', 'TABLES', 'TRANSACTION', 'TRUE', 'UPDATE', 'VALUES', 'VARIABLES', 'WARNINGS', 'WEIGHT', 'WHERE', 'WITHIN'
)

kw_encode = lambda k: str(k) if str(k).upper() not in RESERVED_KEYWORDS else '_' + str(k)

def value_encode(v):
    if v == None: return "''"
    if isinstance(v, datetime.date) or isinstance(v, datetime.datetime):
        return time.strftime("'%Y%m%d%H%M%S'", v.timetuple())
    if isinstance(v, unicode):
        return "'%s'"%v.replace("'", " ").encode('utf8')
    if isinstance(v, str):
        return "'%s'"%v.replace("'", " ")
    return json.dumps(v)

class SphinxQL(object):

    def run(self, host='127.0.0.1', port=9217):
        return execute(self.sql(), host, port)

class search(SphinxQL):

    def __init__(self, index, *args):
        super(search, self).__init__()
        self.select_args = args if args else ['*']
        self.from_arg = index
        self.where_args = []
        self.group_by_arg = ''
        self.order_by_args = []
        self.limit_arg = ''

    def filter(self, **kwargs):
        for field, v in kwargs.iteritems(): self.where_args.append('%s = %s'%(kw_encode(field), value_encode(v)))
        return self

    def range(self, **kwargs):
        for field, (v1, v2) in kwargs.iteritems(): self.where_args.append('%s BETWEEN %f AND %f'%(kw_encode(field), v1, v2))
        return self

    def keyword(self, *keywords):
        self.where_args.append("MATCH('%s')"%(' '.join([_.encode('utf8') if isinstance(_, unicode) else _ for _ in keywords])))
        return self

    def group(self, field):
        self.group_by_arg = field
        return self

    def sort(self, sort):
        self.order_by_args.append(sort)
        return self

    def limit(self, start, count):
        self.limit_arg = '%d, %d'%(start, count)
        return self

    def sql(self):
        sql = 'SELECT %s FROM %s'%(', '.join(self.select_args), self.from_arg)
        if self.where_args: sql += ' WHERE %s'%(' AND '.join(self.where_args))
        if self.group_by_arg: sql += ' GROUP BY %s'%(self.group_by_arg)
        if self.order_by_args: sql += ' ORDER BY %s'%(', '.join(self.order_by_args))
        if self.limit_arg: sql += ' LIMIT %s'%(self.limit_arg)
        return sql

class truncate(SphinxQL):

    def __init__(self, index):
        super(truncate, self).__init__()
        self.index = index

    def sql(self):
        return 'TRUNCATE RTINDEX %s'%self.index

class delete(SphinxQL):

    def __init__(self, index):
        super(delete, self).__init__()
        self.index = index
        self.id_list = []

    def by_id(self, object_id):
        self.id_list.append(object_id)
        return self

    def sql(self):
        if not self.id_list: raise Exception('SphinxQL[DELETE]: no id')
        if len(self.id_list) == 1:
            where = 'id = %d'%self.index
        else:
            where = 'id IN (%s)'%(', '.join(self.id_list))
        return 'DELETE FROM %s WHERE %s'%(self.index, where)

class insert(SphinxQL):

    def __init__(self, index):
        super(insert, self).__init__()
        self.index = index
        self.columns = []
        self.values = []
        self.verb = 'INSERT'

    def add(self, row_dict):
        columns = [kw_encode(_) for _ in row_dict.keys()]
        if not self.columns: self.columns = columns
        elif self.columns != columns: raise Exception('SphinxQL[INSERT]: different columns: self-%s, input: %s'%(self.columns, columns))

        values = [value_encode(_) for _ in row_dict.values()]
        self.values.append('(%s)'%(', '.join(values)))
        return self

    def sql(self):
        if not self.columns: raise Exception('SphinxQL[INSERT]: no columns')
        return '%s INTO %s (%s) VALUES %s'%(self.verb, str(self.index), ', '.join(self.columns), ', '.join(self.values))

class replace(insert):

    def __init__(self, index):
        super(replace, self).__init__(index)
        self.verb = 'REPLACE'

def execute(sphinx_ql, host='127.0.0.1', port=9217):
    # 由于 SHOW META 作用于当前connection上，为保证每次返回的meta独立，需要每次查询都建立一个独立的connection
    with MySQLdb.connect(host=host, port=port) as cursor: 
        cursor.execute('SET NAMES utf-8')
        sql = sphinx_ql if isinstance(sphinx_ql, str) or isinstance(sphinx_ql, unicode) else sphinx_ql.sql()
        cursor.execute(sql)
        result = cursor.fetchall()
        cursor.execute('SHOW META')
        meta = cursor.fetchall()
        return {
            'result': result,
            'meta': meta
        }