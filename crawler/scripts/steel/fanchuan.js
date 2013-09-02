
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=280; ++i)  {
    var url = sprintf('http://www.fanchuan.net/resource.html?cn=&bn=&sp=&ma=&ct=&fa=&wh=&md=2318&sort=30&status=1&count=20&pg=%d', i);
    configs[url] = {
      priority: i,
      validity: 60*60*1000
    };
  }
  url_configs['fanchuan'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      var result = [];
      $(content).find('#searchForm').siblings('table').find('tr').each(function(index, row){            
        var td = $(row).children('td');
        if (td.eq(3).text() == '')
          return;
        result.push({
          url: 'http://www.fanchuan.net/' + td.eq(0).find('a').attr('href'),
          model: td.eq(0).text(),
          trademark: td.eq(1).text(),
          spec: td.eq(2).text(),
          price: td.eq(3).text(),
          weight: td.eq(4).text(),
          producer: td.eq(5).text(),
          stock_location: td.eq(7).text(),
          store_name: '上海凡川物资贸易有限公司',
          phone_number: td.eq(10).text(),
          spider: '凡川',
          spider_float: 90,
        });
      });
      return result;
    },
    process: process
  }
  parsers['fanchuan'] = parser;

})(url_configs, parsers);
