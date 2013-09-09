
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
        var item = {
          'url': sprintf('http://www.shgt.com/package/%s/%s', row.provider_code, row.pack_code),
          'model': row.product_name,
          'store_raw': row.provider_name,
          'warehouse': row.warehouse_name,
          'producer': row.manufacturer,
          'trademark': row.shop_sign,
          'spec': row.spec,
          'weight_raw': sprintf('%f', row._weight),
          'price_raw': sprintf('%f', row.price),
          'source_raw': '范达城',
          'source_uint': 4,
          'cell_raw': row.cell_phone,
        };
        result.push(item);
      });
      return result;
    },
    process: process
  }
  parsers['fdc'] = parser;

})(url_configs, parsers);
