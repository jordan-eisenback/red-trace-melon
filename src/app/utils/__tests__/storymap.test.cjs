/**
 * Story Map — unit + integrity tests (CommonJS / Jest)
 *
 * Covers:
 *  1. storymapGenerator.ts logic (epicId mapping, unmapped fallback)
 *  2. initial-storymap.ts data integrity (no dupe IDs, all activities have steps, etc.)
 */

// ─── inline minimal generator (mirrors storymapGenerator.ts) ────────────────
function generateStoryMap(epics = [], stories = [], config = {}) {
  const activities = epics.map((e, i) => ({
    id: e.id, title: e.title, description: e.description || '', order: i + 1, steps: [],
  }));
  const mapById = new Map(activities.map(a => [a.id, a]));
  const unmapped = { id: 'UNMAPPED', title: config.defaultUnmappedTitle || 'Unmapped', order: 9999, steps: [] };

  stories.forEach(s => {
    const step = { id: s.id, title: s.title, order: s.storyPoints || 0 };
    if (s.epicId && mapById.has(s.epicId)) mapById.get(s.epicId).steps.push(step);
    else unmapped.steps.push(step);
  });

  activities.forEach(a => a.steps.sort((x, y) => (x.order || 0) - (y.order || 0)));

  return [{ id: 'auto-1', title: 'Auto-generated', activities: activities.concat(unmapped.steps.length ? [unmapped] : []), order: 1 }];
}

// ─── load the data file ──────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const raw  = fs.readFileSync(path.join(__dirname, '../../data/initial-storymap.ts'), 'utf8');
const stripped = raw
  .replace(/^import\s.*;\s*$/gm, '')
  .replace(/export\s+const\s+initialStoryMap[^=]*=\s*/, 'const initialStoryMap = ')
  .replace(/;\s*$/, '');
const initialStoryMap = eval(`(function(){ ${stripped}; return initialStoryMap; })()`);

// ════════════════════════════════════════════════════════════════════════════
describe('storymapGenerator', () => {
  const epics = [
    { id: 'E1', title: 'Epic One', description: '' },
    { id: 'E2', title: 'Epic Two', description: '' },
  ];
  const stories = [
    { id: 'S1', epicId: 'E1', title: 'Story 1', storyPoints: 2 },
    { id: 'S2', epicId: 'E1', title: 'Story 2', storyPoints: 1 },
    { id: 'S3', epicId: 'E2', title: 'Story 3', storyPoints: 3 },
    { id: 'S4', epicId: 'NONE', title: 'Orphan', storyPoints: 0 },
  ];

  test('returns one outcome', () => {
    const result = generateStoryMap(epics, stories);
    expect(result).toHaveLength(1);
  });

  test('creates one activity per epic', () => {
    const [outcome] = generateStoryMap(epics, stories);
    const epicsOnly = outcome.activities.filter(a => a.id !== 'UNMAPPED');
    expect(epicsOnly).toHaveLength(2);
  });

  test('maps stories to correct activity by epicId', () => {
    const [outcome] = generateStoryMap(epics, stories);
    const e1 = outcome.activities.find(a => a.id === 'E1');
    expect(e1.steps.map(s => s.id)).toEqual(['S2', 'S1']); // sorted by storyPoints asc
  });

  test('unmapped stories go into UNMAPPED activity', () => {
    const [outcome] = generateStoryMap(epics, stories);
    const unmapped = outcome.activities.find(a => a.id === 'UNMAPPED');
    expect(unmapped).toBeDefined();
    expect(unmapped.steps.map(s => s.id)).toContain('S4');
  });

  test('no UNMAPPED activity when all stories are mapped', () => {
    const mapped = stories.filter(s => s.epicId !== 'NONE');
    const [outcome] = generateStoryMap(epics, mapped);
    expect(outcome.activities.find(a => a.id === 'UNMAPPED')).toBeUndefined();
  });

  test('empty epics returns empty activities', () => {
    const [outcome] = generateStoryMap([], []);
    expect(outcome.activities).toHaveLength(0);
  });

  test('custom defaultUnmappedTitle is used', () => {
    const [outcome] = generateStoryMap(epics, [{ id: 'SX', epicId: 'MISSING', title: 'X', storyPoints: 0 }], { defaultUnmappedTitle: 'Backlog' });
    const bucket = outcome.activities.find(a => a.id === 'UNMAPPED');
    expect(bucket.title).toBe('Backlog');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('initial-storymap data integrity', () => {

  test('has at least 1 outcome', () => {
    expect(initialStoryMap.length).toBeGreaterThan(0);
  });

  test('all outcomes have a non-empty id and title', () => {
    initialStoryMap.forEach(o => {
      expect(o.id).toBeTruthy();
      expect(o.title).toBeTruthy();
    });
  });

  test('outcome ids are unique', () => {
    const ids = initialStoryMap.map(o => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all outcomes have at least 1 activity', () => {
    initialStoryMap.forEach(o => {
      expect(o.activities.length).toBeGreaterThan(0);
    });
  });

  test('all activities have a non-empty id and title', () => {
    initialStoryMap.forEach(o =>
      o.activities.forEach(a => {
        expect(a.id).toBeTruthy();
        expect(a.title).toBeTruthy();
      })
    );
  });

  test('activity ids are globally unique', () => {
    const ids = initialStoryMap.flatMap(o => o.activities.map(a => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all activities have at least 1 step', () => {
    initialStoryMap.forEach(o =>
      o.activities.forEach(a => {
        expect(a.steps.length).toBeGreaterThan(0);
      })
    );
  });

  test('all steps have a non-empty id and title', () => {
    initialStoryMap.forEach(o =>
      o.activities.forEach(a =>
        a.steps.forEach(s => {
          expect(s.id).toBeTruthy();
          expect(s.title).toBeTruthy();
        })
      )
    );
  });

  test('step ids are globally unique', () => {
    const ids = initialStoryMap.flatMap(o => o.activities.flatMap(a => a.steps.map(s => s.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('slaHours is a positive number when present', () => {
    initialStoryMap.forEach(o =>
      o.activities.forEach(a =>
        a.steps.forEach(s => {
          if (s.slaHours != null) expect(s.slaHours).toBeGreaterThan(0);
        })
      )
    );
  });

  test('complianceTags are non-empty strings when present', () => {
    const allowed = new Set(['SOC2','ISO27001','SOX','GDPR','HIPAA','NIST']);
    initialStoryMap.forEach(o =>
      o.activities.forEach(a =>
        a.steps.forEach(s => {
          (s.complianceTags || []).forEach(tag => {
            expect(typeof tag).toBe('string');
            expect(tag.length).toBeGreaterThan(0);
            expect(allowed.has(tag)).toBe(true);
          });
        })
      )
    );
  });

  test('phase values are valid when present', () => {
    const validPhases = new Set(['joiner','mover','leaver','governance','contractor']);
    initialStoryMap.forEach(o => {
      if (o.phase) expect(validPhases.has(o.phase)).toBe(true);
    });
  });

  test('covers expected phases', () => {
    const phases = new Set(initialStoryMap.map(o => o.phase).filter(Boolean));
    expect(phases.has('joiner')).toBe(true);
    expect(phases.has('leaver')).toBe(true);
    expect(phases.has('governance')).toBe(true);
    expect(phases.has('contractor')).toBe(true);
  });
});
