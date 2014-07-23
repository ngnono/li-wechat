'use strict';

module.exports = function (grunt) {
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['lib/**/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'mochaTest:test', 'mochaTest:coverage']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['mochaTest:test', 'mochaTest:coverage']
            }
        },
        // Configure a mochaTest task
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: 2000
                },
                src: ['test/**/*.js']
            },
            coverage: {
                options: {
                    reporter: 'json-cov',
                    require: 'test/blanket',
                    quiet: true,
                    encoding:'utf8',
                    captureFile: 'coverage.json'
                },
                src: ['test/**/*.js']
            }
        },
        blanket: {
            options: {
                debug: true
            },
            files: {
                'test/': ['lib/']
            }
        }
    });

    // Add the grunt-mocha-test tasks.
    grunt.loadNpmTasks('grunt-mocha-test');

    // add the grunt-blanket tasks
    grunt.loadNpmTasks('grunt-blanket');

    // Default task.
    grunt.registerTask('default', 'mochaTest');
    grunt.registerTask('default', ['jshint', 'mochaTest', 'blanket']);

    grunt.registerTask('test', ['mochaTest:test', 'mochaTest:coverage']);

};
