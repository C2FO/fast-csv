/*global module:false*/
module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            file: "./lib/index.js",
            options: {
                jshintrc: '.jshintrc'
            }
        },

        it: {
            all: {
                src: 'test/**/*.test.js',
                options: {
                    timeout: 3000, // not fully supported yet
                    reporter: 'dotmatrix'
                }
            }
        },
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'it']);
    grunt.loadNpmTasks('grunt-it');
    grunt.loadNpmTasks('grunt-contrib-jshint');

};
