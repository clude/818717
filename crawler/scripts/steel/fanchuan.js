
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=280; ++i)  {
    var url = sprintf('http://www.fanchuan.net/resource.html?cn=&bn=&sp=&ma=&ct=&fa=&wh=&md=2318&sort=30&status=1&count=20&pg=%d', i);
    configs[url] = {
      priority: i,
      validity: 10*60*1000
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
        var item = {
          url: 'http://www.fanchuan.net/' + td.eq(0).find('a').attr('href'),
          model: td.eq(0).text(),
          trademark: td.eq(1).text(),
          spec: td.eq(2).text(),
          price_raw: td.eq(3).text(),
          weight_raw: td.eq(4).text(),
          producer: td.eq(5).text(),
          warehouse: td.eq(7).text(),
          store_raw: '上海凡川物资贸易有限公司',
          cell_raw: td.eq(10).text(),
          source_raw: '凡川',
          source_uint: 3,
        };
        console.log(item);
        result.push(item);
      });
      return result;
    },
    process: process
  }
  parsers['fanchuan'] = parser;

})(url_configs, parsers);
