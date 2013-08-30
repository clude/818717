
var cfg = {
  host: '127.0.0.1',
  port: 9681
};

var
  io = require('socket.io-client').connect('/admin', cfg),
  rl = require('readline').createInterface({ input: process.stdin, output: process.stdout, terminal: true });

io.
  on('result', function(data) {
    console.log(data);
    rl.prompt();
  }).

  on('message', function(message) {
    console.log(message);
  });

rl.setPrompt(cfg.host+'> ');
rl.prompt();

rl.on('line', function(line){
  var parts = line.trim().split(' ')
    , command = parts[0]
    , args = parts[1]
  ;
  switch(command) {
    case 'ping':
      io.emit('ping');
      break;
    case 'exit':
      process.exit(0);
      break;
    default:
      console.log('ERR: unknown command');
      rl.prompt();
  }
});