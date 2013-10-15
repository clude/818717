
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=2400; ++i)  {
    var url = sprintf('http://list.sososteel.com/res/p------------2--------------------%d.html', i);
    configs[url] = {
      priority: i,
      validity: 6*60*60*1000
    };
  }
  url_configs['mysteel'] = configs;

  var parser = {
    download: gbk_get,
    parse: function(url, content)  {
      var result = []
        , doc = $(content)
        , started = false
      ;
      doc.find('.listTable>tbody').each(function(index, item){
        var itemId = $(item).attr('id');
        if (itemId == 'tailResource')  {
          started = false;
          return;
        }
        if (itemId == 'listTop100T')  {
          started = true;
          return;
        }
        if (!started)
          return;

        $(item).find('tr').each(function(index, row){
          var td = $(row).find('td')
            , phone = td.eq(8).find('a').eq(0).attr('onclick')
          ;
          phone = phone ? phone.match(/1[3-8]\d{9}/g) : '';
          phone = phone ? phone.join(' ') : '';

          var r = {
            url: td.eq(0).find('a').attr('href'),
            model: td.eq(0).find('a').text(),
            trademark: td.eq(1).attr('title'),
            spec: td.eq(2).attr('title'),
            warehouse: td.eq(3).attr('title'),
            producer: td.eq(4).attr('title'),
            store_raw: td.eq(6).attr('title'),
            price_raw: td.eq(5).attr('title'),
            weight_raw: td.eq(5).clone().children().remove().end().text().trim(),
            source_raw: '我的钢铁',
            source_uint: 5,
            cell_raw: phone,
          }
          console.log(r);
          result.push(r);
        });
      });
      return result;
    },
    process: process
  }
  parsers['mysteel'] = parser;

})(url_configs, parsers);
