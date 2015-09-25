module.exports = function (grunt, options) {
    return {    
        scripts: {
        files: ['../dev_modules/*.js'],
        tasks: ['concat','uglify'],
        options: {
          interrupt: true,
        },
      },
    }
}
