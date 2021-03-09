import * as url from 'url';
import * as fs from 'fs';

import { log } from '../services/logger';
import { savePage } from './savePage';
import { getFilePath } from './getFilePath';
import { createCrawler } from './crawler/crawler';

export const downalodSite = (domain: string, percent: number) => {
  let count = 0;
  const aminationMap = {
    0: '.  ',
    1: '..  ',
    2: '...',
    3: '  ',
  };
  const initialUrl = domain;

  return new Promise((resolve, reject) => {
    const buffor = {};
    const pathsVisited = [];

    const domain = url.parse(initialUrl).hostname;
    const crawler = createCrawler(initialUrl);

    crawler.addFetchCondition((queueItem, next, callback) => {
      const [filePath, dirName] = getFilePath(queueItem, domain);
      if (
        queueItem.path.match(
          /\.(css|jpg|jpeg|pdf|docx|js|png|ico|xml|svg|mp3|mp4|gif|exe|swf|woff|eot|ttf)/i
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
            // process.stdout.write(aminationMap[(++count % 3) + ''] + '\r');
          }
          return callback();
        }
        return callback(null, true);
      });
    });

    crawler.on('fetchcomplete', function (queueItem, responseBuffer) {
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

    crawler.on('complete', function () {
      clearInterval(interval);
      const cb = this.wait();
      setTimeout(() => {
        cb();
        resolve({ initialUrl, buffor });
      }, 2000);
    });

    crawler.on('fetchclienterror', () => {
      log('FETCH_CLIENT_ERROR: ' + initialUrl);
    });

    crawler.on('fetcherror', () => {
      log('FETCH_ERROR: ' + initialUrl);
    });

    crawler.on('fetchtimeout', () => {
      log('FETCH_TIMEOUT: ' + initialUrl);
    });

    crawler.start();
    let interval = setInterval(() => {
      process.stdout.write(
        'Progress: ' + percent + '% ' + aminationMap[++count % 4] + ' \r'
      );
    }, 500);
  });
};
