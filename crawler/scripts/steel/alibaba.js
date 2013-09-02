
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var categories_1 = [
    '53504843', '44433033', '44433034', 
    '53543134', '44433031', '485242333335',
    '73706363', '737063632D7364', '485042323335',
    '485242343030',
  ];

  var configs = {};
  categories_1.forEach(function(category) {
    for (var i=1; i<=100; ++i)  {
      var url = sprintf('http://s.1688.com/selloffer/-%s.html?earseDirect=false&button_click=top&pageSize=40&n=y&from=marketSearch&offset=3&beginPage=%d', category, i);
      configs[url] = {
        priority: i,
        validity: 60*60*1000
      };
    }
  });
  url_configs['alibaba'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      var result = [];
      $(content).find('#sw_maindata_asyncload').children('tr').each(function(index, row){
        var td = $(row).find('td');
        result.push({
          url: td.eq(0).find('a:first').attr('href'),
          model: td.eq(1).find('p').text(),
          trademark: td.eq(2).find('p').attr('title') ? td.eq(2).find('p').attr('title') : td.eq(2).find('p').text(),
          producer: td.eq(3).find('p').attr('title') ? td.eq(3).find('p').attr('title') : td.eq(3).find('p').text(),
          spec: td.eq(4).find('p').attr('title') ? td.eq(4).find('p').attr('title') : td.eq(4).find('p').text(),
          price: td.eq(5).find('p>span:last').text().trim(),
          store_name: td.eq(6).find('p:eq(0)>a').text().trim(),
          stock_location: td.eq(6).find('p:eq(1)').text().trim(),
          weight: '',
          phone_number: '',
          spider: '阿里巴巴',
          spider_float: 40,
        });
      });
      return result;
    },
    process: process
  }
  parsers['alibaba'] = parser;

})(url_configs, parsers);
