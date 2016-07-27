/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typedoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        typedoc: {
            build: {
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    out: 'docs/',
                    name: 'ServiceHuis'
                },
                src: 'serviceHuis.ts'
            }
        },
        uglify: {
            serviceHuis: {
                files: {
                    'dist/serviceHuis.min.js': ['dist/serviceHuis.js']
                }
            }
        }
    });
};