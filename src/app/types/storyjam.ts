export interface StoryJamNode {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  title: string;
  type?: string; // sticky, story, requirement, outcome
  linkedStoryIds?: string[];
  requirementId?: string;
}

export interface StoryJamEdge {
  id: string;
  source: string; // node id
  target: string; // node id
}

export interface StoryJam {
  nodes: StoryJamNode[];
  edges: StoryJamEdge[];
}
