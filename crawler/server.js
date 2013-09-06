
var cfg = {
  port: 9681,
  'dispatch_interval': 0.5*1000,
  'reorder_interval': 30*1000,
  'index server': 'http://127.0.0.1:8000/search/'
};

var
  io = require('socket.io').listen(cfg.port).set('log level', 1)
  $ = require('jQuery');

var
  nodes = {},
  domains = {},
  worklist = {},
  server = {
    online: false,
    script: ''
  };

function reorder()  {
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
      return v1[1].priority > v2[1].priority ? 1 : -1;
    });
    worklist[domain] = crawl_urls;
  }
}
setInterval(reorder, cfg['reorder_interval']);

function dispatch() {
  if (!server.online) return;
  var now = new Date().getTime();
  for (var domain in worklist)  {
    var crawl_urls = worklist[domain];
    for (var socket_id in nodes)  {
      if (crawl_urls.length == 0) break;
      if (!nodes[socket_id].ready || nodes[socket_id].working[domain]) continue;
      var crawl_url = crawl_urls.splice(0, 1)[0];
      var url = crawl_url[0], url_config = crawl_url[1];
      url_config.check = now + 3*60*1000;
      nodes[socket_id].socket.emit('crawl', domain, url);
      nodes[socket_id].working[domain] = url;
    }
  }
}
setInterval(dispatch, cfg['dispatch_interval']);

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
      if (socket) delete nodes[socket.id];
    }).

    on('update result', function(err) {
      if (!socket) return;
      nodes[socket.id].ready = !err;
    }).

    on('crawl result', function(err, domain, url, objects)  {
      if (!socket || !socket.id) return;
      var node_worklist = nodes[socket.id].working;
      if (node_worklist && node_worklist[domain]) delete node_worklist[domain];
      if (!domains[domain] || !domains[domain][url]) return;
      crawl_config = domains[domain][url];
      var now = new Date().getTime();
      if (err)  {
        crawl_config.check = now;
      } else {
        crawl_config.check = now + crawl_config.validity;
        console.log(socket.id, '-->', domain, url, objects.length);
        $.post(cfg['index server']+'update/', JSON.stringify(objects));
      }
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
        if (!url_config.validity) url_config.validity = 20*60*1000; // 默认保质期20分钟
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