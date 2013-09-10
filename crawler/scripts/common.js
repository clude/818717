
var
  Q = require('q'),
  iconv = require('iconv-lite'),
  http = require('http'),
  parsers = {},
  url_configs = {};

worker = function(domain, url, crawl_result) {
  if (!parsers[domain]) {
    crawl_result('不认识的域名');
    return;
  }
  var parser = parsers[domain];
  parser.download(url).
    then(function(content) {
      try {
        var objects = [];
        parser.parse(url, content).forEach(function(object){
          objects.push(parser.process(object));
        });
        crawl_result(null, domain, url, objects);
      }
      catch (e) {
        crawl_result(e, domain, url);
        console.log('parse/process error', e);
      }
    }).
    fail(function (err){
      crawl_result(err, domain, url);
    }); 
};

generate_url_config = function(domain)  {
  return domain ? url_configs[domain] : url_configs;
};

gbk_get = function(url) {
  var deffered = Q.defer();
  http.get(url).
    on('response', function(res){
      var content = '';
      res.
        on('data', function(trunk) {
          content += iconv.decode(trunk, 'GBK');
        }).
        on('end', function() {
          deffered.resolve(content);
        })
    }).
    on('error', function(err) {
      deffered.reject(err);
    });
  return deffered.promise;
};

http_get = function(url) {
  var deffered = Q.defer();
  http.get(url).
    on('response', function(res){
      var content = '';
      res.
        on('data', function(trunk) {
          content += trunk.toString();
        }).
        on('end', function() {
          deffered.resolve(content);
        })
    }).
    on('error', function(err) {
      deffered.reject(err);
    });
  return deffered.promise;
}