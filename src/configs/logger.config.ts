import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const consoleLog = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    utilities.format.nestLike('App', {
      colors: true,
      prettyPrint: true,
      processId: false,
      appName: true,
    }),
  ),
});

const rotateFile = new DailyRotateFile({
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '50m',
  maxFiles: 20,
  json: true,
  handleExceptions: false,
  dirname: 'logs',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});
export default WinstonModule.createLogger({
  transports: [consoleLog, rotateFile],
});
