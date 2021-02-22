var url = require('url');
var fs = require('fs');
var path = require('path');
var logger_1 = require('../services/logger');
var Crawler = require('simplecrawler');
exports.getFilePath = function (queueItem, domain) {
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
exports.downalodSite = function (domain) {
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
        myCrawler.on('fetchcomplete', function (queueItem, responseBuffer, response) {
            if (queueItem.stateData.contentType === 'application/pdf') {
                return resolve('');
            }
            buffor.push(responseBuffer);
            var _a = exports.getFilePath(queueItem, domain), filePath = _a[0], dirName = _a[1];
            logger_1.log('DOWNLOADED: ' + filePath);
            // Check if DIR exists
            fs.exists(dirName, function (exists) {
                // If DIR exists, write file
                if (exists) {
                    fs.writeFile(filePath, responseBuffer, function () { });
                }
                else {
                    // Else, recursively create dir using node-fs, then write file
                    fs.mkdir(dirName, function () {
                        fs.writeFile(filePath, responseBuffer, function () { });
                    });
                }
            });
        });
        myCrawler.on('complete', function () {
            resolve({ initialUrl: initialUrl, buffor: buffor });
        });
        myCrawler.on('fetchclienterror', function () {
            logger_1.log('FETCH_CLIENT_ERROR: ' + initialUrl);
            resolve({ initialUrl: initialUrl, buffor: [''] });
        });
        myCrawler.on('fetcherror', function () {
            logger_1.log('FETCH_ERROR: ' + initialUrl);
            resolve({ initialUrl: initialUrl, buffor: [''] });
        });
        myCrawler.on('fetchtimeout', function () {
            logger_1.log('FETCH_TIMEOUT: ' + initialUrl);
            resolve({ initialUrl: initialUrl, buffor: [''] });
        });
        myCrawler.start();
    });
};
