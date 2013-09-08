安装
======

* 准备工作

    1. 安装 nodejs, redis, python, pip, mysql client, redis
    2. npm install
    3. npm install -g grunt-cli
    4. 部署环境下，需要再安装：pip install supervisor, nginx

* Grunt命令

    1. install_sphinx: 安装sphinx搜索引擎
    2. package: 安装nodejs和python的类库
    3. compile: 将网站和配置文件压缩和编译
    4. testbuild: 测试编译后的代码(localhost:9001)
    5. run: 直接运行本地网站(localhost:9001)
    6. init_config: 部署环境初始化(需先手工配置好supervisor (配置在build/conf/supervisord.conf中)
    7. confg_sphinx: 重新配置sphinx(修改字段后)
    8. restart: 编译并重启网站(部署环境)
    9. restart_sphinx: 重启sphinx并从redis重导入索引
    10. restart_crawler: 重启爬虫服务器

代码获取
======

* 初始化

    1. Fork: https://github.com/konglingkai/818717
    2. git clone git@github.com:%username%/818717
    3. git remote add upstream git@github.com:konglingkai/818717

* 同步代码

    1. git fetch upstream
    2. git checkout master; git merge upstream/master
    3. git checkout %working_branch%
    4. git rebase / merge master
    5. resolve conflit and commit

* 开始新任务

    1. git checkout master
    2. 同步代码
    3. git checkout -b %working_branch%

* 发布代码

    1. git push origin %working_branch%
    2. PULL REQUEST