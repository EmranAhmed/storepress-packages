const CopyPlugin = require("copy-webpack-plugin");
const path       = require('path');
module.exports   = {
    plugins : [
        new CopyPlugin({
            patterns : [
                {from : "src/**/*.scss", to : "styles/"},
            ],
        }),
    ],
};