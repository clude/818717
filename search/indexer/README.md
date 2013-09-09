# 综合

* 使用实时索引，见sphinx RT index
* 整个搜索的查询和增删数据使用sphinx QL完成

#redis中的数据格式

    1. KEY: id_hash: TYPE: list, VALUES: [full_hash, hit_count, id, json]
    2. 定期以redis中的数据重建一次索引，以达到清理过期数据的作用
    3. GLOBAL_ID 用来每次 INCR 以成为sphinx搜索的主键

# 搜索
    1. 用sphinxql做的select查询，取json字段归并group后返回

# 更新数据

    1. redis中存在id_hash, 判断为旧数据更新
        a. full_hash一致，则是同一条数据，跳过到下一条
        b. full_hash不一致，rt操作为replace，hit_count++, 更新id_hash: [full_hash, hit_count++, id, json]
    2. 不存在id_hash, 为新数据，rt操作为insert, hit_count为0, redis中新增id_hash: [full_hash, 0, id, json]
    3. 重置id_hash的expire
    4. 批量处理replace和insert

# 索引重建

    1. rt: begin transection (未实现)
    2. rt: truncate
    3. 对于redis内的所有key id_*，对value经过json解析以后按100行一个批次插入rt
    5. end transection （为实现）
