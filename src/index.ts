import { parseArgv } from './app/parseArgv';
import { prepareApp, PreparedArgs } from './app/prepareApp';
import { downalodSite } from './app/downloadSite';
import * as Queue from 'queue-promise';
import * as fs from 'fs';

export interface AppArgs {
  domains: string;
  keywords: string;
}

const startTime = new Date();
const resultFileName = `results_${startTime.getTime()}.json`;

// there is something odd with the typings for queue-promise
//@ts-ignore
const queue = new Queue({
  concurrent: 1,
});

prepareApp(parseArgv<AppArgs>(process.argv)).then((config: PreparedArgs) => {
  const start = new Date().getTime();
  const resultsMap = {};
  queue.enqueue(
    config.domains.map((domain) => () =>
      downalodSite(domain).then(({ initialUrl, buffor }) => {
        const joinedBuffor = buffor.reduce((current, sum) => current + sum, '');
        const keywordsResults = {};
        config.keywords.forEach((keyword) => {
          const match = joinedBuffor.match(new RegExp(keyword, 'gi'));
          keywordsResults[keyword] = match ? match.length : 0;
        });
        resultsMap[initialUrl] = keywordsResults;
        process.stdout.write(
          'Progress: ' +
            Math.round(
              (Object.values(resultsMap).length / config.domains.length) * 100
            ) +
            '%\r'
        );
      })
    )
  );
  queue.on('end', () => {
    console.log('Whole thing took: ' + (new Date().getTime() - start));

    fs.writeFile(resultFileName, JSON.stringify(resultsMap), function () {});
    const player = require('play-sound')();
    player.play('./src/assets/we.mp3', function (err) {
      if (err) throw err;
      process.exit();
    });
  });
  process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    fs.writeFile(resultFileName, JSON.stringify(resultsMap), function () {});
  });
  process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
    fs.writeFile(resultFileName, JSON.stringify(resultsMap), function () {});
  });
  process.on('sigint', (code) => {
    console.log(`About to exit with code: ${code}`);
    fs.writeFile(resultFileName, JSON.stringify(resultsMap), function () {});
  });
});
