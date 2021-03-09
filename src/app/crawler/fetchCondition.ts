import { log } from '../../services/logger';
import * as url from 'url';

export const addFetchCondition = function (queueItem, next) {
  if (
    queueItem.path.match(
      /\.(css|jpg|jpeg|pdf|docx|js|png|ico|xml|svg|mp3|mp4|gif|exe|swf|woff|eot|ttf|ppt|pptx|doc|docx|ogv|dmg|webm|mov|bmp|apk|air|zip|rar|dot|axd|)/i
    )
  ) {
    log('SKIPPED: ' + queueItem.path);
    return false;
  }
  return true;
};
