import * as url from 'url';
import * as fs from 'fs';

import { log } from '../services/logger';
import { savePage } from './savePage';
import { getFilePath } from './getFilePath';
const Crawler = require('simplecrawler');

export const downalodSite = (domain: string) => {
  const initialUrl = domain;

  return new Promise((resolve, reject) => {
    const buffor = {};
    const pathsVisited = [];
    const myCrawler = new Crawler(initialUrl);
    myCrawler.decodeResponses = true;
    myCrawler.timeout = 5000;
    // myCrawler.maxDepth = 2;

    const domain = url.parse(initialUrl).hostname;

    myCrawler.interval = 250;
    myCrawler.maxConcurrency = 5;

    myCrawler.addFetchCondition((queueItem, next, callback) => {
      const [filePath, dirName] = getFilePath(queueItem, domain);
      if (
        queueItem.path.match(
          /\.(css|jpg|jpeg|pdf|docx|js|png|ico|xml|svg|mp3|gif|exe|swf|woff|eot|ttf)/i
        )
      ) {
        log('SKIPPED: ' + queueItem.path);
        return callback();
      }

      if (url.parse(queueItem.url).path === '/') {
        return callback(null, true);
      }
      fs.readFile(filePath, 'utf8', function (err, data) {
        if (!err) {
          if (!pathsVisited.includes(filePath)) {
            pathsVisited.push(filePath);
            log('ALREADY_EXISTED: ' + filePath);
            buffor[queueItem.url] = data;
          }
          return callback();
        }
        return callback(null, true);
      });
    });

    myCrawler.on('fetchcomplete', function (queueItem, responseBuffer) {
      if (
        queueItem.stateData.contentType === 'application/pdf' ||
        pathsVisited.includes(queueItem.url)
      ) {
        return;
      }
      buffor[queueItem.url] = responseBuffer;
      const [filePath, dirName] = getFilePath(queueItem, domain);
      log('DOWNLOADED: ' + filePath);
      pathsVisited.push(queueItem.url);
      savePage(dirName, filePath, responseBuffer);
    });

    myCrawler.on('complete', function () {
      resolve({ initialUrl, buffor });
    });

    myCrawler.on('fetchclienterror', () => {
      log('FETCH_CLIENT_ERROR: ' + initialUrl);
    });

    myCrawler.on('fetcherror', () => {
      log('FETCH_ERROR: ' + initialUrl);
    });

    myCrawler.on('fetchtimeout', () => {
      log('FETCH_TIMEOUT: ' + initialUrl);
    });

    myCrawler.start();
  });
};
