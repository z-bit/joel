module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  var userConfig = require('./build.config.js');
  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),
    uglify: { // <- make it ugly!!
      dist: {
        files: {
          '<%= dist_target %>.js': '<%= dist_target %>.js'
        }
      }
    },
    ngAnnotate: {
      compile: {
        files: [
          {
            src: ['<%= dist_target %>.js'],
            dest: '<%= dist_target %>.js'
          }
        ]
      }
    },
    concat: {
      dist_js: {
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/src/**/*.js',
          '<%= build_dir %>/templates-app.js',
          'module.suffix',
          '<%= build_dir %>/bundle.js'
        ],
        dest: '<%= dist_target %>.js'
      }
    },
    browserify: {
      build: {
        src: ['src/modules/modules.js'],
        dest: '<%= build_dir %>/bundle.js',
        options: {
          debug: true
        }
      }
    },
    less: {
      build: {
        files: {
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': 'src/less/main.less'
        }
      },
      dist: {
        options: {
          compress: true // minify
        },
        files: {
          '<%= dist_target %>.css': 'src/less/main.less'
        }
      }
    },
    html2js: {
      app: {
        options: {
          base: 'src/app'
        },
        src: ['<%= app_files.atpl %>'],
        dest: '<%= build_dir %>/templates-app.js'
      }
    },
    nodemon: {
      dev: {
        script: 'server/server.js',
        watch: ['server/']
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],

        options: {
          logConcurrentOutput: true
        }
      }
    },
    clean: [
      '<%= build_dir %>'
    ],
    copy: {
      appjs: {
        files: [
          {
            src: ['<%= app_files.js %>'],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      vendorjs: {
        files: [
          {
            src: ['<%= vendor_files.js %>'],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      }
    },
    index: {
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/bundle.js',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= build_dir %>/assets/**/*.css'
        ]
      },
      dist: { // <- we added this!
        dir: '<%= dist_dir %>',
        src: [
          '<%= dist_dir %>/**/*.js',
          '<%= dist_dir %>/**/*.css'
        ]
      }
    },
    watch: {
      jssrc: {
        files: [
          '<%= app_files.js %>'
        ],
        tasks: ['copy:appjs', 'index:build']
      },
      html: {
        files: ['<%= app_files.html %>'],
        tasks: ['index:build']
      },
      tpls: {
        files: ['<%= app_files.atpl %>'],
        tasks: ['html2js', 'index:build']
      },
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['build'],
        options: {
          livereload: false
        }
      },
      less: {
        files: ['src/less/**/*.less'],
        tasks: ['less:build']
      },
      modules: {
        files: 'src/modules/**/*.js',
        tasks: ['browserify']
      }
    }
  };
  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  grunt.registerTask('default', ['build', 'concurrent']);

  grunt.registerTask('build', [
    'clean', 'copy', 'html2js', 'less:build', 'browserify', 'index:build'
  ]);


  grunt.registerTask('dist', [ // <- a new task!
    'build', 'concat', 'ngAnnotate', 'uglify', 'less:dist', 'index:dist'
  ]);

  function filterForExtension(extension, files) {
    var regex = new RegExp('\\.' + extension + '$'),
      dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('dist_dir') + ')\/', 'g');
    return files.filter(function (file) {
      return file.match(regex);
    }).map(function (file) {
      return file.replace(dirRE, '');
    });
  }

  grunt.registerMultiTask('index', 'Process index.html template', function () {

    var jsFiles = filterForExtension('js', this.filesSrc);
    var cssFiles = filterForExtension('css', this.filesSrc);

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function (contents, path) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config('pkg.version')
          }
        });
      }
    });
  });
};