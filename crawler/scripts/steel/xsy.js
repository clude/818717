
(function(url_configs, parsers)  {
  var
    sprintf = require('sprintf').sprintf,
    $ = require('jQuery');

  var configs = {};
  for (var i=0; i<=500; ++i)  {
    var url = sprintf('%d', i);
    configs[url] = {
      priority: i,
      validity: 60*60*1000
    };
  }
  url_configs['xsy'] = configs;

  var parser = {
    download: function(url) {
      var postBody = 'searchFlag=&ifzp=0&bean.pm=&bean.cz=&bean.cd=&bean.ck=&bean.dx=0&bean.hd1=&bean.hd2=&bean.kd1=&bean.kd2=&bean.cd1=&bean.cd2=&bean.zl1=&bean.zl2=&bean.djg1=&bean.djg2=&bean.kbh=&bean.customerIdFlag=&bean.distributionModel=&bean.zyh=&bean.zyflEn=&bean.zyflCh=&orderGg=&orderJg=&orderName=&providerAreaId=010&providerAreaId=010&providerAreaId=010&providerAreaId=010&providerAreaId=009&providerAreaId=010&providerAreaId=010&providerAreaId=010&providerAreaId=010&providerAreaId=010&currPage=%s&totalPage=500&pageSize=100&jumpPage=1';
      return $.post('http://www.baosteel-xsy.com/xyj/index/index_queryForLogin.action', sprintf(postBody, url));
    },
    parse: function(url, content)  {
      var
        doc = $(content),
        result = [];
      doc.find('#infolist>.maintab>tr:gt(0)').each(function(index, row){
        if (index % 2 == 1) return;
        var td = $(row).children('td')
          , a1 = td.eq(2).text().match('品名：(.+)材质：(.+)')
          , a2 = td.eq(2).find('a').text().match('规格：(.+) ')
          , a3 = td.eq(3).text().match('产地：(.+) ')
          , a4 = td.eq(4).text().match('重量：(.+) 数量')
          , stock_location = td.eq(5).children().remove().end().text().trim()
        ;
        var item = {
          url: url,
          model: a1[1].trim(),
          trademark: a1[2].trim(),
          spec: a2[1].trim(),
          producer: a3[1].trim(),
          price_raw: td.eq(6).find('span').text().trim(),
          weight_raw: a4[1].trim(),
          store_raw: '上海宝钢新事业发展总公司',
          warehouse: stock_location,
          cell_raw: '021-56105222',
          source_raw: '新事业',
          source_uint: 10,
        }
        console.log(item);
        result.push(item);
      });
      return result;
    },
    process: process
  }
  parsers['xsy'] = parser;

})(url_configs, parsers);
