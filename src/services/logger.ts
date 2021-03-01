const logToFile = require('log-to-file');
const startTime = new Date();

const fileName = `log_${startTime.getTime()}.txt`;
export const log = (message: string) => {
  logToFile(message, fileName);
};
