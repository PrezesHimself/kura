const Crawler = require('simplecrawler');
import { addFetchCondition } from './fetchCondition';
export const createCrawler = (initialUrl) => {
  const crawler = new Crawler(initialUrl);

  crawler.decodeResponses = true;
  crawler.timeout = 5000;
  crawler.maxDepth = 2;
  crawler.interval = 250;
  crawler.maxConcurrency = 5;
  crawler.ignoreWWWDomain = false;
  crawler.scanSubdomains = true;
  crawler.allowInitialDomainChange = true;

  crawler.buffor = {};

  crawler.addFetchCondition(addFetchCondition.bind(crawler));

  return crawler;
};
