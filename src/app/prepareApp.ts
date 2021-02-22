import { readFile } from './readFile';
import * as os from 'os';
import { AppArgs } from '..';

export interface PreparedArgs {
  domains: string[];
  keywords: string[];
}

export const prepareApp = (appArgs: AppArgs): Promise<PreparedArgs> => {
  if (!appArgs || !appArgs.domains || !appArgs.keywords) {
    throw new Error(`There is something wrong with the parameters ${appArgs}
    use ex. node dist/index.js domains=domains.txt keywords=keywords.txt`);
  }

  return new Promise((resolve, reject) => {
    Promise.all([readFile(appArgs.domains), readFile(appArgs.keywords)]).then(
      function (values) {
        console.log(values[0]);
        resolve({
          domains: values[0].split(os.EOL),
          keywords: values[1].split(os.EOL),
        });
      }
    );
  });
};
