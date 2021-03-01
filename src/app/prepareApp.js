"use strict";
exports.__esModule = true;
exports.prepareApp = void 0;
var readFile_1 = require("./readFile");
var os = require("os");
var prepareApp = function (appArgs) {
    return new Promise(function (resolve, reject) {
        Promise.all([
            readFile_1.readFile(appArgs.domains || 'domains.txt'),
            readFile_1.readFile(appArgs.keywords || 'keywords.txt'),
        ]).then(function (values) {
            // console.log(values[0]);
            resolve({
                domains: values[0].split(os.EOL),
                keywords: values[1].split(os.EOL)
            });
        });
    });
};
exports.prepareApp = prepareApp;
