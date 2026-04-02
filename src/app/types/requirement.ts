export type RequirementType =
  | "Enterprise"
  | "Capability"
  | "Capability Category"
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

export type RequirementStatus = "Validated" | "Not Validated";

export type RequirementPriority = "Must" | "Should" | "Could" | "Would";

export interface Requirement {
  id: string;
  req: string;
  type: RequirementType;
  owner: string;
  parent: string | null;
  outcome: string;
  notes: string;
  status?: RequirementStatus;
  priority?: RequirementPriority;
  testCaseId?: string;
  acceptanceCriteria?: string;
  version?: string;
  lastModified?: string;
  dependencies?: string;
  integrationPoint?: string;
  identityTypes?: string;
  moveTypes?: string;
}
