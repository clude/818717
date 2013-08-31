
var io = require('socket.io').listen(9681).set('log level', 1);

var
  nodes = {},
  domains = {},
  server = {
    online: false,
    script: ''
  };

io.of('/node').on('connection', function(socket)  {
  socket.
    on('login', function(name)  {
      nodes[socket.id] = {
        socket: socket,
        name: name,
      };
    }).

    on('disconnect', function(socket) {
        delete nodes[socket.id];
    }).

    on('update result', function(err) {

    }).

    on('crawl result', function(err, data)  {

    });
});

io.of('/admin').on('connection', function(socket) {
  socket.
    on('start', function()  {
      server.online = true;
      socket.emit('result', 'OK');
    }).

    on('stop', function()  {
      server.online = false;
      socket.emit('result', 'OK');
    }).

    on('status', function()  {
      // report the status. Implement it.
      socket.emit('result', 'OK');
    }).

    on('update', function(script)  {
      server.script = script;
      nodes.forEach(function(node)  {
        node.socket.emit('update', script);
      });
      socket.emit('result', 'OK');
    }).

    on('load', function(domain, urls)  {
      domains[domain] = urls;
      urls.forEach(function(url)  {

      });
      socket.emit('result', 'OK');
    }).

    on('unload', function(domain)  {
      if (domain)
        delete domains[domain];
      else
        domains = {};
      socket.emit('result', 'unload');
    }).

    on('refresh', function(domain)  {
      for (var domain in domains) {

      }
      socket.emit('result', 'OK');
    });
});