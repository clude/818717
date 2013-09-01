
var cfg = {
  host: '192.168.30.101',
  port: 9681,
  'script patterns': ['scripts/common.js', 'scripts/steel/*.js']
};

function concat_scripts(patterns)  {
  var script = '';
  patterns.forEach(function(pattern){
    glob.sync(pattern).forEach(function(filename) {
      script += '\n';
      script += fs.readFileSync(filename);
    });
  });
  return script;
}

var
  io = require('socket.io-client').connect('/admin', cfg),
  rl = require('readline').createInterface({ input: process.stdin, output: process.stdout, terminal: true }),
  fs = require('fs'),
  glob = require('glob');

io.
  on('connect', function()  {
    rl.setPrompt((cfg.host ? cfg.host : '')+'> ');
    rl.prompt();
  }).

  on('disconnect', function() {
    console.warn('disconnected.');
    process.exit(1);
  }).

  on('result', function(data) {
    console.log(data);
    rl.prompt();
  }).

  on('message', function(message) {
    console.log(message);
  });

rl.on('line', function(line){
  var
    parts = line.trim().split(' '),
    command = parts[0],
    arg = parts[1];

  switch(command) {
    case 'start':
    case 'stop':
    case 'status':
    case 'unload':
    case 'refresh':
      io.emit(command, arg);
      break;
    case 'update':
      io.emit(command, concat_scripts(cfg['script patterns'])); // 每次都重新加载一次脚本，脚本修改以后不用重启程序
      break;
    case 'load':
      // 不进行任何错误处理，此处失败则退出程序，便于早点发现问题
      eval(concat_scripts(cfg['script patterns']));
      io.emit(command, arg, generate_url_config(arg));
      break;
    case 'exit':
      process.exit(0);
      break;
    default:
      console.log('ERR: unknown command');
      rl.prompt();
  }
});
