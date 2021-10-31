import moment = require("moment-timezone");
export enum LogLevel {
  Info = "info",
  Error = "error",
  Log = "log",
  Warn = "warn",
  Trace = "trace",
}

export class Logger {
  constructor(
    private readonly parentLogger?: Logger,
    public additionalLogProps?: any,
  ) {}
  log<T>(level: LogLevel, message: T): void {
    let logObject: any;
    const timestamp = moment.tz("America/Chicago").toISOString();
    if (typeof message === "string") {
      logObject = { message, level };
    } else if (Array.isArray(message)) {
      logObject = {
        messages: message,
        level,
      };
    } else if (!message) {
      logObject = { message: "", level, timestamp };
    } else {
      logObject = message;
    }

    console[level](
      JSON.stringify(
        {
          timestamp,
          ...logObject,
          ...this.getAdditionalLogProps(),
          ...this.getAdditionalContextLogProps(),
          level,
        },
        null,
        2,
      ),
    );
  }

  info<T>(message: T): void {
    this.log(LogLevel.Info, message);
  }

  error<T>(message: T): void {
    this.log(LogLevel.Error, message);
  }

  warn<T>(message: T): void {
    this.log(LogLevel.Warn, message);
  }

  protected getAdditionalLogProps(): any {
    const result = {};
    if (this.additionalLogProps) {
      Object.assign(result, this.additionalLogProps);
    }
    if (this.parentLogger) {
      Object.assign(result, this.parentLogger.getAdditionalLogProps());
    }
    return result;
  }

  protected getAdditionalContextLogProps(): any {
    return {};
  }
}

export const logger = new Logger();
