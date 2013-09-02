
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=0; i<=500; ++i)  {
    var url = sprintf('http://www.shgt.com/api/general_search?mode=package&page=%d&query=&search=&sfregion=&shop=&sort=', i);
    configs[url] = {
      priority: i,
      validity: 60*60*1000
    };
  }
  url_configs['fdc'] = configs;

  var parser = {
    download: $.get,
    parse: function(url, content)  {
      var result = [];
      JSON.parse(content).result.forEach(function(row)  {
        result.push({
          'url': sprintf('http://www.shgt.com/package/%s/%s', row.provider_code, row.package_code),
          'model': row.product_name,
          'store_name': row.provider_name,
          'stock_location': row.warehose_name,
          'producer': row.manufactorer,
          'trademark': row.shop_sign,
          'spec': row.spec,
          'weight': sprintf('%f', row._weight),
          'price': sprintf('%f', row.price),
          'spider': '宝时达',
          'spider_float': 100,
          'phone_number': '50509699',
        });
      });
      return result;
    },
    process: process
  }
  parsers['fdc'] = parser;

})(url_configs, parsers);
