模块说明
======

* crawl 爬虫
* indexer 索引
* search 搜索网站

代码获取
======

* 初始化

    1. Fork: https://github.com/konglingkai/818717
    2. git clone git@github.com:%username%/818717
    3. git remote add upstream git@github.com:konglingkai/818717

* 同步代码

    1. git fetch upstream
    2. git checkout master / git merge upstream/master
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