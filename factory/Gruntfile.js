module.exports = function (grunt) {  
    //load grunt configs
    var path = require('path');
    require('load-grunt-config')(grunt, {
        configPath: [
            path.join(process.cwd(), 'tasks'),
        ]
    });

    //load tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //register grunt tasks
    grunt.registerTask('default', ['concat','uglify']);  

};