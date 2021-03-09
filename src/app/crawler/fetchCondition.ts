import { log } from '../../services/logger';
import * as url from 'url';

export const addFetchCondition = function (queueItem, next) {
  if (
    queueItem.path.match(
      /\.(css|jpg|jpeg|pdf|docx|js|png|ico|xml|svg|mp3|mp4|gif|exe|swf|woff|eot|ttf)/i
    )
  ) {
    log('SKIPPED: ' + queueItem.path);
    return false;
  }
  if (url.parse(queueItem.url).path === '/') {
    return true;
  }
  return true;
};
