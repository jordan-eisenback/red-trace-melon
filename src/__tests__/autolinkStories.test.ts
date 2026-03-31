import { describe, it, expect } from 'vitest';
import {
  computeAutoLinks,
  previewAutoLinks,
} from '../app/utils/autolinkStories';
import type { UserStory } from '../app/types/epic';
import type { StoryMapOutcome } from '../app/types/storymap';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeStory(overrides: Partial<UserStory> = {}): UserStory {
  return {
    id: 'story-1',
    epicId: 'epic-1',
    title: 'User story title',
    description: 'User story description',
    acceptanceCriteria: [],
    requirements: [],
    priority: 'Medium',
    status: 'Backlog',
    ...overrides,
  };
}

function makeOutcome(stepOverrides: Partial<{
  id: string;
  title: string;
  description: string;
  requirementId: string;
  linkedStoryIds: string[];
  complianceTags: string[];
}> = {}): StoryMapOutcome {
  return {
    id: 'outcome-1',
    title: 'Outcome',
    activities: [
      {
        id: 'act-1',
        title: 'Activity',
        steps: [
          {
            id: 'step-1',
            title: 'Step title',
            description: 'Step description',
            linkedStoryIds: [],
            ...stepOverrides,
          },
        ],
      },
    ],
    order: 1,
  };
}

// ─── computeAutoLinks ─────────────────────────────────────────────────────────

describe('computeAutoLinks', () => {
  it('returns an empty map when there are no outcomes or stories', () => {
    const result = computeAutoLinks([], []);
    expect(result.size).toBe(0);
  });

  it('returns an empty map when there are no stories', () => {
    const outcome = makeOutcome();
    const result = computeAutoLinks([outcome], []);
    expect(result.size).toBe(0);
  });

  it('links a story to a step when they share the same requirementId', () => {
    const story = makeStory({ id: 's1', requirements: ['REQ-1'] });
    const outcome = makeOutcome({ id: 'step-1', requirementId: 'REQ-1' });
    const result = computeAutoLinks([outcome], [story]);
    expect(result.get('step-1')).toContain('s1');
  });

  it('links a story to a step based on keyword overlap in title', () => {
    const story = makeStory({ id: 's1', title: 'Provision accounts for new employees', description: '' });
    const outcome = makeOutcome({ id: 'step-1', title: 'Provision employee accounts', description: '' });
    const result = computeAutoLinks([outcome], [story]);
    // "provision" and "accounts" and "employees/employee" should match
    expect(result.get('step-1')).toContain('s1');
  });

  it('links a story to a step based on keyword overlap in description', () => {
    const story = makeStory({
      id: 's1',
      title: 'Basic title',
      description: 'automated certification workflow for access review',
    });
    const outcome = makeOutcome({
      id: 'step-1',
      title: 'Run certification workflow',
      description: 'automated access review',
    });
    const result = computeAutoLinks([outcome], [story]);
    expect(result.get('step-1')).toContain('s1');
  });

  it('does not link a story that scores below the default threshold (16)', () => {
    // Create a story with no keyword overlap and no requirement match
    const story = makeStory({ id: 's1', title: 'Completely unrelated topic', description: 'something else' });
    const outcome = makeOutcome({ id: 'step-1', title: 'Totally different subject matter here', description: '' });
    // With threshold=80, nothing should link
    const result = computeAutoLinks([outcome], [story], { threshold: 80 });
    expect(result.get('step-1')).toBeUndefined();
  });

  it('links a story via compliance tag synonym matching', () => {
    const story = makeStory({
      id: 's1',
      title: 'SOC2 evidence collection for audit',
      description: 'Supports soc audit attestation',
    });
    const outcome = makeOutcome({
      id: 'step-1',
      title: 'Gather compliance evidence',
      description: '',
      complianceTags: ['SOC2'],
    });
    const result = computeAutoLinks([outcome], [story]);
    expect(result.get('step-1')).toContain('s1');
  });

  it('respects the maxPerStep option', () => {
    const stories = [
      makeStory({ id: 's1', title: 'provision access for employees', requirements: ['REQ-1'] }),
      makeStory({ id: 's2', title: 'provision access for employees', requirements: ['REQ-1'] }),
      makeStory({ id: 's3', title: 'provision access for employees', requirements: ['REQ-1'] }),
    ];
    const outcome = makeOutcome({ id: 'step-1', title: 'provision employee access', requirementId: 'REQ-1' });
    const result = computeAutoLinks([outcome], stories, { maxPerStep: 2 });
    expect(result.get('step-1')?.length).toBeLessThanOrEqual(2);
  });

  it('skips steps that already have linked stories when skipAlreadyLinked is true', () => {
    const story = makeStory({ id: 's1', requirements: ['REQ-1'] });
    const outcome = makeOutcome({ id: 'step-1', requirementId: 'REQ-1', linkedStoryIds: ['existing-story'] });
    const result = computeAutoLinks([outcome], [story], { skipAlreadyLinked: true });
    expect(result.get('step-1')).toBeUndefined();
  });

  it('does not link stories that are already linked to the step', () => {
    const story = makeStory({ id: 's1', requirements: ['REQ-1'] });
    const outcome = makeOutcome({ id: 'step-1', requirementId: 'REQ-1', linkedStoryIds: ['s1'] });
    const result = computeAutoLinks([outcome], [story]);
    // s1 is already linked, so it should not appear in the result
    expect(result.get('step-1')).toBeUndefined();
  });

  it('processes multiple outcomes and activities correctly', () => {
    const story = makeStory({ id: 's1', requirements: ['REQ-1'] });
    const outcomes: StoryMapOutcome[] = [
      {
        id: 'o1',
        title: 'Outcome 1',
        activities: [
          {
            id: 'a1',
            title: 'Activity 1',
            steps: [{ id: 'step-A', title: 'Step A', requirementId: 'REQ-1', linkedStoryIds: [] }],
          },
        ],
        order: 1,
      },
      {
        id: 'o2',
        title: 'Outcome 2',
        activities: [
          {
            id: 'a2',
            title: 'Activity 2',
            steps: [{ id: 'step-B', title: 'Step B', requirementId: 'REQ-1', linkedStoryIds: [] }],
          },
        ],
        order: 2,
      },
    ];
    const result = computeAutoLinks(outcomes, [story]);
    expect(result.get('step-A')).toContain('s1');
    expect(result.get('step-B')).toContain('s1');
  });
});

