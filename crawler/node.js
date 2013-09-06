
var cfg = {
  //host: '203.166.177.14',
  name: 'node-random',
  port: 9681,
  'reconnection delay': 5000,
  'max reconnection attempts': Infinity
};

var io = require('socket.io-client').connect('/node', cfg);

var script = '';
function worker(domain, url, crawl_result) {
  crawl_result('脚本未实现');
}

io.
  on('connect', function() {
    console.log('connected.');
    io.emit('login', cfg.name); // 暂无验证
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
      io.emit('update result');
    }
    catch(e)  {
      script = backup.script;
      worker = backup.worker;
      io.emit('update result', e);
    }
  }).

  on('crawl', function(domain, url) {
    function crawl_result(err, domain, url, objects) {
      io.emit('crawl result', err, domain, url, objects);
    }
    try {
      console.log(domain, url);
      worker(domain, url, crawl_result);
    }
    catch(e)  {
      crawl_result(e, domain, url);
    }
  });

setInterval(function(){
  if (!io.socket.connected)  {
    console.log('retyring...');
    io.socket.connect();
  }
}, cfg['reconnection delay']);

