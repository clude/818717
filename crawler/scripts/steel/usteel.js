
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=10; ++i)  {
    var url = sprintf('http://www.usteel.com/index.php?app=gangcai&u=yes&page=%d', i);
    configs[url] = {
      priority: i,
      validity: 1*60*1000
    };
  }
  url_configs['usteel'] = configs;

  var secret_dict ={
    'qq':'-',
    'mn':'1',
    'kn':'2',
    'ab':'3',
    'qa':'4',
    '8c':'5',
    'uk':'6',
    'vw':'7',
    'wa':'8',
    'co':'9',
    'ze':'0',
    'ko':'',
    'bc':'/'
  };

  var parser = {
    download: http_get,
    parse: function(url, content)  {
      var result = []
        , doc = $(content)
      ;
      doc.find('.list>tr:gt(0)').each(function(index, item){
        var cols = $(item).find('td')
          , p = cols.eq(7).find('img').attr('src')
          , phone = '';

        if (p) {
          p = p.split('&')[2].split('=')[1];
          for (var i = 0; i < p.length/2; ++i)  {
          phone += secret_dict[p.slice(i*2, i*2+2)];
        }
        }
        var item = {
          url: 'http://www.usteel.com/'+cols.eq(0).find('a').attr('href'),
          model: cols.eq(0).text(),
          trademark: cols.eq(2).text(),
          spec: cols.eq(1).text(),
          producer: cols.eq(3).text(),
          warehouse: '',
          price_raw: cols.eq(4).children('i').eq(0).text(),
          weight_raw: cols.eq(4).children('i').eq(1).text(),
          store_raw: cols.eq(7).find('a').attr('title'),
          cell_raw: phone,
          source_raw: '你的钢铁',
          source_uint: 9,
        };
        console.log(item);
        result.push(item);
      });
      return result;
    },
    process: process
  }
  parsers['usteel'] = parser;

})(url_configs, parsers);
