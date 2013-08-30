
var cfg = {
  //host: '211.152.54.140',
  name: 'node-random',
  port: 9681,
  'reconnection delay': 5000,
  'max reconnection attempts': Infinity
};

var io = require('socket.io-client').connect('/node', cfg);

var script = '';
var worker = function(url, success_handler, error_handler) {
  error_handler('脚本未实现');
};

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
      script = new_script;
      socket.emit('update result');
    }
    catch(e)  {
      script = backup.script;
      worker = backup.worker;
      socket.emit('update result', e);
    }
  }).

  on('crawl', function(url) {
    function crawl_success(rows)  {
      socket.emit('crawl result', null, rows);
    }
    function crawl_error(err) {
      socket.emit('crawl result', err, null);
    }
    try {
      worker(url, crawl_success, crawl_error);
    }
    catch(e)  {
      crawl_error(e);
    }
  });

setInterval(function(){
  if (!io.socket.connected)  {
    console.log('retyring...');
    io.socket.connect();
  }
}, cfg['reconnection delay']);

