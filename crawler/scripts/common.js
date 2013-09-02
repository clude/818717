
var
  Q = require('q'),
  gbk = require('gbk'),
  parsers = {},
  url_configs = {};

worker = function(domain, url, crawl_result) {
  if (!parsers[domain]) {
    crawl_result('不认识的域名');
    return;
  }
  var parser = parsers[domain];
  parser.download(url).
    done(function(content) {
      try {
        var objects = [];
        parser.parse(url, content).forEach(function(object){
          objects.push(parser.process(object));
        });
        crawl_result(null, domain, url, objects);
      }
      catch (e) {
        crawl_result(e, domain, url);
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
  gbk.fetch(url,'utf-8').to('string', function(err,string){
    if (err)  {
      deffered.reject(err);
    }
    else  {
      deffered.resolve(string);
    }
  });
  return deffered.promise;
};