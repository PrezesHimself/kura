import * as fs from 'fs';

export const savePage = (dirName, filePath, responseBuffer) => {
  filePath = filePath.replace(/http[s]?:[\/]{1,2}/gi, '');
  dirName = filePath.match(/(.*)(\/)/gi)[0];
  return new Promise((resolve, reject) =>
    fs.exists(dirName, (exists) => {
      if (exists) {
        fs.writeFile(filePath, responseBuffer, function () {});
        resolve(true);
      } else {
        fs.mkdir(dirName, { recursive: true }, function () {
          fs.writeFile(filePath, responseBuffer, function () {});
          resolve(true);
        });
      }
    })
  );
};
