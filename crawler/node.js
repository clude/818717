
var cfg = {
  name: 'node-random',
  //host: '127.0.0.1',
  port: 9681,
  'reconnection delay': 5000,
  'max reconnection attempts': Infinity
};

var io = require('socket.io-client').connect('/node', cfg);

var current_script = null;
var url_handler = {};

io.
  on('connect', function() {
    console.log('connected.');
    io.emit('login', cfg.name); // 就这样没有验证的登录吧同学
  }).

  on('script', function(new_script) {
    try {

    }
    catch(e)  {

    }
  }).

  on('target', function(url) {

  });

setInterval(function(){
  if (!io.socket.connected)  {
    console.log('retyring...');
    io.socket.connect();
  }
}, cfg['reconnection delay']);