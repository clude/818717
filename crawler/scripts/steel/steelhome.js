
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=800; ++i)  {
    var url = sprintf('http://www.steelhome.cn/biz/biz_search.php?view=search_xh&keyword=&search_action=search_xh&res_cz=&res_gga_1=&res_gga_2=&res_ggb_1=&res_ggb_2=&res_ggc_1=&res_ggc_2=&res_jhck=&res_jg_1=&res_jg_2=&res_companyname=&res_type=&area=&searchorder=&more_type=&page=%d', i);
    configs[url] = {
      priority: i,
      validity: 60*60*1000
    };
  }
  url_configs['steelhome'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      var result = [];
      $(content).find('#qiatan_table').find('tr:gt(0)').each(function(index, row){  
        if (index % 3 != 0) return;          
        var td = $(row).find('td');
        result.push({
          url: td.eq(1).find('a').attr('href'),
          model: td.eq(5).text(),
          trademark: td.eq(6).text(),
          spec: td.eq(7).text(),
          price: td.eq(8).text(),
          weight: td.eq(9).text(),
          producer: td.eq(10).text(),
          stock_location: td.eq(11).text(),
          store_name: td.eq(1).find('strong').text(),
          phone_number: td.eq(1).find('table').find('tr:eq(1)').text().trim().match(/[-\d]+/g).join(' '),
          spider: '钢之家',
          spider_float: 50,
        });
      });
      return result;
    },
    process: process
  }
  parsers['steelhome'] = parser;

})(url_configs, parsers);
