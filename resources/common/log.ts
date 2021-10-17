export enum LogLevel {
  Info = "info",
  Error = "error",
  Log = "log",
  Warn = "warn",
  Trace = "trace",
}
export const logger: Record<LogLevel, (msg: any) => void> = {} as any;

for (const val of Object.values(LogLevel)) {
  const logFn = logMessage.bind(null, val);
  logger[val] = logFn;
}

function logMessage(
  level: "info" | "error" | "log" | "warn" | "trace",
  message: any,
) {
  if (typeof message === "string") {
    message = { message, level };
  }
  if (Array.isArray(message)) {
    message = {
      messages: message,
      level,
    };
  }
  if (!message) {
    message = { message: "", level };
  }
  console[level](JSON.stringify({ ...message, level }, null, 2));
}
