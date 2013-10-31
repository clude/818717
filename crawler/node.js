
var cfg = {
  //host: '211.152.54.139',
  name: 'node-random',
  port: 9681,
  'reconnection delay': 5000,
  'max reconnection attempts': Infinity,
  batch: 1,
};

var
  io = require('socket.io-client').connect('/node', cfg),
  sha1 = require('sha1'),
  gzip = require('zlib').gzip,
  http = require('http');

var script = '';
function worker(domain, url, crawl_result) {
  crawl_result('脚本未实现');
}

var stack_objects = [];
function commit_objects(){
  var
    origin = JSON.stringify(stack_objects.splice(0)),
    host = cfg.host ? cfg.host : '127.0.0.1',
    port = cfg.host ? 80: '8000';

  gzip(origin, function(err, compressed) {
    var boundaryKey = Math.random().toString(16);
    console.log('====== commit begin =====');
    console.log('commit:', compressed.length, '('+origin.length+')');
    var request = http.request({
      hostname: host,
      port: port,
      method: 'POST',
      path: '/search/update/',
      headers : {
        'Content-Length' : compressed.length,
        'Content-Transfer-Encoding': 'binary',
      }
    });
    request.write(compressed);
    console.log('====== commit end =====');    
  });
}

io.
  on('connect', function() {
    console.log('connected.');
    io.emit('login', cfg.name); // 暂无验证
  }).

  on('disconnect', function() {
    console.log('disconnected. commit the remaining.');
    commit_objects();
  }).

  on('update', function(new_script) {
    var backup = {
      script: script,
      worker: worker
    };
    try {
      eval(new_script);
      console.log('update success');
      script = new_script;
    }
    catch(e)  {
      console.log('update error', e);
      script = backup.script;
      worker = backup.worker;
    }
    io.emit('update result', sha1(script));
  }).

  on('crawl', function(domain, url) {
    function crawl_result(err, domain, url, objects) {
      io.emit('crawl result', err, domain, url);
      stack_objects = stack_objects.concat(objects);
      if (stack_objects.length >= cfg.batch) commit_objects();
    }
    try {
      console.log(domain, url);
      worker(domain, url, crawl_result);
    }
    catch(e)  {
      console.log('*** worker error ***', e);
      crawl_result(e, domain, url);
    }
  });

setInterval(function(){
  if (!io.socket.connected)  {
    console.log('retyring...');
    io.socket.connect();
  }
}, cfg['reconnection delay']);

