const fs = require('fs');

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

import { parseArgv } from './app/parseArgv';
import { prepareApp, PreparedArgs } from './app/prepareApp';
import * as Queue from 'queue-promise';
import { log } from './services/logger';
import { readFile } from './app/readFile';
import { savePage } from './app/savePage';

export interface AppArgs {
  domains: string;
  keywords: string;
}

const startTime = new Date();
const time_string = startTime.getTime();
const result_dir = `results_${startTime.getTime()}`;
const resultFileName = `${result_dir}/results.json`;
const stream = fs.createWriteStream(resultFileName, { flags: 'w' });
stream.write('{');
fs.mkdir(result_dir, () => {});

// there is something odd with the typings for queue-promise
//@ts-ignore
const queue = new Queue({
  concurrent: 1,
});
const glob = require('glob');

prepareApp(parseArgv<AppArgs>(process.argv)).then((config: PreparedArgs) => {
  const start = new Date().getTime();
  queue.enqueue(
    getDirectories('./download').map((dir, index) => {
      return () =>
        new Promise((resolve, reject) => {
          glob('./download/' + dir + '/**/*', { nodir: true }, function (
            er,
            files
          ) {
            Promise.all(
              files.map((file) =>
                readFile(file).then((result) => {
                  log('PARSED ' + dir + ' ' + result.filePath);
                  return result;
                })
              )
            ).then((values) => {
              const resultMap = values.reduce((sum, current) => {
                config.keywords.forEach((key) => {
                  //@ts-ignore
                  const match = (current.data as string).match(
                    new RegExp(key, 'gi')
                  );
                  sum[key] = (sum[key] | 0) + (match ? match.length : 0);
                });
                return sum;
              }, {});

              fs.writeFile(
                result_dir + '/' + dir + '.json',
                JSON.stringify(resultMap),
                function () {
                  stream.write(
                    `"${dir}" : ${JSON.stringify(resultMap)},`,
                    () => {
                      resolve(files);
                      log(
                        'PARSED WHOLE ' +
                          dir +
                          ' and we are using: ' +
                          (Math.round(
                            process.memoryUsage().heapUsed / 1024 / 1024
                          ) *
                            100) /
                            100 +
                          ' MB of memory'
                      );
                    }
                  ); //<-- the place to test
                }
              );
            });
          });
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
      savePage;
      return hrs + 'h ' + mins + 'm ' + secs + 's';
    }
    stream.write(`"totalTime": "${msToTime(new Date().getTime() - start)}"}`);
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
