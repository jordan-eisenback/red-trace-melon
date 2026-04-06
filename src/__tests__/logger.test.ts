/**
 * Unit tests for logger.ts (closes part of #42)
 *
 * The logger is driven by import.meta.env.VITE_LOG_LEVEL and import.meta.env.PROD.
 * We use vi.stubEnv to exercise each code path without touching real console output
 * (console methods are spied on and silenced per test).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Re-import the logger module fresh after env stubs are applied. */
async function freshLogger() {
  vi.resetModules();
  const mod = await import('../app/utils/logger');
  return mod.logger;
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
