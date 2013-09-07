
var sha1 = require('sha1');

module.exports = function ( grunt ) {
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-html2js');

  var userConfig = {
    target_dir: 'build',
    product_name: '818717',
  };

  var taskConfig = {
    meta: {
      banner: 
        '/**\n' +
        ' * <%= product_name %>\n' +
        ' * Copyright (c) 2013 \n' +
        ' */\n'
    },

    clean: [ 
      '<%= target_dir %>'
    ],

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
          compress: false,
          mangle: false,
          report: true,
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
      process: function ( contents, path ) {
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

};