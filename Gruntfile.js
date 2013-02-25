module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compass: {
      dist: {
        options: {
          sassDir: 'sass',
          cssDir: 'www/css',
          environment: 'production'
        }
      }
    },
    jshint: {
      all: ['www/js/app.js']
    },
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'www/js/app.min.js': ['www/js/app.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'compass']);
};