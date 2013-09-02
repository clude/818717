
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var categories_1 = ['HPB235', 'Q195', 'SAE1008', 'Q215', 'HRB335', 'HRB400', 'Q235B', 'SS400', 'SPHC', 'Q345B/A', 'ZJ330B', 'ST12', 'ST14', 'DC01', 'DC03', 'DC04', 'SPCC', 'SPCC-SD'];

  var configs = {};
  categories_1.forEach(function(category) {
    for (var i=1; i<=100; ++i)  {
      var url = sprintf('http://www.steelabc.com/steelinformation/steelsearch?key=%s&page=%d', category, i);
      configs[url] = {
        priority: i,
        validity: 60*60*1000
      };
    }
  });
  url_configs['steelabc'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      var
        result = [],
        first = true,
        doc = $(content);
      doc.find('.table_3 tr').each(function(index, row){
        if (first)  {
          first = false;
          return;
        }
        $row = $(row).find('td');
        if ($row.eq(2).text() == '') return;
        var td2 = $row.eq(2).text().trim().split(' ');

        result.push({
          url: url,
          model: '',
          trademark: $row.eq(1).text(),
          spec: $row.eq(0).text(),
          weight: '',
          price: $row.eq(3).text(),
          producer: td2[0],
          stock_location: td2.length > 1 ? td2[1] : td2[0],
          store_name: $row.eq(4).text().trim(),
          phone_number: $row.eq(5).text().trim(),
          spider: '有钢',
          spider_float: 80,
        });
      });
      return result;
    },
    process: process
  }
  parsers['steelabc'] = parser;

})(url_configs, parsers);
