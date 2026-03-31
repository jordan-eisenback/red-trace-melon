export interface WorkstreamActivity {
  id: string;
  title: string;
  description?: string;
  status?: 'not-started' | 'in-progress' | 'complete' | 'blocked';
  order?: number;
}

export interface WorkstreamDependency {
  /** ID of the workstream that must come first */
  fromId: string;
  /** ID of the workstream that depends on it */
  toId: string;
  /** Why this dependency exists */
  rationale?: string;
}

export type WorkstreamLayer =
  | 'foundational'
  | 'identity'
  | 'application'
  | 'tooling'
  | 'delivery';

export interface Workstream {
  id: string;
  order: number;
  title: string;
  description: string;
  layer: WorkstreamLayer;
  activities: WorkstreamActivity[];
  /** IDs of workstreams this one directly depends on (i.e. must start after) */
  dependsOn: string[];
  status?: 'not-started' | 'in-progress' | 'complete' | 'blocked';
  owner?: string;
  notes?: string;
  /** ISO date string e.g. "2025-01-06" — used by the Gantt view */
  startDate?: string;
  /** ISO date string e.g. "2025-03-31" — used by the Gantt view */
  endDate?: string;
}
