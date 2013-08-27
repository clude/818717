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

* 发布模式中
    1. 用grunt-recess编译前端的css => 818717xxxxx.css (xxxx为文件系统hash)
    2. 用grunt-html2js编译partials，用grunt-uglify压缩和编译js => 818717xxxx.js (xxxxx为文件系统hash)
    3. 拷贝lib和assets下的内容
    3. 合成index.html

## 数据接口

* restpy (使用@api提供接口)
* 开发模式中，接口的调用使用jsonp形式，可以使用远程服务器进行前台开发，发布模式中，接口调用采用post形式

## 发布/开发模式

* 用 <code>settings.RELEASE = True / False </code> 转换
* 使用 <code> grunt release </code> 发布

# 开发

    1. 安装python包 <code>pip install -r requirements.txt </code>

# 服务器

## 生产服务器

* 服务器地址 root@203.166.177.116 / 密码为通用密码
* 代码地址 /var/www/_818717/search
* 重启服务器 supervisorctl restart all

## 测试服务器

无