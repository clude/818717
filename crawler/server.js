
var cfg = {
  port: 9681,
  indexer: '127.0.0.1',
  'dispatch_interval': 1*1000,
  'reorder_interval': 20*1000
};

var io = require('socket.io').listen(cfg.port).set('log level', 1);

var
  nodes = {},
  domains = {},
  worklist = {},
  server = {
    online: false,
    script: ''
  };

setInterval(function reorder()  {
  var now = new Date().getTime();
  worklist = {};
  for (var domain in domains) {
    var
      crawl_urls = [],
      url_configs = domains[domain];
    for (var url in url_configs) {
      var url_config = url_configs[url];
      if (url_config.check < now) {
        crawl_urls.push([url, url_config]);
      }
    }
    crawl_urls.sort(function(v1, v2){
      return v1[1].priority > v2[1].priority;
    });
    worklist[domain] = crawl_urls;
  }
}, cfg['reorder_interval']);

setInterval(function dispatch() {
  for (var domain in worklist)  {
    var
      crawl_urls = worklist[domain],
      current = 0;
    for (var socket_id in nodes)  {
      if (current == crawl_urls.length) break;
      if (!nodes[socket_id].ready || nodes[socket_id].working[domain]) continue;
      var url = crawl_urls[current++][0];
      nodes[socket_id].socket.emit('crawl', domain, url);
      nodes[socket_id].working[domain] = url;
    }
  }
}, cfg['dispatch_interval']);

io.of('/node').on('connection', function(socket)  {
  socket.
    on('login', function(name)  {
      nodes[socket.id] = {
        socket: socket,
        name: name,
        ready: false,
        working: {}
      };
      socket.emit('update', server.script);
    }).

    on('disconnect', function(socket) {
        delete nodes[socket.id];
    }).

    on('update result', function(err) {
      nodes[socket.id].ready = !err;
    }).

    on('crawl result', function(err, domain, url, objects)  {
      var worklist = nodes[socket.id].working;
      if (worklist && worklist[domain]) delete worklist[domain];
      if (!domains[domain] || !domains[domain][url]) return;
      crawl_config = domains[domain][url];
      var now = new Date().getTime();
      if (err)  {
        crawl_config.check = now;
      } else {
        crawl_config.check = now + crawl_config.validity;
        // TODO: http post the objects to the indexer server.
        console.log(objects); 
      }
      dispatch();
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
      // TODO: report the status here
      socket.emit('result', 'OK');
    }).

    on('update', function(script)  {
      server.script = script;
      for (var socket_id in nodes)  {
        nodes[socket_id].socket.emit('update', script);
      }
      socket.emit('result', 'OK');
    }).

    on('load', function(domain, url_configs)  {
      domains[domain] = url_configs;
      var now = new Date().getTime();
      for (var url in url_configs)  {
        var url_config = url_configs[url];
        url_config.check = now;
        if (!url_config.validity) url_config.validity = 20*60*1000;
        if (!url_config.priority) url_config.priority = 3;
      }
      reorder();
      socket.emit('result', 'OK');
    }).

    on('unload', function(domain)  {
      if (domain)
        delete domains[domain];
      else
        domains = {};
      reorder();
      socket.emit('result', 'unload');
    }).

    on('refresh', function(domain)  {
      var now = new Date().getTime();
      for (var _domain in domains) {
        if (domain == _domain) continue;
        var url_configs = domains[_domain];
        for (var url in url_configs)  {
          url_configs[url].check = now;
        }
      }
      reorder();
      socket.emit('result', 'OK');
    });
});