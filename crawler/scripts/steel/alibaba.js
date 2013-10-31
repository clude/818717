
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
      var url = sprintf('http://s.1688.com/selloffer/-%s.html?earseDirect=false&button_click=top&pageSize=40&n=y&from=marketSearch&showStyle=img&offset=3&beginPage=%d', category, i);
      configs[url] = {
        priority: i,
        validity: 10*60*1000
      };
    }
  });
  url_configs['alibaba'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      function parseField(field) {
        return field.slice(field.indexOf(':')+1, field.length).trim();
      }
      var result = [];
      $(content).find('#sw_maindata_asyncload').children('li').each(function(index, row){
        var
          ul = $(row).find('ul'),
          spans = ul.find('.sw-mod-offerImg-des>p>span');
        var item = {
          url: ul.find('a:first').attr('href'),
          model: parseField(spans.eq(1).text()),
          trademark: parseField(spans.eq(2).text()),
          producer: parseField(spans.eq(3).text()),
          spec: parseField(spans.eq(4).text()),
          price_raw: ul.find('.sw-ui-font-standardPrice').text(),
          store_raw: ul.find('.sw-block-company').find('a').text(),
          warehouse: '',
          weight_raw: '',
          cell_raw: '',
          source_raw: '阿里巴巴',
          source_uint: 1
        };
        console.log(item);
        result.push(item);
      });
      return result;
    },
    process: process
  }
  parsers['alibaba'] = parser;

})(url_configs, parsers);
