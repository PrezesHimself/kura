import { parseArgv } from './app/parseArgv';
import { prepareApp, PreparedArgs } from './app/prepareApp';
import { downalodSite } from './app/downloadSite';
import * as Queue from 'queue-promise';
import { log } from './services/logger';

export interface AppArgs {
  domains: string;
  keywords: string;
}

const startTime = new Date();

// there is something odd with the typings for queue-promise
//@ts-ignore
const queue = new Queue({
  concurrent: 1,
});

prepareApp(parseArgv<AppArgs>(process.argv)).then((config: PreparedArgs) => {
  const start = new Date().getTime();
  queue.enqueue(
    config.domains.map((domain, index) => {
      return () =>
        downalodSite(
          domain,
          Math.round((index / config.domains.length) * 100)
        ).then(({ initialUrl }) => {
          log('DONE_DOMAIN: ' + initialUrl);
        });
    })
  );
  queue.on('end', () => {
    function msToTime(s) {
      var ms = s % 1000;
      s = (s - ms) / 1000;
      var secs = s % 60;
      s = (s - secs) / 60;
      var mins = s % 60;
      var hrs = (s - mins) / 60;

      return hrs + 'h ' + mins + 'm ' + secs + 's';
    }
    console.log('Whole thing took: ' + msToTime(new Date().getTime() - start));
  });
  process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
  });
  process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
  });
  process.on('sigint', (code) => {
    console.log(`About to exit with code: ${code}`);
  });
});
