import * as url from 'url';
import * as path from 'path';

export const getFilePath = (queueItem, domain) => {
  const parsed = url.parse(queueItem.url);

  if (parsed.pathname === '/') {
    parsed.pathname = '/index.html';
  }

  const outputDirectory = path.join(__dirname, '../../download', domain);
  const dirName = outputDirectory + parsed.pathname.replace(/\/[^/]+$/, '');
  let filePath = outputDirectory + parsed.pathname;

  filePath = filePath.endsWith('/') ? filePath + 'index.txt' : filePath;
  filePath = filePath.match(/^.*(\.[a-z0-9]{2,4})$/gi)
    ? filePath
    : filePath + '/index.txt';
  return [filePath, dirName];
};
