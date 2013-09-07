
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
            dest: '<%= target_dir %>',
            cwd: 'search',
            expand: true
          }
        ]
      },
      nginx: {
        files: [
          { 
            src: [ '**' ],
            dest: '<%= target_dir %>/search/static/',
            cwd: 'search/search/static',
            expand: true
          }
        ]
      }
    },

    html2js: {
      partials: {
        options: {
          base: 'search/search'
        },
        src: [ 'search/search/static/partials/*.html' ],
        dest: '<%= target_dir %>/search/static/js/template_cache.js'
      }
    },

    ngmin: {
      compile: {
        files: [
          {
            src: [ '**/*.js' ],
            cwd: '<%= target_dir %>/search/static/js',
            dest: '<%= target_dir %>/search/static/js',
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
          '<%= target_dir %>/search/static/js/**/*.js', 
          '<%= html2js.partials.dest %>', 
        ],
        dest: '<%= target_dir %>/search/static/js/<%= product_name %>.js'
      }
    },

    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
        },
        files: {
          '<%= target_dir %>/search/static/js/<%= product_name %>.min.js': '<%= concat.compile.dest %>'
        }        
      }
    },

    recess: {
      compile: {
        src: [ '<%= target_dir %>/search/static/css/main.less' ],
        dest: '<%= target_dir %>/search/static/css/<%= product_name %>.min.css',
        options: {
          compile: true,
          compress: true,
        }
      }
    },

    exec: {
      testbuild: {
        command: 'python <%= target_dir %>/manage.py runserver 8001'
      },
      pip: {
        command: 'pip install -r search/requirements.txt'
      },
      npm: {
        command: 'npm install',
        cwd: 'crawler'
      },
      localrun: {
        command: 'python search/manage.py runserver 8001'
      },
      reindex: {
        command: 'python search/manage.py reindex'
      },
      install_searchapi: {
        command: 'python setup.py install',
        cwd: 'indexer'
      },
      test_sphinx: {
        command: "mysql -h <%= index_server %> -P 9217 -e 'show tables; desc steel_package; select count(*) from steel_package;'"
      },
    }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  grunt.registerTask('index', function() {
    var
      index_html = grunt.config('target_dir')+'/search/templates/index.html',
      js_min = grunt.config('target_dir')+'/search/static/js/'+grunt.config('product_name')+'.min.',
      js_min_sha1 = sha1(grunt.file.read(js_min+'js')),
      js_template = grunt.config('target_dir')+'/search/static/js/template_cache.',
      js_template_sha1 = sha1(grunt.file.read(js_template+'js')),
      css_min = grunt.config('target_dir')+'/search/static/css/'+grunt.config('product_name')+'.min.',
      css_min_sha1 = sha1(grunt.file.read(css_min+'css'));

    grunt.file.copy(js_min+'js', js_min+js_min_sha1+'.js');
    grunt.file.copy(js_template+'js', js_template+js_template_sha1+'.js');
    grunt.file.copy(css_min+'css', css_min+css_min_sha1+'.css');

    grunt.file.copy(index_html, index_html, { 
      process: function (contents, path) {
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

    console.log('index.html processed.');
  });

  grunt.registerTask('default', ['compile']);

  grunt.registerTask('compile', ['clean', 'copy', 'ngmin', 'concat', 'uglify', 'html2js', 'recess', 'index']);
  grunt.registerTask('testbuild', ['compile', 'exec:pip', 'exec:testbuild']);
  grunt.registerTask('run', ['exec:pip', 'exec:localrun']);
  grunt.registerTask('upgrade', ['exec:pip', 'exec:npm']);
  grunt.registerTask('install_searchapi', ['exec:install_searchapi']);
  grunt.registerTask('test_sphinx', ['exec:test_sphinx']);
  grunt.registerTask('reindex', ['exec:reindex']);

  grunt.registerTask('stop_nginx', []);
  grunt.registerTask('start_nginx', []);
  grunt.registerTask('stop_nginx', []);
  grunt.registerTask('stop_nginx', []);
  grunt.registerTask('stop_nginx', []);
  grunt.registerTask('stop_nginx', []);
};

