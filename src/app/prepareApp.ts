import { readFile } from './readFile';
import * as os from 'os';
import { AppArgs } from '../download';

export interface PreparedArgs {
  domains: string[];
  keywords: string[];
}

export const prepareApp = (appArgs: AppArgs): Promise<PreparedArgs> => {
  return new Promise((resolve, reject) => {
    Promise.all([
      readFile(appArgs.domains || 'domains.txt'),
      readFile(appArgs.keywords || 'keywords.txt'),
    ]).then(function (values) {
      // console.log(values[0]);
      resolve({
        domains: values[0].data.split(os.EOL),
        keywords: values[1].data.split(os.EOL),
      });
    });
  });
};
