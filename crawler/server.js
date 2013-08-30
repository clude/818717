
var io = require('socket.io').listen(9681)

io.of('/node').on('connection', function(socket)  {
  socket.
    on('login', function(name)  {
      console.log(name, 'logged in.')
    }).

    on('disconnect', function(socket) {
      console.log('disconnected.')
    });
});

io.of('/admin').on('connection', function(socket) {
  socket.
    on('ping', function()  {
      socket.emit('result', 'pong');
    });
});