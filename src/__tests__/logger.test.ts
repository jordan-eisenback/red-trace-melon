/**
 * Unit tests for logger.ts (closes #65)
 *
 * The logger is driven by import.meta.env.VITE_LOG_LEVEL and import.meta.env.PROD.
 * We use vi.stubEnv to exercise each code path without touching real console output
 * (console methods are spied on and silenced per test).
 *
 * Also covers the sink abstraction: consoleSink, memorySink, and setSinks().
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { consoleSink, memorySink } from '../app/utils/logger';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Re-import the logger module fresh after env stubs are applied. */
async function freshLogger() {
  vi.resetModules();
  const mod = await import('../app/utils/logger');
  return mod.logger;
}

async function freshLoggerWith(sinks: import('../app/utils/logger').LogSink[]) {
  vi.resetModules();
  const mod = await import('../app/utils/logger');
  const log = mod.createLogger({ sinks });
  return log;
}

// ── setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('logger — prefix format', () => {
  it('prefix contains [RTM][DEBUG] and the scope name', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const log = await freshLogger();
    log.debug('MyScope', 'hello');
    expect(spy).toHaveBeenCalled();
    const firstArg = String(spy.mock.calls[0][0]);
    expect(firstArg).toMatch(/\[RTM\]\[DEBUG\]/);
    expect(firstArg).toContain('MyScope');
  });

  it('prefix for error contains [RTM][ERROR]', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = await freshLogger();
    log.error('ErrScope', 'boom');
    const firstArg = String(spy.mock.calls[0][0]);
    expect(firstArg).toMatch(/\[RTM\]\[ERROR\]/);
  });

  it('prefix includes a timestamp in HH:MM:SS.mmm format', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const log = await freshLogger();
    log.debug('TsScope', 'test');
    const firstArg = String(spy.mock.calls[0][0]);
    expect(firstArg).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\]/);
  });
});

describe('logger — level filtering (dev mode)', () => {
  it('debug() is emitted when level is "debug"', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const log = await freshLogger();
    log.debug('Scope', 'msg');
    expect(spy).toHaveBeenCalled();
  });

  it('debug() is suppressed when level is "info"', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'info');
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const log = await freshLogger();
    log.debug('Scope', 'msg');
    expect(spy).not.toHaveBeenCalled();
  });

  it('info() is emitted when level is "info"', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'info');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = await freshLogger();
    log.info('Scope', 'msg');
    expect(spy).toHaveBeenCalled();
  });

  it('info() is suppressed when level is "warn"', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'warn');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = await freshLogger();
    log.info('Scope', 'msg');
    expect(spy).not.toHaveBeenCalled();
  });

  it('warn() is emitted when level is "warn"', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'warn');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = await freshLogger();
    log.warn('Scope', 'msg');
    expect(spy).toHaveBeenCalled();
  });

  it('warn() is suppressed when level is "error"', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'error');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = await freshLogger();
    log.warn('Scope', 'msg');
    expect(spy).not.toHaveBeenCalled();
  });

  it('error() is always emitted regardless of level', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'error');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = await freshLogger();
    log.error('Scope', 'critical');
    expect(spy).toHaveBeenCalled();
  });
});

describe('logger — extra args forwarded', () => {
  it('passes additional arguments to console.debug', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const log = await freshLogger();
    log.debug('S', 'arg1', 42, { key: 'val' });
    expect(spy.mock.calls[0]).toContain('arg1');
    expect(spy.mock.calls[0]).toContain(42);
  });

  it('passes additional arguments to console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = await freshLogger();
    const err = new Error('oops');
    log.error('S', 'failed', err);
    expect(spy.mock.calls[0]).toContain(err);
  });
});

// ── sink abstraction ──────────────────────────────────────────────────────────

describe('memorySink', () => {
  it('collects entries written to it', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const sink = memorySink();
    const log = await freshLoggerWith([sink]);
    log.info('TestScope', 'hello', 42);
    const entries = sink.entries();
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('info');
    expect(entries[0].scope).toBe('TestScope');
    expect(entries[0].args).toEqual(['hello', 42]);
  });

  it('entries() returns a copy — mutations do not affect internal state', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const sink = memorySink();
    const log = await freshLoggerWith([sink]);
    log.warn('S', 'msg');
    const entries = sink.entries();
    entries.pop();
    expect(sink.entries()).toHaveLength(1);
  });

  it('clear() empties the entry buffer', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const sink = memorySink();
    const log = await freshLoggerWith([sink]);
    log.debug('S', 'a');
    log.debug('S', 'b');
    sink.clear();
    expect(sink.entries()).toHaveLength(0);
  });

  it('captures error entries regardless of level', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'error');
    const sink = memorySink();
    const log = await freshLoggerWith([sink]);
    log.error('S', 'critical');
    expect(sink.entries()[0].level).toBe('error');
  });

  it('does not call console when only memorySink is active', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const sink = memorySink();
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = await freshLoggerWith([sink]);
    log.info('S', 'silent');
    expect(spy).not.toHaveBeenCalled();
  });

  it('entry timestamp is a valid ISO string', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const sink = memorySink();
    const log = await freshLoggerWith([sink]);
    log.debug('S', 'ts');
    expect(new Date(sink.entries()[0].timestamp).getFullYear()).toBeGreaterThanOrEqual(2024);
  });
});

describe('consoleSink', () => {
  it('writes debug to console.debug', () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleSink.write({ level: 'debug', scope: 'S', args: ['hi'], timestamp: new Date().toISOString() });
    expect(spy).toHaveBeenCalled();
  });

  it('writes error to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleSink.write({ level: 'error', scope: 'S', args: ['boom'], timestamp: new Date().toISOString() });
    expect(spy).toHaveBeenCalled();
  });
});

describe('logger.setSinks()', () => {
  it('replaces sinks at runtime — new sink receives subsequent calls', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const log = await freshLogger();
    const sink = memorySink();
    log.setSinks([sink]);
    log.info('S', 'after switch');
    expect(sink.entries()).toHaveLength(1);
    expect(sink.entries()[0].args).toContain('after switch');
  });

  it('old sink no longer receives calls after setSinks()', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug');
    const oldSink = memorySink();
    const log = await freshLoggerWith([oldSink]);
    const newSink = memorySink();
    log.setSinks([newSink]);
    log.info('S', 'new');
    expect(oldSink.entries()).toHaveLength(0);
    expect(newSink.entries()).toHaveLength(1);
  });
});
