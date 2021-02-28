import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { log } from '../services/logger';
import { savePage } from './savePage';
const Crawler = require('simplecrawler');

export const getFilePath = (queueItem, domain) => {
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
  const filePath = outputDirectory + parsed.pathname;

  // Path to save file
  return [filePath, dirName];
};

export const downalodSite = (domain: string) => {
  const initialUrl = domain;

  return new Promise((resolve, reject) => {
    const buffor = [];
    const myCrawler = new Crawler(initialUrl);
    myCrawler.decodeResponses = true;
    myCrawler.timeout = 5000;
    myCrawler.maxDepth = 2;

    const domain = url.parse(initialUrl).hostname;

    myCrawler.interval = 250;
    myCrawler.maxConcurrency = 5;
    myCrawler.addFetchCondition(function (parsedURL) {
      if (parsedURL.path.match(/\.(css|jpg|pdf|docx|js|png|ico|xml)/i)) {
        log('SKIPPED: ' + parsedURL.path);
        return false;
      }
      return true;
    });

    myCrawler.on('fetchcomplete', function (queueItem, responseBuffer) {
      if (queueItem.stateData.contentType === 'application/pdf') {
        return resolve('');
      }
      buffor.push(responseBuffer);
      const [filePath, dirName] = getFilePath(queueItem, domain);
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
