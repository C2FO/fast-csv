/*global module:false*/
module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        exec: {
            removeDocs: "rm -rf docs/*",
            createDocs: 'coddoc -f multi-html -d ./lib --dir ./docs'
        },

        jshint: {
            file: "./lib/*.js",
            options: {
                jshintrc: '.jshintrc'
            }
        },

        it: {
            all: {
                src: 'test/**/*.test.js',
                options: {
                    timeout: 3000, // not fully supported yet
                    reporter: 'spec'
                }
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'it', "exec"]);
    grunt.loadNpmTasks('grunt-it');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-exec');

};
