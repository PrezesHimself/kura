import * as fs from 'fs';

export const readFile = (
  filePath: string
): Promise<{ data: string; filePath: string }> => {
  return new Promise((resolve, reject) =>
    fs.readFile(filePath, 'utf8', function (err, data: string) {
      if (err) {
        return resolve({ data: null, filePath });
      }
      resolve({ data, filePath });
    })
  );
};
