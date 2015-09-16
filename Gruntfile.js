module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    babel: {
      options: {
        sourceMaps: false
      },
      lib: {
        files: [
          {
            expand: true,
            src: "lib/**/*.js",
            dest: "dist/",
            ext: ".js"
          }
        ]
      },
      test: {
        files: [
          {
            expand: true,
            src: "test/**/*.js",
            dest: "dist/",
            ext: ".js"
          }
        ]
      }
    },
    clean: {
      lib: ['dist/lib'],
      test: ['dist/test']
    },
    copy: {
      lib: {
        expand: true,
        cwd: 'test/',
        src: ['**/*', '!**/*.js'],
        dest: 'dist/lib'
      },
      test: {
        expand: true,
        cwd: 'test/',
        src: ['**/*', '!**/*.js'],
        dest: 'dist/test'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 5000,
          require: [
            function () {
              var jsdom = require('jsdom');
              // A super simple DOM ready for React to render into
              // Store this DOM and the window in global scope ready for React to access
              global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
              global.window = document.defaultView;
              global.navigator = {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Atom/1.0.2 Chrome/41.0.2272.76 AtomShell/0.22.3 Safari/537.36'
              };
              console.debug = console.log;
            }
          ]
        },
        src: ['dist/test/specs/**/*.js']
      }
    },
    watch: {
      options: {
        interrupt: true,
        livereload: false
      },
      lib: {
        files: 'lib/**/*.js',
        tasks: ['build:lib']
      },
      test: {
        files: ['test/specs/**/*.js', 'lib/**/*.js'],
        tasks: ['test']
      }
    },
    concurrent: {
      test: {
        tasks: ['watch:test'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean', 'copy', 'babel']);
  grunt.registerTask('build:lib', ['clean:lib', 'copy:lib', 'babel:lib']);
  grunt.registerTask('build:test', ['clean:test', 'copy:test', 'babel:test']);
  grunt.registerTask('test', ['build', 'mochaTest']);
  grunt.registerTask('test:watch', ['test', 'concurrent:test']);
};
