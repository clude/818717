# 综合

* 修改sphinx源码加入中文分词，采用2.1.1版本(从官方下即可，千万不要用coreseek），将sphinx/src中的代码覆盖后重新编译即可。需要使用一个xdict来做中文字典
* 使用实时索引，见sphinx RT index
* 整个搜索的查询和增删数据使用sphinx QL完成

# 搜索
	1. 用sphinxql做的select查询，取json字段归并group后返回

#redis中的数据格式

    1. redis[0] 以 hash - json 的方式保存索引数据，查询0号库可以得知资源是否已经在索引中
    2. redis[1] 以 id_hash - full_hash 的方式存放，查询1号库可以得知是否应该insert还是replace
    3. 定期以redis中的数据重建一次索引，以达到清理过期数据的作用

# 抓取数据处理

	1. 对于一批抓取数据，每行去hash，在redis[0] 中查找 key是否存在，如存在，则剔除
	2. 对于剩下的数据，在redis[1]中，查找key是否存在，如存在，进replace队列，如不存在，进insert队列
	3. 对于insert队列，rt中做insert，redis[0]中新增，redis[1]中新增
	4. 对于replace队列，rt中做replace，redis[0]中新增，redis[1]中更新，并在redis[0]中删除旧值

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
