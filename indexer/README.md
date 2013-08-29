# 综合

* 修改sphinx源码加入中文分词，采用2.1.1版本(从官方下即可，千万不要用coreseek），将sphinx/src中的代码覆盖后重新编译即可。需要使用一个xdict来做中文字典
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

	1. rt: begin transection
	2. rt: truncate
	3. 对于redis[0]内的所有key，对value经过json解析以后按100行一个批次插入rt
	4. 重复3直到redis[0]读完
	5. end transection

# 本地安装配置

	1. 下载sphinx-2.1.1-beta.tar.gz(从google code)
	2. 下载xdict
	3. 将sphinx/src中的源文件覆盖
	4. ./configure && make && make install
	5. 建立目录 /var/sphinx
	6. 讲xdict和sphinx.conf拷入/var/sphinx
	7. 在/var/sphinx下searchd

# 服务器

root@203.166.177.153
