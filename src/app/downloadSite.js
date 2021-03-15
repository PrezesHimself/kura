"use strict";
exports.__esModule = true;
exports.downalodSite = void 0;
var logger_1 = require("../services/logger");
var savePage_1 = require("./savePage");
var getFilePath_1 = require("./getFilePath");
var crawler_1 = require("./crawler/crawler");
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
        var crawler = crawler_1.createCrawler(initialUrl);
        crawler.on('fetchcomplete', function (queueItem, responseBuffer) {
            if (queueItem.stateData.contentType === 'application/pdf') {
                return;
            }
            var _a = getFilePath_1.getFilePath(queueItem, domain), filePath = _a[0], dirName = _a[1];
            savePage_1.savePage(dirName, filePath, responseBuffer).then(function () {
                return logger_1.log('DOWNLOADED: ' + filePath);
            });
        }.bind(crawler));
        crawler.on('complete', function () {
            clearInterval(interval);
            var cb = this.wait();
            setTimeout(function () {
                cb();
                resolve({ initialUrl: initialUrl });
                clearTimeout(crawlerTimeout);
            }, 2000);
        }.bind(crawler));
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
        var crawlerTimeout = setTimeout(function () {
            clearInterval(interval);
            logger_1.log('CRAWLER_TIMEOUT: ' + initialUrl);
            crawler.stop();
            resolve({ initialUrl: initialUrl });
        }.bind(crawler), 1000 * 60 * 30);
    });
};
exports.downalodSite = downalodSite;
