const Crawler = require('simplecrawler');

export const createCrawler = (initialUrl) => {
  const crawler = new Crawler(initialUrl);

  crawler.decodeResponses = true;
  crawler.timeout = 5000;
  crawler.maxDepth = 2;
  crawler.interval = 250;
  crawler.maxConcurrency = 5;

  return crawler;
};
