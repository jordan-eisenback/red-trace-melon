export interface StoryMapStep {
  id: string;
  title: string;
  description?: string;
  requirementId?: string;
  linkedStoryIds?: string[]; // stories linked to this step
  order?: number;
}

export interface StoryMapActivity {
  id: string;
  title: string;
  description?: string;
  steps: StoryMapStep[];
  order?: number;
}

export interface StoryMapOutcome {
  id: string;
  title: string;
  description?: string;
  activities: StoryMapActivity[];
  order?: number;
}

export type StoryMap = StoryMapOutcome[];
