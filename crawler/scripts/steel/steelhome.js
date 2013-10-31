
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};

  var url = 'http://www.steelhome.cn/biz/xh.html';
  configs[url] = {
    priority: 1,
    validity: 1*60*1000
  };

  url_configs['steelhome'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      console.log('1');
      var result = [];
      $(content).find('#xhzy').find('tr:gt(0)').each(function(index, row){  
        if (index % 3 != 0) return;          
        var td = $(row).find('td');
        var cell = td.eq(1).find('table').find('tr:eq(1)').text().trim().match(/[-\d]+/g)
        var item = {
          url: td.eq(1).find('a').attr('href'),
          model: td.eq(5).text().trim(),
          trademark: td.eq(6).text().trim(),
          spec: td.eq(7).text().trim(),
          price_raw: td.eq(8).text().trim(),
          weight_raw: td.eq(9).text().trim(),
          producer: td.eq(10).text().trim(),
          warehouse: td.eq(11).text().trim(),
          store_raw: td.eq(1).find('strong').text().trim(),
          cell_raw: cell ? cell.join(' ') : '',
          source_raw: '钢之家',
          source_uint: 8,
        }
        console.log(item);
        result.push(item);
      });
      return result;
    },
    process: process
  }
  parsers['steelhome'] = parser;

})(url_configs, parsers);
