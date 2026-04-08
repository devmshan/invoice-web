import pino from "pino";
import pretty from "pino-pretty";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  },
  isDev ? pretty({ colorize: true, sync: true }) : undefined,
);

export const securityLogger = logger.child({ module: "security" });
export const auditLogger = logger.child({ module: "audit" });
