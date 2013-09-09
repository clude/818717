
var cfg = {
  port: 9681,
  'dispatch_interval': 0.5*1000,
  'reorder_interval': 30*1000,
  'index server': 'http://127.0.0.1:8000/search/'
};

var
  io = require('socket.io').listen(cfg.port).set('log level', 1),
  $ = require('jQuery'),
  sha1 = require('sha1'),
  sprintf = require('sprintf').sprintf;

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
  console.log('~~~~~ reorder begin~~~~~');
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
    console.log(domain, crawl_urls.length);
  }
  console.log('~~~~~ reorder end~~~~~');
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
      console.log(domain, '...'+url.slice(url.length-30,url.length), '=== crawl ===>', socket_id);
      nodes[socket_id].working[domain] = url;
    }
  }
}
setInterval(dispatch, cfg['dispatch_interval']);

io.of('/node').on('connection', function(socket)  {
  socket.
    on('login', function(name)  {
      console.log(socket.id, '=== login ===>', name);
      nodes[socket.id] = {
        socket: socket,
        name: name,
        ready: false,
        working: {}
      };
      socket.emit('update', server.script);
    }).

    on('disconnect', function() {
      console.log(socket.id, '=== disconnect ===>');
      delete nodes[socket.id];
    }).

    on('update result', function(err) {
      if (!socket) return;
      console.log(socket.id, '=== update ===>', err ? 'failed' : 'success');
      nodes[socket.id].ready = !err;
    }).

    on('crawl result', function(err, domain, url, objects)  {
      if (!socket || !socket.id || !nodes[socket.id]) return;
      var node_worklist = nodes[socket.id].working;
      if (node_worklist && node_worklist[domain]) delete node_worklist[domain];
      if (!domains[domain] || !domains[domain][url]) return;
      crawl_config = domains[domain][url];
      var now = new Date().getTime();
      if (err)  {
        console.log(socket.id, '=== crawl result error ===>', err, domain, '...'+url.slice(url.length-30, url.length));
        crawl_config.check = now;
      } else {
        crawl_config.check = now + crawl_config.validity;
        console.log(socket.id, '=== crawl result ===>', objects.length, domain, '...'+url.slice(url.length-30, url.length));
        $.post(cfg['index server']+'update/', JSON.stringify(objects));
      }
    });
});

io.of('/admin').on('connection', function(socket) {
  socket.
    on('start', function()  {
      server.online = true;
      console.log('***** ADMIN: start *****');
      socket.emit('result', 'OK');
    }).

    on('stop', function()  {
      server.online = false;
      console.log('***** ADMIN: stop *****');
      socket.emit('result', 'OK');
    }).

    on('status', function()  {
      console.log('***** ADMIN: status *****');
      var result = '';
      result += '===== SERVER begin =====\n';
      result += sprintf('online: %s\n', server.online);
      result += sprintf('script: %s\n', sha1(server.script));
      result += '===== SERVER end =====\n\n';

      result += '===== NODES begin =====\n';
      for (var socket_id in nodes)  {
        var n = nodes[socket_id];
        result += sprintf('***** %s *****\n', n.name);
        result += sprintf('socket.id: %s\n', n.socket.id);
        result += sprintf('ready: %s\n', n.ready);
        result += 'working:\n';
        for (var domain in n.working) {
          var list = n.working[domain];
          result += sprintf('   %s: %s\n', domain, list.slice(list.length-30, list.length));
        }
      }
      result += '===== NODES end =====\n\n';

      result += '===== DOMAINS begin =====\n';
      for (var domain in domains)  {
        var
          total = Object.keys(domains[domain]).length,
          remain = total-worklist[domain].length;
        result += sprintf('%s: %d/%d, %.2f\n', domain, remain, total, remain*100/total);
      }
      result += '===== DOMAINS end =====\n\n';

      socket.emit('result', result);
    }).

    on('update', function(script)  {
      console.log('***** ADMIN: status *****');
      server.script = script;
      var script_hash = sha1(script);
      console.log('server script updated:', script_hash);
      for (var socket_id in nodes)  {
        console.log(script_hash, '== update =>', socket_id);
        nodes[socket_id].socket.emit('update', script);
      }
      socket.emit('result', 'OK');
    }).

    on('load', function(domain, url_configs)  {
      console.log('***** ADMIN: load *****');
      function load_domain_config(domain, domain_config) {
        console.log('domain:', domain, Object.keys(domain_config).length);
        domains[domain] = domain_config;
        var now = new Date().getTime();
        for (var url in domain_config)  {
          var url_config = domain_config[url];
          url_config.check = now;
          if (!url_config.validity) url_config.validity = 20*60*1000; // 默认保质期20分钟
          if (!url_config.priority) url_config.priority = 3;
        }
      }

      if (domain) {
        load_domain_config(domain, url_configs);        
      }
      else  {
        for (var domain in url_configs) {
          load_domain_config(domain, url_configs[domain]);
        }
      }
      reorder();
      socket.emit('result', 'OK');
    }).

    on('unload', function(domain)  {
      console.log('***** ADMIN: unload *****');
      if (domain)
        delete domains[domain];
      else
        domains = {};
      reorder();
      console.log('remaining domains:', Object.keys(domains));
      socket.emit('result', 'OK');
    }).

    on('refresh', function(domain)  {
      console.log('***** ADMIN: refresh *****');
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