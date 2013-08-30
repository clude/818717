
var io = require('socket.io').listen(9681).set('log level', 1);

var node_list = [];

io.of('/node').on('connection', function(socket)  {
  socket.
    on('login', function(name)  {
      
    }).

    on('disconnect', function(socket) {
      
    }).

    on('update result', function(err) {

    }).

    on('crawl result', function(err, data)  {

    });
});

io.of('/admin').on('connection', function(socket) {
  socket.
    on('start', function(node)  {
      socket.emit('result', 'start');
    }).

    on('stop', function(node)  {
      socket.emit('result', 'stop');
    }).

    on('restart', function(node)  {
      socket.emit('result', 'restart');
    }).

    on('status', function(node)  {
      socket.emit('result', 'status');
    }).

    on('update', function(script)  {
      socket.emit('result', 'update');
    }).

    on('crawl', function(url)  {
      socket.emit('result', 'crawl');
    }).

    on('load', function(domain, urls)  {
      socket.emit('result', urls);
    }).

    on('unload', function(domain)  {
      socket.emit('result', 'unload');
    }).

    on('refresh', function(domain)  {
      socket.emit('result', 'refresh');
    });
});