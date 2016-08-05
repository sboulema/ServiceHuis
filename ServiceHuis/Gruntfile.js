/// <binding AfterBuild='uglify:serviceHuis' />
/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-typedoc");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-git-selective-deploy");

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
        
        copy: {
            nojekyll: {
                src: ".nojekyll", dest: "docs/.nojekyll"
            }
        },

        uglify: {
            serviceHuis: {
                files: {
                    'dist/serviceHuis.min.js': ['dist/serviceHuis.js']
                }
            }
        },
        
        git_deploy: {
            ghPages: {
                options: {
                    url: 'https://github.com/sboulema/ServiceHuis.git',
                    pretend: false, 
                    buildIgnore: false, 
                    remoteBranch: "gh-pages"
                },
                src: 'docs', 
                dst: './docs-temp/' 
            }
        }
    });

    grunt.registerTask("Docs_Generate_Publish", ["typedoc:build", "copy:nojekyll", "git_deploy:ghPages"]);
};