import { readFile } from './readFile';
import * as os from 'os';
import { AppArgs } from '..';

export interface PreparedArgs {
  domains: string[];
  keywords: string[];
}

export const prepareApp = async (appArgs: AppArgs): Promise<PreparedArgs> => {
  if (!appArgs || !appArgs.domains || !appArgs.keywords) {
    throw new Error(`There is something wrong with the parameters ${appArgs}`);
  }

  const domains: string = await readFile(appArgs.domains);
  const keywords: string = await readFile(appArgs.keywords);

  return { domains: domains.split(os.EOL), keywords: keywords.split(os.EOL) };
};
