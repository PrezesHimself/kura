import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import Crawler from 'simplecrawler';
import logToFile from 'log-to-file';

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
    // myCrawler.maxDepth = 1;

    const domain = url.parse(initialUrl).hostname;

    myCrawler.interval = 250;
    myCrawler.maxConcurrency = 5;
    myCrawler.addFetchCondition(function (parsedURL) {
      if (parsedURL.path.match(/\.(css|jpg|pdf|docx|js|png|ico|xml)/i)) {
        logToFile('SKIPPED: ' + parsedURL.path, 'log.txt');
        return false;
      }
      return true;
    });

    myCrawler.on('fetchcomplete', function (
      queueItem,
      responseBuffer,
      response
    ) {
      if (queueItem.stateData.contentType === 'application/pdf') {
        return resolve('');
      }
      buffor.push(responseBuffer);
      const [filePath, dirName] = getFilePath(queueItem, domain);
      logToFile('DOWNLOADED: ' + filePath, 'log.txt');
      // Check if DIR exists
      fs.exists(dirName, function (exists) {
        // If DIR exists, write file
        if (exists) {
          fs.writeFile(filePath, responseBuffer, function () {});
        } else {
          // Else, recursively create dir using node-fs, then write file
          fs.mkdir(dirName, function () {
            fs.writeFile(filePath, responseBuffer, function () {});
          });
        }
      });
    });

    myCrawler.on('complete', function () {
      resolve({ initialUrl, buffor });
    });

    myCrawler.on('fetchclienterror', () => {
      console.log('fetchclienterror: ' + initialUrl);
      resolve({ initialUrl, buffor: [''] });
    });

    myCrawler.on('fetcherror', () => {
      console.log('fetcherror: ' + initialUrl);
      resolve({ initialUrl, buffor: [''] });
    });

    myCrawler.on('fetchtimeout', () => {
      console.log('fetcherror: ' + initialUrl);
      resolve({ initialUrl, buffor: [''] });
    });

    myCrawler.start();
  });
};
