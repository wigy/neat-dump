module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            options: {
            },
            all: {
            files: {
                'neat-dump.min.js': ['neat-dump.js']
            }
            }
        }
    });

    grunt.loadTasks('node_modules/grunt-contrib-uglify/tasks');
    grunt.registerTask('default', ['uglify']);
}
