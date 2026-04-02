/**
 * Unit tests for EpicContext (closes part of #41)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { EpicProvider, useEpics } from '../app/contexts/EpicContext';
import type { Epic, UserStory } from '../app/types/epic';

// ── helpers ───────────────────────────────────────────────────────────────────

function makeEpic(overrides: Partial<Epic> = {}): Epic {
  return {
    id: 'epic-test-1',
    title: 'Test Epic',
    description: 'A test epic',
    requirements: [],
    owner: 'Tester',
    status: 'Backlog',
    priority: 'Medium',
    ...overrides,
  };
}

function makeStory(overrides: Partial<UserStory> = {}): UserStory {
  return {
    id: 'story-test-1',
    epicId: 'epic-test-1',
    title: 'Test Story',
    description: 'A test user story',
    acceptanceCriteria: [],
    requirements: [],
    priority: 'Medium',
    status: 'Backlog',
    ...overrides,
  };
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EpicProvider>{children}</EpicProvider>
);

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('EpicContext — epics', () => {
  it('initial state has an epics array', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    expect(Array.isArray(result.current.epics)).toBe(true);
  });

  it('addEpic → epic appears in state', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const epic = makeEpic({ id: 'epic-add-1' });
    act(() => { result.current.addEpic(epic); });
    expect(result.current.epics.some((e) => e.id === 'epic-add-1')).toBe(true);
  });

  it('addEpic → stored epic has the correct title', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const epic = makeEpic({ id: 'epic-add-2', title: 'My New Epic' });
    act(() => { result.current.addEpic(epic); });
    expect(result.current.epics.find((e) => e.id === 'epic-add-2')?.title).toBe('My New Epic');
  });

  it('updateEpic → state reflects the change', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const epic = makeEpic({ id: 'epic-upd-1', title: 'Before' });
    act(() => { result.current.addEpic(epic); });
    act(() => { result.current.updateEpic('epic-upd-1', { ...epic, title: 'After' }); });
    expect(result.current.epics.find((e) => e.id === 'epic-upd-1')?.title).toBe('After');
  });

  it('deleteEpic → epic is removed from state', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const epic = makeEpic({ id: 'epic-del-1' });
    act(() => { result.current.addEpic(epic); });
    act(() => { result.current.deleteEpic('epic-del-1'); });
    expect(result.current.epics.some((e) => e.id === 'epic-del-1')).toBe(false);
  });

  it('deleteEpic → cascades: user stories for that epic are also removed', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const epic = makeEpic({ id: 'epic-cascade' });
    const story = makeStory({ id: 'story-cascade', epicId: 'epic-cascade' });
    act(() => {
      result.current.addEpic(epic);
      result.current.addUserStory(story);
    });
    act(() => { result.current.deleteEpic('epic-cascade'); });
    expect(result.current.userStories.some((s) => s.id === 'story-cascade')).toBe(false);
  });
});

describe('EpicContext — user stories', () => {
  it('addUserStory → story appears in state', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const story = makeStory({ id: 'story-add-1' });
    act(() => { result.current.addUserStory(story); });
    expect(result.current.userStories.some((s) => s.id === 'story-add-1')).toBe(true);
  });

  it('updateUserStory → state reflects the change', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const story = makeStory({ id: 'story-upd-1', title: 'Before' });
    act(() => { result.current.addUserStory(story); });
    act(() => { result.current.updateUserStory('story-upd-1', { ...story, title: 'After' }); });
    expect(result.current.userStories.find((s) => s.id === 'story-upd-1')?.title).toBe('After');
  });

  it('deleteUserStory → story is removed from state', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const story = makeStory({ id: 'story-del-1' });
    act(() => { result.current.addUserStory(story); });
    act(() => { result.current.deleteUserStory('story-del-1'); });
    expect(result.current.userStories.some((s) => s.id === 'story-del-1')).toBe(false);
  });

  it('getStoriesByEpic → returns only stories for the given epic', () => {
    const { result } = renderHook(() => useEpics(), { wrapper });
    const s1 = makeStory({ id: 'story-byepic-1', epicId: 'epic-a' });
    const s2 = makeStory({ id: 'story-byepic-2', epicId: 'epic-a' });
    const s3 = makeStory({ id: 'story-byepic-3', epicId: 'epic-b' });
    act(() => {
      result.current.addUserStory(s1);
      result.current.addUserStory(s2);
      result.current.addUserStory(s3);
    });
    const stories = result.current.getStoriesByEpic('epic-a');
    expect(stories).toHaveLength(2);
    expect(stories.map((s) => s.id)).toEqual(
      expect.arrayContaining(['story-byepic-1', 'story-byepic-2'])
    );
  });

  it('useEpics → throws when used outside of the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useEpics())).toThrow(
      'useEpics must be used within an EpicProvider'
    );
    spy.mockRestore();
  });
});
