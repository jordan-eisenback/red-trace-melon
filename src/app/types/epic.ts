export interface Epic {
  id: string;
  title: string;
  description: string;
  requirements: string[]; // Array of requirement IDs this epic satisfies
  owner: string;
  status: "Backlog" | "In Progress" | "Completed" | "Blocked";
  priority: "High" | "Medium" | "Low";
  notes?: string;
}

export interface UserStory {
  id: string;
  epicId: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  requirements: string[]; // Array of requirement IDs this story satisfies
  // Detailed activities / steps for the story. Each detail can optionally link to a requirement.
  details?: StoryDetail[];
  priority: "High" | "Medium" | "Low";
  status: "Backlog" | "In Progress" | "Testing" | "Done";
  storyPoints?: number;
  assignee?: string;
  notes?: string;
  /** Step IDs in the Story Map that reference this story (reverse of StoryMapStep.linkedStoryIds) */
  linkedStepIds?: string[];
}

export interface StoryDetail {
  id: string;
  title: string;
  description?: string;
  requirementId?: string; // optional link to a Requirement.id
  order?: number;
}
