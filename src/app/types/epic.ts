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
  priority: "High" | "Medium" | "Low";
  status: "Backlog" | "In Progress" | "Testing" | "Done";
  storyPoints?: number;
  assignee?: string;
  notes?: string;
}
