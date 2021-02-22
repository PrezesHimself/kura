var fs = require('fs');
exports.readFile = function (filePath) {
    return new Promise(function (resolve, reject) {
        return fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};
