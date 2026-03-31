import { describe, it, expect } from 'vitest';
import generateStoryMapFromEpicsAndStories from '../app/utils/storymapGenerator';
import type { Epic, UserStory } from '../app/types/epic';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeEpic(overrides: Partial<Epic> = {}): Epic {
  return {
    id: 'epic-1',
    title: 'Epic One',
    description: 'First epic',
    requirements: [],
    owner: 'Team A',
    status: 'Backlog',
    priority: 'High',
    ...overrides,
  };
}

function makeStory(overrides: Partial<UserStory> = {}): UserStory {
  return {
    id: 'story-1',
    epicId: 'epic-1',
    title: 'Story One',
    description: 'First story',
    acceptanceCriteria: [],
    requirements: [],
    priority: 'Medium',
    status: 'Backlog',
    ...overrides,
  };
}

// ─── generateStoryMapFromEpicsAndStories ──────────────────────────────────────

describe('generateStoryMapFromEpicsAndStories', () => {
  it('returns a single auto-generated outcome with empty activities for empty inputs', () => {
    const result = generateStoryMapFromEpicsAndStories([], []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('auto-1');
    expect(result[0].activities).toHaveLength(0);
  });

  it('creates one activity per epic with matching epicId', () => {
    const epics = [makeEpic({ id: 'e1', title: 'Epic A' }), makeEpic({ id: 'e2', title: 'Epic B' })];
    const result = generateStoryMapFromEpicsAndStories(epics, []);
    expect(result[0].activities).toHaveLength(2);
    expect(result[0].activities[0].title).toBe('Epic A');
    expect(result[0].activities[1].title).toBe('Epic B');
  });

  it('places stories with a matching epicId into the correct activity', () => {
    const epic = makeEpic({ id: 'e1' });
    const story = makeStory({ id: 's1', epicId: 'e1' });
    const result = generateStoryMapFromEpicsAndStories([epic], [story]);
    const activity = result[0].activities.find(a => a.id === 'e1');
    expect(activity?.steps).toHaveLength(1);
    expect(activity?.steps[0].id).toBe('s1');
    expect(activity?.steps[0].title).toBe('Story One');
  });

  it('places stories without a matching epicId into the Unmapped activity', () => {
    const epic = makeEpic({ id: 'e1' });
    const orphanStory = makeStory({ id: 's-orphan', epicId: 'nonexistent-epic' });
    const result = generateStoryMapFromEpicsAndStories([epic], [orphanStory]);
    const unmapped = result[0].activities.find(a => a.id === 'unmapped');
    expect(unmapped).toBeDefined();
    expect(unmapped?.steps[0].id).toBe('s-orphan');
  });

  it('places stories with no epicId into the Unmapped activity', () => {
    const story = makeStory({ id: 's-no-epic', epicId: '' });
    const result = generateStoryMapFromEpicsAndStories([], [story]);
    const unmapped = result[0].activities.find(a => a.id === 'unmapped');
    expect(unmapped?.steps[0].id).toBe('s-no-epic');
  });

  it('does NOT include the Unmapped activity when all stories are mapped', () => {
    const epic = makeEpic({ id: 'e1' });
    const story = makeStory({ id: 's1', epicId: 'e1' });
    const result = generateStoryMapFromEpicsAndStories([epic], [story]);
    const unmapped = result[0].activities.find(a => a.id === 'unmapped');
    expect(unmapped).toBeUndefined();
  });

  it('sorts steps within an activity by storyPoints ascending', () => {
    const epic = makeEpic({ id: 'e1' });
    const stories = [
      makeStory({ id: 'sA', epicId: 'e1', storyPoints: 5 }),
      makeStory({ id: 'sB', epicId: 'e1', storyPoints: 1 }),
      makeStory({ id: 'sC', epicId: 'e1', storyPoints: 3 }),
    ];
    const result = generateStoryMapFromEpicsAndStories([epic], stories);
    const steps = result[0].activities[0].steps;
    expect(steps[0].id).toBe('sB');
    expect(steps[1].id).toBe('sC');
    expect(steps[2].id).toBe('sA');
  });

  it('respects a custom defaultUnmappedTitle via the config parameter', () => {
    const story = makeStory({ id: 's1', epicId: 'missing' });
    const result = generateStoryMapFromEpicsAndStories([], [story], { defaultUnmappedTitle: 'Backlog' });
    const unmapped = result[0].activities.find(a => a.id === 'unmapped');
    expect(unmapped?.title).toBe('Backlog');
  });

  it('uses "Unmapped" as the default title for unmapped stories', () => {
    const story = makeStory({ id: 's1', epicId: 'missing' });
    const result = generateStoryMapFromEpicsAndStories([], [story]);
    const unmapped = result[0].activities.find(a => a.id === 'unmapped');
    expect(unmapped?.title).toBe('Unmapped');
  });

  it('maps epic description to activity description', () => {
    const epic = makeEpic({ id: 'e1', description: 'My epic description' });
    const result = generateStoryMapFromEpicsAndStories([epic], []);
    expect(result[0].activities[0].description).toBe('My epic description');
  });

  it('creates a step with empty linkedStoryIds for each story', () => {
    const epic = makeEpic({ id: 'e1' });
    const story = makeStory({ id: 's1', epicId: 'e1' });
    const result = generateStoryMapFromEpicsAndStories([epic], [story]);
    const step = result[0].activities[0].steps[0];
    expect(step.linkedStoryIds).toEqual([]);
  });

  it('assigns activities order based on epic array position (1-indexed)', () => {
    const epics = [makeEpic({ id: 'e1' }), makeEpic({ id: 'e2' }), makeEpic({ id: 'e3' })];
    const result = generateStoryMapFromEpicsAndStories(epics, []);
    expect(result[0].activities[0].order).toBe(1);
    expect(result[0].activities[1].order).toBe(2);
    expect(result[0].activities[2].order).toBe(3);
  });

  it('handles stories without storyPoints (order defaults to 0)', () => {
    const epic = makeEpic({ id: 'e1' });
    const stories = [
      makeStory({ id: 'sA', epicId: 'e1' }),
      makeStory({ id: 'sB', epicId: 'e1' }),
    ];
    const result = generateStoryMapFromEpicsAndStories([epic], stories);
    // Should not throw; stories remain in insertion order when all order === 0
    expect(result[0].activities[0].steps).toHaveLength(2);
  });
});
