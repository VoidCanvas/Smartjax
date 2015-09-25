module.exports = function (grunt, options) {
    return {    
        scripts: {
        files: ['../dev_modules/*.js'],
        tasks: ['concat'],
        options: {
          interrupt: true,
        },
      },
    }
}