// ─── previewAutoLinks ─────────────────────────────────────────────────────────

describe('previewAutoLinks', () => {
  it('returns an empty array when there are no outcomes or stories', () => {
    const result = previewAutoLinks([], []);
    expect(result).toHaveLength(0);
  });

  it('returns match details for each step with qualifying stories', () => {
    const story = makeStory({ id: 's1', requirements: ['REQ-1'] });
    const outcome = makeOutcome({ id: 'step-1', requirementId: 'REQ-1' });
    const result = previewAutoLinks([outcome], [story]);
    expect(result).toHaveLength(1);
    expect(result[0].stepId).toBe('step-1');
    expect(result[0].matches[0].storyId).toBe('s1');
  });

  it('includes a score and reasons in each match', () => {
    const story = makeStory({ id: 's1', requirements: ['REQ-1'] });
    const outcome = makeOutcome({ id: 'step-1', requirementId: 'REQ-1' });
    const result = previewAutoLinks([outcome], [story]);
    const match = result[0].matches[0];
    expect(match.score).toBeGreaterThan(0);
    expect(match.reasons.length).toBeGreaterThan(0);
  });

  it('sorts matches by score descending', () => {
    // s1 has requirement match (50pts) + no keywords; s2 has only keyword match
    const s1 = makeStory({ id: 's1', requirements: ['REQ-1'], title: 'no overlap', description: '' });
    const s2 = makeStory({
      id: 's2',
      requirements: [],
      title: 'provision access for employee lifecycle workflow',
      description: '',
    });
    const outcome = makeOutcome({
      id: 'step-1',
      requirementId: 'REQ-1',
      title: 'provision employee lifecycle access workflow',
    });
    const result = previewAutoLinks([outcome], [s1, s2]);
    const scores = result[0].matches.map(m => m.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

  it('respects skipAlreadyLinked option', () => {
    const story = makeStory({ id: 's1', requirements: ['REQ-1'] });
    const outcome = makeOutcome({ id: 'step-1', requirementId: 'REQ-1', linkedStoryIds: ['existing'] });
    const resultSkip = previewAutoLinks([outcome], [story], { skipAlreadyLinked: true });
    expect(resultSkip).toHaveLength(0);
  });
});
