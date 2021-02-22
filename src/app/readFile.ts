import * as fs from 'fs';

export const readFile = (filePath): Promise<string> => {
  return new Promise((resolve, reject) =>
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        return reject(err);
      }
      resolve(data);
    })
  );
};
