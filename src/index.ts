import { parseArgv } from './app/parseArgv';
import { prepareApp, PreparedArgs } from './app/prepareApp';
import { downalodSite } from './app/downloadSite';
import * as Queue from 'queue-promise';
import * as fs from 'fs';
import { log } from './services/logger';

export interface AppArgs {
  domains: string;
  keywords: string;
}

const startTime = new Date();
const time_string = startTime.getTime();
const result_dir = `results_${startTime.getTime()}`;
const resultFileName = `${result_dir}/results.json`;
fs.mkdir(result_dir, () => {});
// there is something odd with the typings for queue-promise
//@ts-ignore
const queue = new Queue({
  concurrent: 1,
});

prepareApp(parseArgv<AppArgs>(process.argv)).then((config: PreparedArgs) => {
  const start = new Date().getTime();
  const resultsMap = {};
  queue.enqueue(
    config.domains.map((domain, index) => {
      return () =>
        downalodSite(
          domain,
          Math.round((index / config.domains.length) * 100)
        ).then(({ initialUrl, buffor }) => {
          var pages = {};
          Object.keys(buffor).forEach((key) => {
            var keywordsResults = {};
            config.keywords.forEach(function (keyword) {
              var match = buffor[key].match(new RegExp(keyword, 'gi'));
              keywordsResults[keyword] = match ? match.length : 0;
            });
            pages[key] = keywordsResults;
          });

          resultsMap[initialUrl] = { pages };

          resultsMap[initialUrl]['total'] = Object.values(pages).reduce(
            (sum, current) => {
              Object.keys(current).forEach(
                (key) => (sum[key] = (sum[key] || 0) + current[key])
              );
              return sum;
            },
            {}
          );
          const partial_file_name = `${result_dir}/${
            initialUrl.match(/.*\/\/([a-zA-Z0-9|\.|-]*)/)[1]
          }.json`;
          log('SAVING_FILE: ' + partial_file_name);
          fs.writeFile(
            partial_file_name,
            JSON.stringify(resultsMap[initialUrl]),
            function () {
              log('SAVED_FILE: ' + partial_file_name);
            }
          );
        });
    })
  );
  queue.on('end', () => {
    console.log('Whole thing took: ' + (new Date().getTime() - start));

    fs.writeFile(resultFileName, JSON.stringify(resultsMap), function () {
      process.exit(0);
    });
    // const player = require('play-sound')();
    // player.play('./src/assets/we.mp3', function (err) {
    //   if (err) throw err;
    //   process.exit();
    // });
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
