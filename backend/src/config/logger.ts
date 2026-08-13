import pino from "pino";
import type { LoggerOptions } from "pino";
import { pinoHttp } from "pino-http";
import { env } from "./env.js";

const isProduction = env.NODE_ENV === "production";

const loggerOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

if (!isProduction) {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

export const logger = pino(loggerOptions);

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => Boolean(req.url?.startsWith("/health")),
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});
