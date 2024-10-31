/* eslint-disable class-methods-use-this */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

// Ref: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const LOG_LEVEL_COLOR_MAP_ON_SERVER = {
  debug: '\x1b[41m', // bg red
  info: '\x1b[36m', // cyan
  warn: '\x1b[33m', // orange
  error: '\x1b[31m', // red
  success: '\x1b[32m', // green
} as const;

const RESET_COLOR_ON_SERVER = '\x1b[0m';

type Scope = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = string | null | undefined | Record<string, any>;

interface LogParams {
  scope: Scope;
  data: Data;
}

interface LogData extends LogParams {
  level: LogLevel;
  timestamp: string;
}

const logLevelColorMap = {
  debug: 'red',
  info: 'aqua',
  warn: 'orange',
  error: 'red',
  success: 'lightgreen',
};

class LoggerHelper {
  private static instance: LoggerHelper;

  private static isDisabled: boolean;

  private constructor() {
    LoggerHelper.isDisabled = false; // Enable for debugging
  }

  public static getInstance(): LoggerHelper {
    if (!LoggerHelper.instance) {
      LoggerHelper.instance = new LoggerHelper();
    }

    return LoggerHelper.instance;
  }

  public disable(): void {
    LoggerHelper.isDisabled = true;
  }

  public enable(): void {
    LoggerHelper.isDisabled = false;
  }

  public debug(scope: Scope, data: Data): void {
    LoggerHelper.log(scope, data, 'debug');
  }

  public info(scope: Scope, data: Data): void {
    LoggerHelper.log(scope, data, 'info');
  }

  public warn(scope: Scope, data: Data): void {
    LoggerHelper.log(scope, data, 'warn');
  }

  public error(scope: Scope, data: Data): void {
    LoggerHelper.log(scope, data, 'error');
  }

  public success(scope: Scope, data: Data): void {
    LoggerHelper.log(scope, data, 'success');
  }

  public static log(scope: Scope, data: Data, level: LogLevel): void {
    if (LoggerHelper.isDisabled) {
      return;
    }

    const logData: LogData = {
      level,
      data,
      scope,
      timestamp: new Date().toISOString(),
    };

    if (typeof window === 'undefined') {
      // on server
      // eslint-disable-next-line no-console
      console.log(
        `${LOG_LEVEL_COLOR_MAP_ON_SERVER[level]}[${
          logData.timestamp
        }] [${logData.level.toUpperCase()}] [${
          logData.scope
        }]${RESET_COLOR_ON_SERVER}`,
        logData.data,
      );
    } else {
      // on client
      // eslint-disable-next-line no-console
      console.log(
        `%c${`[${logData.timestamp}]`.padEnd(
          20,
        )} ${`[${logData.level.toUpperCase()}]`.padEnd(
          8,
        )} ${`[${logData.scope}]`.padEnd(32)}`,
        `color: ${logLevelColorMap[logData.level]}`,
        logData.data,
      );
    }
  }

  public static unsafe__defautPropsLogsRemove() {
    const { error } = console;

    console.error = (...args) => {
      if (/defaultProps/.test(args[0])) return;
      error(...args);
    };
  }
}

LoggerHelper.unsafe__defautPropsLogsRemove();
const logger = LoggerHelper.getInstance();

export default logger;
