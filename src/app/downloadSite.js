"use strict";
exports.__esModule = true;
exports.downalodSite = exports.getFilePath = void 0;
var url = require("url");
var path = require("path");
var logger_1 = require("../services/logger");
var savePage_1 = require("./savePage");
var Crawler = require('simplecrawler');
var getFilePath = function (queueItem, domain) {
    // Parse url
    var parsed = url.parse(queueItem.url);
    // Rename / to index.html
    if (parsed.pathname === '/') {
        parsed.pathname = '/index.html';
    }
    // Where to save downloaded data
    var outputDirectory = path.join(__dirname, '../download', domain);
    // Get directory name in order to create any nested dirs
    var dirName = outputDirectory + parsed.pathname.replace(/\/[^/]+$/, '');
    var filePath = outputDirectory + parsed.pathname;
    // Path to save file
    return [filePath, dirName];
};
exports.getFilePath = getFilePath;
var downalodSite = function (domain) {
    var initialUrl = domain;
    return new Promise(function (resolve, reject) {
        var buffor = [];
        var myCrawler = new Crawler(initialUrl);
        myCrawler.decodeResponses = true;
        myCrawler.timeout = 5000;
        myCrawler.maxDepth = 2;
        var domain = url.parse(initialUrl).hostname;
        myCrawler.interval = 250;
        myCrawler.maxConcurrency = 5;
        myCrawler.addFetchCondition(function (parsedURL) {
            if (parsedURL.path.match(/\.(css|jpg|pdf|docx|js|png|ico|xml)/i)) {
                logger_1.log('SKIPPED: ' + parsedURL.path);
                return false;
            }
            return true;
        });
        myCrawler.on('fetchcomplete', function (queueItem, responseBuffer) {
            if (queueItem.stateData.contentType === 'application/pdf') {
                return resolve('');
            }
            buffor.push(responseBuffer);
            var _a = exports.getFilePath(queueItem, domain), filePath = _a[0], dirName = _a[1];
            savePage_1.savePage(dirName, filePath, responseBuffer);
        });
        myCrawler.on('complete', function () {
            resolve({ initialUrl: initialUrl, buffor: buffor });
        });
        myCrawler.on('fetchclienterror', function () {
            logger_1.log('FETCH_CLIENT_ERROR: ' + initialUrl);
        });
        myCrawler.on('fetcherror', function () {
            logger_1.log('FETCH_ERROR: ' + initialUrl);
        });
        myCrawler.on('fetchtimeout', function () {
            logger_1.log('FETCH_TIMEOUT: ' + initialUrl);
        });
        myCrawler.start();
    });
};
exports.downalodSite = downalodSite;
