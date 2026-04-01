/**
 * RTM Frontend Logger
 *
 * A thin wrapper around console.* gated by the VITE_LOG_LEVEL env var.
 *
 * Log levels (in ascending priority):
 *   debug < info < warn < error
 *
 * In production builds, only warn and error are emitted.
 * In development builds, the level defaults to 'debug' unless VITE_LOG_LEVEL overrides it.
 *
 * Usage:
 *   import { logger } from '@/app/utils/logger';
 *   logger.info('RequirementsContext', 'Loaded %d requirements', reqs.length);
 *   logger.error('ExcelExport', 'Export failed', err);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function resolveLevel(): number {
  // In production builds suppress debug and info by default
  if (import.meta.env.PROD) {
    const override = import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined;
    return LEVELS[override ?? 'warn'] ?? LEVELS.warn;
  }
  const override = import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined;
  return LEVELS[override ?? 'debug'] ?? LEVELS.debug;
}

function prefix(level: LogLevel, scope: string): string {
  const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  return `[RTM][${level.toUpperCase()}][${ts}] ${scope}:`;
}

function createLogger() {
  return {
    debug(scope: string, ...args: unknown[]): void {
      if (resolveLevel() > LEVELS.debug) return;
      console.debug(prefix('debug', scope), ...args);
    },

    info(scope: string, ...args: unknown[]): void {
      if (resolveLevel() > LEVELS.info) return;
      console.info(prefix('info', scope), ...args);
    },

    warn(scope: string, ...args: unknown[]): void {
      if (resolveLevel() > LEVELS.warn) return;
      console.warn(prefix('warn', scope), ...args);
    },

    /** Always emitted regardless of log level. */
    error(scope: string, ...args: unknown[]): void {
      console.error(prefix('error', scope), ...args);
    },
  };
}

export const logger = createLogger();
