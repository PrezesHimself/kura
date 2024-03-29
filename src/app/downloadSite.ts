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
    const crawler = createCrawler(initialUrl);

    crawler.on(
      'fetchcomplete',
      function (queueItem, responseBuffer) {
        if (queueItem.stateData.contentType === 'application/pdf') {
          return;
        }
        const [filePath, dirName] = getFilePath(queueItem, domain);
        savePage(dirName, filePath, responseBuffer).then(() =>
            log('DOWNLOADED: ' + filePath)
        );
      }.bind(crawler)
    );

    crawler.on(
      'complete',
      function () {
        clearInterval(interval);
        const cb = this.wait();
        setTimeout(() => {
          cb();
          resolve({ initialUrl });
          clearTimeout(crawlerTimeout);
        }, 2000);
      }.bind(crawler)
    );

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

    let crawlerTimeout = setTimeout(
      function () {
        clearInterval(interval);
        log('CRAWLER_TIMEOUT: ' + initialUrl);
        crawler.stop();
        resolve({ initialUrl });
      }.bind(crawler),
      1000 * 60 * 30
    );
  });
};
