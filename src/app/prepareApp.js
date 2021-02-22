var readFile_1 = require('./readFile');
var os = require('os');
exports.prepareApp = function (appArgs) {
    if (!appArgs || !appArgs.domains || !appArgs.keywords) {
        throw new Error("There is something wrong with the parameters " + appArgs + "\n    use ex. node dist/index.js domains=domains.txt keywords=keywords.txt");
    }
    return new Promise(function (resolve, reject) {
        Promise.all([readFile_1.readFile(appArgs.domains), readFile_1.readFile(appArgs.keywords)]).then(function (values) {
            console.log(values[0]);
            resolve({
                domains: values[0].split(os.EOL),
                keywords: values[1].split(os.EOL)
            });
        });
    });
};
