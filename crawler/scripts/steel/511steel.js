
(function(url_configs, parsers)  {
  var $ = require('jQuery');

  var url = 'http://www.511steel.com/Customer/Resource/Ajax/ResourceGet.ashx?op=searchkk&data=%3CRoot%3E%3CPz%3E%3C/Pz%3E%3CCd%3E%3C/Cd%3E%3CCk%3E%3C/Ck%3E%3CMinPrice%3E%3C/MinPrice%3E%3CMaxPrice%3E%3C/MaxPrice%3E%3CPh%3E%3C/Ph%3E%3CMinThickness%3E%3C/MinThickness%3E%3CMaxThickness%3E%3C/MaxThickness%3E%3CMinWidth%3E%3C/MinWidth%3E%3CMaxWidth%3E%3C/MaxWidth%3E%3CMinLength%3E%3C/MinLength%3E%3CMaxLength%3E%3C/MaxLength%3E%3CRows%3E20%3C/Rows%3E%3C/Root%3E&t=1359866430453&_=1359866430466&sEcho=1&iColumns=14&sColumns=&iDisplayStart=0&iDisplayLength=20000';
  url_configs['511steel'] = {};
  url_configs['511steel'][url] = { validity: 3*60*60*1000 };

  var parser = {
    download: http_get,
    parse: function(url, content)  {
      var items = JSON.parse(content);
      var result = [];
      items.aaData.forEach(function(item){
        var doc = $(item);
        var item = {
          url: 'http://www.511steel.com/Customer/Resource/Purchase.aspx',
          model: $(item[1]).text(),
          trademark: $(item[2]).text(),
          spec: $(item[3]).text(),
          weight_raw: $(item[6]).text(),
          price_raw: $(item[8]).text(),
          warehouse: $(item[9]).text(),
          producer: $(item[10]).text(),
          store_raw: 'www.511steel.com',
          cell_raw: '4001158158-6666',
          source_raw: '百营钢铁',
          source_uint: 0
        };
        result.push(item);
      });
      return result;
    },
    process: process
  }
  parsers['511steel'] = parser;

})(url_configs, parsers);
