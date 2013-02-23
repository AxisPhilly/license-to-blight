grunt.initConfig({
  compass: {
    dist: {
      options: {
        sassDir: 'sass',
        cssDir: 'www/css',
        environment: 'production'
      }
    }
  }
});

grunt.loadNpmTasks('grunt-contrib-compass');

grunt.registerTask('compass', ['compass']);
grunt.registerTask('default', ['jshint', 'compass']);