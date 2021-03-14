"use strict";
exports.__esModule = true;
exports.readFile = void 0;
var fs = require("fs");
var readFile = function (filePath) {
    return new Promise(function (resolve, reject) {
        return fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve({ data: data, filePath: filePath });
        });
    });
};
exports.readFile = readFile;
