"use strict";
exports.__esModule = true;
var parseArgv_1 = require("./app/parseArgv");
var prepareApp_1 = require("./app/prepareApp");
var downloadSite_1 = require("./app/downloadSite");
var Queue = require("queue-promise");
var fs = require("fs");
var startTime = new Date();
var time_string = startTime.getTime();
var result_dir = "results_" + startTime.getTime();
var resultFileName = result_dir + "/results.json";
fs.mkdir(result_dir, function () { });
// there is something odd with the typings for queue-promise
//@ts-ignore
var queue = new Queue({
    concurrent: 1
});
prepareApp_1.prepareApp(parseArgv_1.parseArgv(process.argv)).then(function (config) {
    var start = new Date().getTime();
    var resultsMap = {};
    queue.enqueue(config.domains.map(function (domain, index) {
        return function () {
            return downloadSite_1.downalodSite(domain, Math.round((index / config.domains.length) * 100)).then(function (_a) {
                var initialUrl = _a.initialUrl, buffor = _a.buffor;
                var pages = {};
                Object.keys(buffor).forEach(function (key) {
                    var keywordsResults = {};
                    config.keywords.forEach(function (keyword) {
                        var match = buffor[key].match(new RegExp(keyword, 'gi'));
                        keywordsResults[keyword] = match ? match.length : 0;
                    });
                    pages[key] = keywordsResults;
                });
                resultsMap[initialUrl] = { pages: pages };
                resultsMap[initialUrl]['total'] = Object.values(pages).reduce(function (sum, current) {
                    Object.keys(current).forEach(function (key) { return (sum[key] = (sum[key] || 0) + current[key]); });
                    return sum;
                }, {});
                fs.writeFile(result_dir + "/" + initialUrl.match(/http:\/\/(.*)/)[1] + ".json", JSON.stringify(resultsMap[initialUrl]), function () { });
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
