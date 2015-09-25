module.exports = function (grunt, options) {
    var fs = require('fs');

    var modulesPath = "../dev_modules/";
    var smartjaxPath = "../smartjax.js";
    var headerFile = "fixed_modules/header.js";
    var footerFile = "fixed_modules/footer.js";

    var filesArray = [];

    var files = fs.readdirSync(modulesPath);

    //including the modules
    filesArray.push(headerFile);
    for (var i in files) {
        var currentFile = modulesPath + files[i];
        var stats = fs.statSync(currentFile);
        if (!stats.isDirectory())
            filesArray.push(currentFile);
    }
    filesArray.push(footerFile);

    return {    
        options: {
          separator: '\n\n\n',
        },
        dist: {
          src: filesArray,
          dest: smartjaxPath,
        },
    }
}
