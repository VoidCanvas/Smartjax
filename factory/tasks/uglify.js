module.exports = function (grunt, options) {
    
    var filesConfig = {
        "../smartjax.min.js": [
            "../smartjax.js"
        ]
    };

    return {
        options: {
            compress: true
        },
        my_target: {
            files:filesConfig
        }
    }
}

