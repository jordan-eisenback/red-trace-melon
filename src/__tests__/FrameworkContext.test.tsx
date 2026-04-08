/**
 * Unit tests for FrameworkContext (closes part of #41)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FrameworkProvider, useFrameworks } from '../app/contexts/FrameworkContext';
import type { Framework, Control } from '../app/types/framework';
import { withProviders } from './test-utils';

// ── helpers ───────────────────────────────────────────────────────────────────

function makeFramework(overrides: Partial<Framework> = {}): Framework {
  return {
    id: 'fw-test-1',
    name: 'Test Framework',
    version: '1.0',
    description: 'A test framework',
    category: 'Compliance',
    controls: [],
    isActive: true,
    ...overrides,
  };
}

function makeControl(overrides: Partial<Control> = {}): Control {
  return {
    id: 'ctrl-test-1',
    frameworkId: 'fw-test-1',
    controlId: 'TC-1',
    title: 'Test Control',
    description: 'A test control',
    requirements: [],
    ...overrides,
  };
}

const wrapper = withProviders(({ children }) => (
  <FrameworkProvider>{children}</FrameworkProvider>
));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('FrameworkContext', () => {
  it('starts with an array of frameworks (seed data or empty)', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    expect(Array.isArray(result.current.frameworks)).toBe(true);
  });

  it('addFramework → framework appears in state', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-add-1', name: 'Added FW' });
    act(() => { result.current.addFramework(fw); });
    expect(result.current.frameworks.some((f) => f.id === 'fw-add-1')).toBe(true);
  });

  it('addFramework → stored framework has the correct name', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-add-2', name: 'NIST CSF' });
    act(() => { result.current.addFramework(fw); });
    expect(result.current.frameworks.find((f) => f.id === 'fw-add-2')?.name).toBe('NIST CSF');
  });

  it('updateFramework → state reflects the change', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-upd-1', name: 'Original Name' });
    act(() => { result.current.addFramework(fw); });
    act(() => {
      result.current.updateFramework('fw-upd-1', { ...fw, name: 'Updated Name' });
    });
    expect(result.current.frameworks.find((f) => f.id === 'fw-upd-1')?.name).toBe('Updated Name');
  });

  it('deleteFramework → framework is removed from state', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-del-1' });
    act(() => { result.current.addFramework(fw); });
    act(() => { result.current.deleteFramework('fw-del-1'); });
    expect(result.current.frameworks.some((f) => f.id === 'fw-del-1')).toBe(false);
  });

  it('addControl → control appears inside the framework', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-ctrl-1' });
    const ctrl = makeControl({ id: 'ctrl-add-1', frameworkId: 'fw-ctrl-1' });
    act(() => { result.current.addFramework(fw); });
    act(() => { result.current.addControl('fw-ctrl-1', ctrl); });
    const controls = result.current.getControlsByFramework('fw-ctrl-1');
    expect(controls.some((c) => c.id === 'ctrl-add-1')).toBe(true);
  });

  it('updateControl → control title is changed', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-ctrl-2' });
    const ctrl = makeControl({ id: 'ctrl-upd-1', frameworkId: 'fw-ctrl-2', title: 'Old Title' });
    act(() => { result.current.addFramework(fw); });
    act(() => { result.current.addControl('fw-ctrl-2', ctrl); });
    act(() => {
      result.current.updateControl('fw-ctrl-2', 'ctrl-upd-1', { ...ctrl, title: 'New Title' });
    });
    const updated = result.current.getControlsByFramework('fw-ctrl-2').find((c) => c.id === 'ctrl-upd-1');
    expect(updated?.title).toBe('New Title');
  });

  it('deleteControl → control is removed from framework', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-ctrl-3' });
    const ctrl = makeControl({ id: 'ctrl-del-1', frameworkId: 'fw-ctrl-3' });
    act(() => { result.current.addFramework(fw); });
    act(() => { result.current.addControl('fw-ctrl-3', ctrl); });
    act(() => { result.current.deleteControl('fw-ctrl-3', 'ctrl-del-1'); });
    expect(result.current.getControlsByFramework('fw-ctrl-3').some((c) => c.id === 'ctrl-del-1')).toBe(false);
  });

  it('addRequirementToControl → requirementId is added to control.requirements', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-map-1' });
    const ctrl = makeControl({ id: 'ctrl-map-1', frameworkId: 'fw-map-1' });
    act(() => { result.current.addFramework(fw); });
    act(() => { result.current.addControl('fw-map-1', ctrl); });
    act(() => {
      result.current.addRequirementToControl('fw-map-1', 'ctrl-map-1', 'req-x');
    });
    const c = result.current.getControlsByFramework('fw-map-1').find((c) => c.id === 'ctrl-map-1');
    expect(c?.requirements).toContain('req-x');
  });

  it('addRequirementToControl → does not add duplicate requirementIds', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-map-2' });
    const ctrl = makeControl({ id: 'ctrl-map-2', frameworkId: 'fw-map-2' });
    act(() => { result.current.addFramework(fw); });
    act(() => { result.current.addControl('fw-map-2', ctrl); });
    act(() => {
      result.current.addRequirementToControl('fw-map-2', 'ctrl-map-2', 'req-dup');
      result.current.addRequirementToControl('fw-map-2', 'ctrl-map-2', 'req-dup');
    });
    const c = result.current.getControlsByFramework('fw-map-2').find((c) => c.id === 'ctrl-map-2');
    expect(c?.requirements.filter((r) => r === 'req-dup')).toHaveLength(1);
  });

  it('removeRequirementFromControl → requirementId is removed', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    const fw = makeFramework({ id: 'fw-map-3' });
    const ctrl = makeControl({ id: 'ctrl-map-3', frameworkId: 'fw-map-3' });
    act(() => { result.current.addFramework(fw); });
    act(() => { result.current.addControl('fw-map-3', ctrl); });
    act(() => { result.current.addRequirementToControl('fw-map-3', 'ctrl-map-3', 'req-rm'); });
    act(() => { result.current.removeRequirementFromControl('fw-map-3', 'ctrl-map-3', 'req-rm'); });
    const c = result.current.getControlsByFramework('fw-map-3').find((c) => c.id === 'ctrl-map-3');
    expect(c?.requirements).not.toContain('req-rm');
  });

  it('getControlsByFramework → returns empty array for unknown frameworkId', () => {
    const { result } = renderHook(() => useFrameworks(), { wrapper });
    expect(result.current.getControlsByFramework('does-not-exist')).toEqual([]);
  });

  it('useFrameworks → throws when used outside of the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useFrameworks())).toThrow(
      'useFrameworks must be used within a FrameworkProvider'
    );
    spy.mockRestore();
  });
});
