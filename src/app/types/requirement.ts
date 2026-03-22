export interface Requirement {
  id: string;
  req: string;
  type: string;
  owner: string;
  parent: string | null;
  outcome: string;
  notes: string;
  status?: string;
  priority?: string;
  testCaseId?: string;
  acceptanceCriteria?: string;
  version?: string;
  lastModified?: string;
  dependencies?: string;
  integrationPoint?: string;
  identityTypes?: string;
  moveTypes?: string;
}

export type RequirementType =
  | "Enterprise"
  | "Capability"
  | "IGA Functional"
  | "Interface"
  | "NFR"
  | "Non-Functional"
  | "Interface / Functional"
  | "Interface / Data"
  | "Transition"
  | "Transition / Enablement"
  | "Constraint"
  | "Capability (Optional)"
  | "Other";
