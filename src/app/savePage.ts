import * as fs from 'fs';

export const savePage = (dirName, filePath, responseBuffer) => {
  filePath =
    filePath.match(/^.*(\.[a-z0-9]{2,3})$/gi) || filePath.endsWith('/')
      ? filePath + '/index.txt'
      : filePath;
  console.log(filePath);
  new Promise((resolve, reject) =>
    fs.exists(dirName, (exists) => {
      console.log(exists, dirName, filePath);
      if (exists) {
        fs.writeFile(filePath, responseBuffer, function () {});
        resolve(true);
      } else {
        fs.mkdir(dirName, function () {
          fs.writeFile(filePath, responseBuffer, function () {});
          resolve(true);
        });
      }
    })
  );
};
