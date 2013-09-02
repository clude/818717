
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=1; i<=3600; ++i)  {
    var url = sprintf('http://www.usteel.com/index.php?app=gangcai&created=3&page=%d', i);
    configs[url] = {
      priority: i,
      validity: 60*60*1000
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
    download: $.get,
    parse: function(url, content)  {
      var result = []
        , doc = $(content)
      ;
      doc.find('.list>tr:gt(0)').each(function(index, item){
        var cols = $(item).find('td')
          , p = cols.eq(7).find('img').attr('src').split('&')[2].split('=')[1]
          , phone = '';
        for (var i = 0; i < p.length/2; ++i)  {
          phone += secret_dict[p.slice(i*2, i*2+2)];
        }
        result.push({
          url: cols.eq(0).find('a').attr('href'),
          model: cols.eq(0).text(),
          trademark: cols.eq(2).text(),
          spec: cols.eq(1).text(),
          producer: cols.eq(3).text(),
          stock_location: '',
          price: cols.eq(4).children('i').eq(0).text(),
          weight: cols.eq(4).children('i').eq(1).text(),
          store_name: cols.eq(7).find('a').attr('title'),
          phone_number: phone,
          spider: '你的钢铁',
          spider_float: 50,
        })
      });
      return result;
    },
    process: process
  }
  parsers['usteel'] = parser;

})(url_configs, parsers);
