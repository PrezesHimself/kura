"use strict";
exports.__esModule = true;
var parseArgv_1 = require("./app/parseArgv");
var prepareApp_1 = require("./app/prepareApp");
var downloadSite_1 = require("./app/downloadSite");
var Queue = require("queue-promise");
var fs = require("fs");
var startTime = new Date();
var resultFileName = "results_" + startTime.getTime() + ".json";
// there is something odd with the typings for queue-promise
//@ts-ignore
var queue = new Queue({
    concurrent: 1
});
prepareApp_1.prepareApp(parseArgv_1.parseArgv(process.argv)).then(function (config) {
    var start = new Date().getTime();
    var resultsMap = {};
    queue.enqueue(config.domains.map(function (domain) {
        return function () {
            return downloadSite_1.downalodSite(domain).then(function (_a) {
                var initialUrl = _a.initialUrl, buffor = _a.buffor;
                var pages = {};
                Object.keys(buffor).forEach(function (key) {
                    var keywordsResults = {};
                    config.keywords.forEach(function (keyword) {
                        var match = buffor[key].match(new RegExp('\b' + keyword, 'gi'));
                        keywordsResults[keyword] = match ? match.length : 0;
                    });
                    pages[key] = keywordsResults;
                });
                resultsMap[initialUrl] = { pages: pages };
                resultsMap[initialUrl]['total'] = Object.values(pages).reduce(function (sum, current) {
                    Object.keys(current).forEach(function (key) { return (sum[key] = (sum[key] || 0) + current[key]); });
                    return sum;
                }, {});
                process.stdout.write('Progress: ' +
                    Math.round((Object.values(resultsMap).length / config.domains.length) * 100) +
                    '%\r');
            });
        };
    }));
    queue.on('end', function () {
        console.log('Whole thing took: ' + (new Date().getTime() - start));
        fs.writeFile(resultFileName, JSON.stringify(resultsMap), function () { });
        // const player = require('play-sound')();
        // player.play('./src/assets/we.mp3', function (err) {
        //   if (err) throw err;
        //   process.exit();
        // });
    });
    process.on('uncaughtException', function (err) {
        console.log('Caught exception: ' + err);
    });
    process.on('exit', function (code) {
        console.log("About to exit with code: " + code);
    });
    process.on('sigint', function (code) {
        console.log("About to exit with code: " + code);
    });
});
