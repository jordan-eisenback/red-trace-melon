import type { Epic, UserStory } from '../types/epic';
import type { StoryMapOutcome, StoryMapActivity, StoryMapStep, GeneratorConfig } from '../types/storymap';

export function generateStoryMapFromEpicsAndStories(epics: Epic[] = [], stories: UserStory[] = [], config: GeneratorConfig = {}): StoryMapOutcome[] {
  const activities: StoryMapActivity[] = epics.map((e, i) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    order: i + 1,
    steps: [],
  }));

  const unmapped: StoryMapActivity = {
    id: 'unmapped',
    title: config.defaultUnmappedTitle || 'Unmapped',
    order: 9999,
    steps: [],
  };

  const activityById = new Map(activities.map(a => [a.id, a]));

  stories.forEach(s => {
    const step: StoryMapStep = {
      id: s.id,
      title: s.title,
      description: s.description,
      requirementId: undefined,
      linkedStoryIds: [],
      order: typeof s.storyPoints === 'number' ? s.storyPoints : undefined,
    };

    if (s.epicId && activityById.has(s.epicId)) {
      activityById.get(s.epicId)!.steps.push(step);
    } else {
      unmapped.steps.push(step);
    }
  });

  // sort steps by order if present
  activities.forEach(a => a.steps.sort((x, y) => (x.order || 0) - (y.order || 0)));
  if (unmapped.steps.length) unmapped.steps.sort((x, y) => (x.order || 0) - (y.order || 0));

  const outcome: StoryMapOutcome = {
    id: 'auto-1',
    title: 'Auto-generated',
    description: 'Generated from epics and stories',
    activities: activities.concat(unmapped.steps.length ? [unmapped] : []),
    order: 1,
  };

  return [outcome];
}

export default generateStoryMapFromEpicsAndStories;
