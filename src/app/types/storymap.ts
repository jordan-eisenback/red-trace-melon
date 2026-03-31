export interface StoryMapStep {
  id: string;
  title: string;
  description?: string;
  requirementId?: string;
  linkedStoryIds?: string[];
  order?: number;
  complianceTags?: string[];  // e.g. ['SOC2', 'ISO27001', 'SOX']
  slaHours?: number;          // provisioning SLA in hours
}

export interface StoryMapActivity {
  id: string;
  title: string;
  description?: string;
  steps: StoryMapStep[];
  order?: number;
  persona?: string;           // e.g. 'IT Admin', 'HR', 'Manager', 'Employee'
}

export interface StoryMapOutcome {
  id: string;
  title: string;
  description?: string;
  activities: StoryMapActivity[];
  order?: number;
  phase?: 'joiner' | 'mover' | 'leaver' | 'governance' | 'contractor' | 'platform';
}

export type StoryMap = StoryMapOutcome[];

export type GeneratorConfig = {
  defaultUnmappedTitle?: string;
};
