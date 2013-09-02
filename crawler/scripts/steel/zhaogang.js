
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=5500; ++i)  {
    var url = sprintf('http://www.zhaogang.com/spot/?page=%d', i);
    configs[url] = {
      priority: i,
      validity: 60*60*1000
    };
  }
  url_configs['zhaogang'] = configs;

  var parser = {
    download: $.get,
    parse: function(url, content)  {
      var result = [];
      var rows = $(content).find('.table').find('tr');
      for (var i=0; i<(rows.length/2 - 1); ++i) {
        var row1 = $(rows[i*2+1]).find('td')
          , row2 = $(rows[i*2+2]).find('span').eq(2).text()
          , item = {
            model: row1.eq(0).find('a').text(),
            spec: row1.eq(1).text(),
            trademark: row1.eq(2).text(),
            url: url,
            producer: row1.eq(3).text(),
            stock_location: row1.eq(4).text(),
            weight: row1.eq(5).text(),
            price: row1.eq(6).text(),
            store_name: row1.eq(7).tex,
            phone_number: row2,
            spider: '找钢网',
            spider_float: 50,
        };
        result.push(item);
      }
      return result;        
    },
    process: process
  }
  parsers['zhaogang'] = parser;

})(url_configs, parsers);
