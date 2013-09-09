
var
  sha1 = require('sha1'),
  path = require('path'),
  cwd = process.cwd();

module.exports = function ( grunt ) {
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-exec');

  var userConfig = {
    target_dir: path.join(cwd, 'build'),
    log_dir: path.join(cwd, 'log'),
    crawler_dir: path.join(cwd, 'crawler'),    
    product_name: '818717',
    index_server: '127.0.0.1',
  };

  userConfig['site_dir'] = path.join(userConfig.target_dir, 'site');

  var taskConfig = {
    meta: {
      banner: 
        '/**\n' +
        ' * <%= product_name %>\n' +
        ' * Copyright (c) 2013 \n' +
        ' */\n'
    },

    clean: {
      compile: {
        options: {
          force: true,
        },
        src: ['<%= target_dir %>']
      }
    },

    copy: {
      python: {
        files: [
          { 
            src: [ '**/*.py', '**/index.html' ],
            dest: '<%= site_dir %>',
            cwd: 'search',
            expand: true
          }
        ]
      },
      nginx: {
        files: [
          { 
            src: [ '**' ],
            dest: '<%= site_dir %>/search/static/',
            cwd: 'search/search/static',
            expand: true
          }
        ]
      },
    },

    html2js: {
      partials: {
        options: {
          base: 'search/search'
        },
        src: [ 'search/search/static/partials/*.html' ],
        dest: '<%= site_dir %>/search/static/js/template_cache.js'
      }
    },

    ngmin: {
      compile: {
        files: [
          {
            src: [ '**/*.js' ],
            cwd: '<%= site_dir %>/search/static/js',
            dest: '<%= site_dir %>/search/static/js',
            expand: true
          }
        ]        
      }
    },

    concat: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [ 
          '<%= site_dir %>/search/static/js/**/*.js', 
          '<%= html2js.partials.dest %>', 
        ],
        dest: '<%= site_dir %>/search/static/js/<%= product_name %>.js'
      }
    },

    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
        },
        files: {
          '<%= site_dir %>/search/static/js/<%= product_name %>.min.js': '<%= concat.compile.dest %>'
        }        
      }
    },

    recess: {
      compile: {
        src: [ '<%= site_dir %>/search/static/css/main.less' ],
        dest: '<%= site_dir %>/search/static/css/<%= product_name %>.min.css',
        options: {
          compile: true,
          compress: true,
        }
      }
    },

    exec: {
      sleep2: {
        command: 'sleep 2'
      },
      testbuild: {
        command: 'python <%= site_dir %>/manage.py runserver 8001'
      },
      pip: {
        command: 'pip install -r search/requirements.txt'
      },
      npm: {
        command: 'npm install',
        cwd: '<%= crawler_dir %>'
      },
      localrun: {
        command: 'python search/manage.py runserver 8001'
      },
      install_sphinx: {
        command: 'wget http://sphinxsearch.com/files/sphinx-2.1.1-beta.tar.gz;'
         + 'tar zxvf sphinx-2.1.1-beta.tar.gz;'
         + 'cp ../../indexer/* sphinx-2.1.1-beta/src/; cd sphinx-2.1.1-beta;'
         + './configure;'
         + 'make;'
         + 'make install;',
        cwd: '<%= log_dir %>/sphinx'
      },
      install_crontab: {
        command: 'crontab <%= target_dir %>/conf/tasks.cron'
      },

      start_nginx: {
        command: 'nginx -c <%= target_dir %>/conf/nginx.conf'
      },
      stop_nginx: {
        command: 'nginx -s stop'
      },

      start_sphinx: {
        command: 'searchd -c <%= target_dir %>/conf/sphinx.conf'
      },
      clean_sphinx: {
        command: 'rm <%= log_dir %>/sphinx/steel_package.*'
      },
      stop_sphinx: {
        command: 'searchd -c <%= target_dir %>/conf/sphinx.conf --stop'
      },
      test_sphinx: {
        command: "mysql -h <%= index_server %> -P 9217 -e 'show tables; desc steel_package; select count(*) from steel_package;'"
      },
      reindex: {
        command: 'python search/manage.py reindex',
        stdout: false,
        stderr: false,
      },

      reload_supervisor: {
        command: 'supervisorctl reload'
      },
      restart_gunicorn: {
        command: 'supervisorctl restart site'
      },
      restart_crawler: {
        command: 'supervisorctl restart server'
      },
      crawler_init: {
        command: 'node admin update; node admin load;',
        cwd: '<%= crawler_dir %>'
      },
    }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  grunt.registerTask('index', function() {
    var
      index_html = grunt.config('site_dir')+'/search/templates/index.html',
      js_min = grunt.config('site_dir')+'/search/static/js/'+grunt.config('product_name')+'.min.',
      js_min_sha1 = sha1(grunt.file.read(js_min+'js')),
      js_template = grunt.config('site_dir')+'/search/static/js/template_cache.',
      js_template_sha1 = sha1(grunt.file.read(js_template+'js')),
      css_min = grunt.config('site_dir')+'/search/static/css/'+grunt.config('product_name')+'.min.',
      css_min_sha1 = sha1(grunt.file.read(css_min+'css'));

    var simple_report = {
      process: function (contents, path) {
        console.log(path, 'processed.'); 
        return contents;
      }
    };

    grunt.file.copy(js_min+'js', js_min+js_min_sha1+'.js', simple_report);
    grunt.file.copy(js_template+'js', js_template+js_template_sha1+'.js', simple_report);
    grunt.file.copy(css_min+'css', css_min+css_min_sha1+'.css', simple_report);

    grunt.file.copy(index_html, index_html, { 
      process: function (contents, path) {
        console.log(path, 'processed.');
        return contents.
          replace('<!-- dev begin -->', '<!-- dev begin').
          replace('<!-- dev end -->', 'dev end -->').
          replace('<!-- compile begin', '<!-- compile begin -->').
          replace('compile end -->', '<!-- compile end -->').
          replace('{{js_min_sha1}}', js_min_sha1).
          replace('{{js_template_sha1}}', js_template_sha1).
          replace('{{css_min_sha1}}', css_min_sha1);
      }
    });
  });

  grunt.registerTask('conf', function() {
    ['conf/nginx.conf', 'conf/sphinx.conf', 'conf/supervisord.conf', 'conf/tasks.cron'].forEach(function(conf){
      grunt.file.copy(path.join(cwd, conf), path.join(grunt.config('target_dir'), conf), {
        process: function (contents, path)  {
          console.log(path, 'processed.');
          return grunt.template.process(contents, userConfig);
        }
      });
    });
  });

  grunt.registerTask('default', ['compile']);

  grunt.registerTask('compile', ['clean', 'copy', 'ngmin', 'concat', 'uglify', 'html2js', 'recess', 'index', 'conf']);
  grunt.registerTask('testbuild', ['compile', 'exec:pip', 'exec:testbuild']);
  grunt.registerTask('run', ['exec:pip', 'exec:localrun']);
  grunt.registerTask('package', ['exec:pip', 'exec:npm']);
  grunt.registerTask('install_sphinx', ['exec:install_sphinx']);
  grunt.registerTask('init_config', ['compile', 'package', 'exec:start_sphinx', 'exec:start_nginx', 'exec:reload_supervisor', 'exec:install_crontab', 'exec:crawler_init'])
  grunt.registerTask('config_sphinx', ['exec:stop_sphinx', 'exec:sleep2', 'exec:clean_sphinx', 'exec:start_sphinx']);
  grunt.registerTask('restart', ['exec:stop_nginx', 'compile', 'exec:pip', 'exec:restart_gunicorn', 'exec:start_nginx']);
  grunt.registerTask('restart_sphinx', ['config_sphinx', 'exec:reindex', 'exec:test_sphinx']);
  grunt.registerTask('restart_crawler', ['exec:npm', 'exec:restart_crawler']);

};

