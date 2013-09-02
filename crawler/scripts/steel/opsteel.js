
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=1400; ++i)  {
    var url = sprintf('http://www.opsteel.cn/resource/%d.html?order=4&dateSearch=2', i);
    configs[url] = {
      priority: i,
      validity: 60*60*1000
    };
  }
  url_configs['opsteel'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      var result = [];
      $(content).find('#result-bd').find('tr:gt(0)').each(function(index, row){
        var td = $(row).find('td');
        result.push({
          url: 'http://www.opsteel.cn'+td.eq(1).find('a').attr('href'),
          model: td.eq(1).find('a').text(),
          trademark: td.eq(3).text(),
          spec: td.eq(2).text(),
          producer: td.eq(4).text(),
          price: td.eq(5).find('span').text(),
          weight: td.eq(6).find('p:eq(0)').text(),
          stock_location: td.eq(7).text(),
          store_name: $(row).find('a.comp-name').text(),
          phone_number: $(row).find('em').eq(1).text(),
          spider: '欧浦',
          spider_float: 60,
        });
      });
      return result;
    },
    process: process
  }
  parsers['opsteel'] = parser;

})(url_configs, parsers);
