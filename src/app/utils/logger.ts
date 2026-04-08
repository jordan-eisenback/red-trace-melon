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
 *
 * Sink abstraction (closes #65):
 *   By default the logger writes to consoleSink. An optional array of LogSink
 *   can be injected via createLogger({ sinks }) for testing or agent output capture.
 *
 *   Built-in sinks:
 *     consoleSink  — writes to console.* (default behaviour, unchanged)
 *     memorySink() — creates a sink that collects entries into an in-memory array;
 *                    call sink.entries() to retrieve captured logs.
 *
 *   IMPORTANT: Do NOT log sensitive values (API keys, tokens, localStorage secrets,
 *   or user credentials) through this logger. See issue #99.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  scope: string;
  args: unknown[];
  timestamp: string;
}

export interface LogSink {
  write(entry: LogEntry): void;
}

// ---------------------------------------------------------------------------
// Built-in sinks
// ---------------------------------------------------------------------------

/** Default sink — delegates to console.* */
export const consoleSink: LogSink = {
  write({ level, scope, args, timestamp }: LogEntry): void {
    const ts = timestamp.slice(11, 23); // HH:MM:SS.mmm
    const pfx = `[RTM][${level.toUpperCase()}][${ts}] ${scope}:`;
    switch (level) {
      case 'debug': console.debug(pfx, ...args); break;
      case 'info':  console.info(pfx,  ...args); break;
      case 'warn':  console.warn(pfx,  ...args); break;
      case 'error': console.error(pfx, ...args); break;
    }
  },
};

/** Factory — creates a sink that collects entries in memory. */
export function memorySink(): LogSink & { entries(): LogEntry[]; clear(): void } {
  const _entries: LogEntry[] = [];
  return {
    write(entry: LogEntry): void {
      _entries.push(entry);
    },
    entries(): LogEntry[] {
      return [..._entries];
    },
    clear(): void {
      _entries.length = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// Level resolution
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Logger factory
// ---------------------------------------------------------------------------

export interface LoggerOptions {
  /** Sinks to write to. Defaults to [consoleSink]. */
  sinks?: LogSink[];
}

export function createLogger(opts?: LoggerOptions) {
  const sinks = opts?.sinks ?? [consoleSink];

  function emit(level: LogLevel, scope: string, args: unknown[]): void {
    const entry: LogEntry = {
      level,
      scope,
      args,
      timestamp: new Date().toISOString(),
    };
    for (const sink of sinks) sink.write(entry);
  }

  return {
    debug(scope: string, ...args: unknown[]): void {
      if (resolveLevel() > LEVELS.debug) return;
      emit('debug', scope, args);
    },

    info(scope: string, ...args: unknown[]): void {
      if (resolveLevel() > LEVELS.info) return;
      emit('info', scope, args);
    },

    warn(scope: string, ...args: unknown[]): void {
      if (resolveLevel() > LEVELS.warn) return;
      emit('warn', scope, args);
    },

    /** Always emitted regardless of log level. */
    error(scope: string, ...args: unknown[]): void {
      emit('error', scope, args);
    },

    /** Replace the active sinks at runtime (useful for testing). */
    setSinks(nextSinks: LogSink[]): void {
      sinks.length = 0;
      sinks.push(...nextSinks);
    },
  };
}

export const logger = createLogger();
