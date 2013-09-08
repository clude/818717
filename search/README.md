# 系统架构

## 后台

* 网站: python + django
* 关系数据库: mysql, 放数据统计表（API调用统计）
* nosql数据库: mongodb, 放网站数据
* 缓存: redis，缓存各类json

## 前台

* html: index.html, index_local.html(django模板提供) + partial html (angularjs动态加载)
* js: angularjs + ui-bootstrap
* css: bootstrap + less

