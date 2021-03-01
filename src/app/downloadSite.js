"use strict";
exports.__esModule = true;
exports.downalodSite = void 0;
var url = require("url");
var fs = require("fs");
var logger_1 = require("../services/logger");
var savePage_1 = require("./savePage");
var getFilePath_1 = require("./getFilePath");
var Crawler = require('simplecrawler');
var downalodSite = function (domain, percent) {
    var count = 0;
    var aminationMap = {
        0: '.  ',
        1: '..  ',
        2: '...',
        3: '  '
    };
    var initialUrl = domain;
    return new Promise(function (resolve, reject) {
        var buffor = {};
        var pathsVisited = [];
        var crawler = new Crawler(initialUrl);
        crawler.decodeResponses = true;
        crawler.timeout = 5000;
        crawler.maxDepth = 2;
        var domain = url.parse(initialUrl).hostname;
        crawler.interval = 250;
        crawler.maxConcurrency = 5;
        crawler.addFetchCondition(function (queueItem, next, callback) {
            var _a = getFilePath_1.getFilePath(queueItem, domain), filePath = _a[0], dirName = _a[1];
            if (queueItem.path.match(/\.(css|jpg|jpeg|pdf|docx|js|png|ico|xml|svg|mp3|gif|exe|swf|woff|eot|ttf)/i)) {
                logger_1.log('SKIPPED: ' + queueItem.path);
                return callback();
            }
            if (url.parse(queueItem.url).path === '/') {
                return callback(null, true);
            }
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (!err) {
                    if (!pathsVisited.includes(filePath)) {
                        pathsVisited.push(filePath);
                        logger_1.log('ALREADY_EXISTED: ' + filePath);
                        buffor[queueItem.url] = data;
                        // process.stdout.write(aminationMap[(++count % 3) + ''] + '\r');
                    }
                    return callback();
                }
                return callback(null, true);
            });
        });
        crawler.on('fetchcomplete', function (queueItem, responseBuffer) {
            if (queueItem.stateData.contentType === 'application/pdf' ||
                pathsVisited.includes(queueItem.url)) {
                return;
            }
            buffor[queueItem.url] = responseBuffer;
            var _a = getFilePath_1.getFilePath(queueItem, domain), filePath = _a[0], dirName = _a[1];
            logger_1.log('DOWNLOADED: ' + filePath);
            pathsVisited.push(queueItem.url);
            savePage_1.savePage(dirName, filePath, responseBuffer);
        });
        crawler.on('complete', function () {
            clearInterval(interval);
            var cb = this.wait();
            setTimeout(function () {
                cb();
                resolve({ initialUrl: initialUrl, buffor: buffor });
            }, 2000);
        });
        crawler.on('fetchclienterror', function () {
            logger_1.log('FETCH_CLIENT_ERROR: ' + initialUrl);
        });
        crawler.on('fetcherror', function () {
            logger_1.log('FETCH_ERROR: ' + initialUrl);
        });
        crawler.on('fetchtimeout', function () {
            logger_1.log('FETCH_TIMEOUT: ' + initialUrl);
        });
        crawler.start();
        var interval = setInterval(function () {
            process.stdout.write('Progress: ' + percent + '% ' + aminationMap[++count % 4] + ' \r');
        }, 500);
    });
};
exports.downalodSite = downalodSite;
