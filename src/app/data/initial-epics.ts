import { Epic, UserStory } from "../types/epic";

export const initialEpics: Epic[] = [
  {
    id: "EPIC-1",
    title: "Application Discovery & Onboarding",
    description: "Build standardized application discovery and onboarding workflow with evidence retention",
  requirements: ["RBAC-CAP-101", "RBAC-CAP-102", "RBAC-ENT-005"],
    owner: "RBAC Product Team",
    status: "In Progress",
    priority: "High",
    notes: "Foundation for scalable RBAC adoption"
  },
  {
    id: "EPIC-2",
    title: "Business Role Management",
    description: "Enable creation, lifecycle management, and composition of business roles",
  requirements: ["RBAC-CAP-103", "RBAC-CAP-104", "RBAC-CAP-105", "RBAC-ENT-001"],
    owner: "RBAC Product Team",
    status: "In Progress",
    priority: "High",
    notes: "Core role definition capabilities"
  },
  {
    id: "EPIC-3",
    title: "Privileged Access Governance",
    description: "Implement privileged entitlement flagging and governance controls",
  requirements: ["RBAC-CAP-106", "RBAC-ENT-002", "RBAC-IGA-004"],
    owner: "Security Team",
    status: "Backlog",
    priority: "High",
    notes: "Least privilege enforcement"
  },
  {
    id: "EPIC-4",
    title: "Access Request & Lifecycle",
    description: "Build role-based access request system with automated lifecycle management",
  requirements: ["RBAC-CAP-107", "RBAC-CAP-109", "RBAC-ENT-003", "RBAC-IGA-005"],
    owner: "RBAC Product Team",
    status: "Backlog",
    priority: "High",
    notes: "ServiceNow integration for requests"
  },
  {
    id: "EPIC-5",
    title: "Access Certification & Review",
    description: "Create periodic access certification campaigns with automated revocation",
  requirements: ["RBAC-CAP-108", "RBAC-IGA-007", "RBAC-ENT-003"],
    owner: "Compliance Team",
    status: "Backlog",
    priority: "Medium",
    notes: "Ongoing access validation"
  },
  {
    id: "EPIC-6",
    title: "Audit Evidence & Reporting",
    description: "Build comprehensive audit reporting with who-has-access visibility",
  requirements: ["RBAC-CAP-110", "RBAC-ENT-004", "RBAC-CAP-113"],
    owner: "Audit Team",
    status: "Backlog",
    priority: "High",
    notes: "SOX compliance requirement"
  },
  {
    id: "EPIC-7",
    title: "IGA Platform Integration",
    description: "Integrate with IGA platform for provisioning, certifications, and audit evidence",
  requirements: ["RBAC-CAP-111", "RBAC-CAP-112", "RBAC-CAP-113", "RBAC-ENT-006"],
    owner: "Engineering Team",
    status: "Backlog",
    priority: "High",
    notes: "Separation of governance and execution"
  },
  {
    id: "EPIC-8",
    title: "Directory Services Integration",
    description: "Integrate with Active Directory and Entra ID for provisioning and drift detection",
  requirements: ["RBAC-INT-005", "RBAC-INT-008", "RBAC-INT-010", "RBAC-INT-012", "RBAC-IGA-001"],
    owner: "IAM Engineering",
    status: "Backlog",
    priority: "Medium",
    notes: "AD and Entra ID enforcement"
  },
  {
    id: "EPIC-9",
    title: "Workday HR Integration",
    description: "Establish Workday as authoritative source and ingest employee attributes",
  requirements: ["RBAC-INT-001", "RBAC-INT-002", "RBAC-INT-003", "RBAC-INT-004"],
    owner: "HRIS / IAM",
    status: "Backlog",
    priority: "Medium",
    notes: "HR system of record transition"
  },
  {
    id: "EPIC-10",
    title: "AI-Assisted Role Discovery",
    description: "Optional AI-powered discovery tool for role analysis and recommendations",
    requirements: ["OPT-DISC-01", "OPT-DISC-02", "OPT-DISC-03", "OPT-DISC-04", "RBAC-CAP-109"],
    owner: "Implementation Partner",
    status: "Backlog",
    priority: "Low",
    notes: "Optional accelerator tool"
  }
];

export const initialUserStories: UserStory[] = [
  // EPIC-1: Application Discovery
  {
    id: "US-1.1",
    epicId: "EPIC-1",
    title: "As an RBAC admin, I can create a standardized discovery record",
    description: "Create a standardized form to capture application details during onboarding",
    acceptanceCriteria: [
      "Form includes app name, owner, business context",
      "Discovery record is saved with unique ID",
      "Required fields are validated before submission",
      "Discovery artifacts are retained as evidence"
    ],
      requirements: ["RBAC-CAP-101", "RBAC-CAP-102"],
    priority: "High",
  status: "In Progress",
  storyPoints: 3,
  assignee: "Product Team",
    
    notes: "Foundation for repeatable onboarding"
  },

  // EPIC-2: Business Role Management
  {
    id: "US-2.1",
    epicId: "EPIC-2",
    title: "As a role owner, I can define a new business role",
    description: "Enable creation of business roles with explicit definition and metadata",
    acceptanceCriteria: [
      "Role form includes name, description, owner, eligibility",
      "Role is saved with unique ID",
      "Role starts in Draft lifecycle state",
      "Role definition is auditable"
    ],
  requirements: ["RBAC-CAP-103", "RBAC-CAP-104"],
    priority: "High",
  status: "In Progress",
  storyPoints: 5,
  assignee: "Product Team",
    
    notes: "Core role definition capability"
  },
  {
    id: "US-2.2",
    epicId: "EPIC-2",
    title: "As a role owner, I can manage role lifecycle states",
    description: "Move roles through lifecycle states: Draft → Active → Deprecated → Retired",
    acceptanceCriteria: [
      "Roles can transition between valid states",
      "State transitions are logged with timestamp and actor",
      "Retired roles cannot be assigned to users",
      "State history is retained for audit"
    ],
      requirements: ["RBAC-CAP-104", "RBAC-ENT-003"],
    priority: "High",
  status: "Backlog",
  storyPoints: 3,
  assignee: "Product Team",
    
    notes: "Controlled evolution of roles"
  },
  {
    id: "US-2.3",
    epicId: "EPIC-2",
    title: "As a role owner, I can compose roles from other roles",
    description: "Enable role composition where roles can include other roles",
    acceptanceCriteria: [
      "Role can include one or more child roles",
      "Circular dependencies are prevented",
      "Role composition is visualized",
      "Effective entitlements are calculated"
    ],
      requirements: ["RBAC-CAP-105", "RBAC-ENT-005"],
    priority: "Medium",
  status: "Backlog",
  storyPoints: 8,
  assignee: "Product Team",
    
    notes: "Enables scalable role design"
  },

  // EPIC-3: Privileged Access
  {
    id: "US-3.1",
    epicId: "EPIC-3",
    title: "As a security admin, I can flag entitlements as privileged",
    description: "Mark specific entitlements as privileged to enable enhanced governance",
    acceptanceCriteria: [
      "Entitlements can be flagged as privileged",
      "Privileged flag is visible in role mapping",
      "Privileged access triggers enhanced approval",
      "Privileged access is highlighted in reports"
    ],
      requirements: ["RBAC-CAP-106", "RBAC-IGA-004"],
    priority: "High",
  status: "Backlog",
  storyPoints: 5,
  assignee: "Security Team",
    
    notes: "Least privilege enforcement"
  },

  // EPIC-4: Access Request
  {
    id: "US-4.1",
    epicId: "EPIC-4",
    title: "As an employee, I can request a role via ServiceNow",
    description: "Submit role-based access requests through ServiceNow catalog",
    acceptanceCriteria: [
      "ServiceNow catalog displays available roles",
      "Request includes justification and business need",
      "Request routes to appropriate approver",
      "Request status is visible to requester"
    ],
      requirements: ["RBAC-CAP-107", "RBAC-IGA-005"],
    priority: "High",
  status: "Backlog",
  storyPoints: 8,
  assignee: "Product Team",
    
    notes: "Standard request UX"
  },
  {
    id: "US-4.2",
    epicId: "EPIC-4",
    title: "As the system, I can auto-revoke access on lifecycle changes",
    description: "Automatically evaluate role revocation when employee status changes",
    acceptanceCriteria: [
      "System detects HR lifecycle events (termination, transfer)",
      "System evaluates which roles should be revoked",
      "Revocation is triggered automatically",
      "Lifecycle-based revocation is logged"
    ],
      requirements: ["RBAC-CAP-109", "RBAC-ENT-003"],
    priority: "High",
  status: "Backlog",
  storyPoints: 8,
  assignee: "Engineering Team",
    
    notes: "Closed-loop lifecycle management"
  },

  // EPIC-5: Certification
  {
    id: "US-5.1",
    epicId: "EPIC-5",
    title: "As a compliance officer, I can launch access certification campaigns",
    description: "Create periodic access review campaigns for role assignments",
    acceptanceCriteria: [
      "Campaign can be scheduled with recurring cadence",
      "Campaign includes all active role assignments",
      "Reviewers are automatically assigned",
      "Campaign tracks completion percentage"
    ],
      requirements: ["RBAC-CAP-110", "RBAC-ENT-003"],
    priority: "Medium",
  status: "Backlog",
  storyPoints: 8,
  assignee: "Compliance Team",
    
    notes: "Periodic access validation"
  },
  {
    id: "US-5.2",
    epicId: "EPIC-5",
    title: "As the system, I can auto-revoke access denied in certification",
    description: "Automatically revoke access when reviewer rejects in certification",
    acceptanceCriteria: [
      "System detects denied certification decisions",
      "Revocation is triggered automatically",
      "User is notified of revocation",
      "Revocation is logged with certification ID"
    ],
      requirements: ["RBAC-IGA-007", "RBAC-ENT-003"],
    priority: "Medium",
  status: "Backlog",
  storyPoints: 5,
  assignee: "Engineering Team",
    
    notes: "Closed-loop certification"
  },

  // EPIC-6: Audit & Reporting
  {
    id: "US-6.1",
    epicId: "EPIC-6",
    title: "As an auditor, I can generate who-has-access reports",
    description: "Generate comprehensive reports showing who has access and why",
    acceptanceCriteria: [
      "Report shows all users with a specific entitlement",
      "Report includes justification and approval path",
      "Report includes when access was granted",
      "Report can be exported to Excel/PDF"
    ],
      requirements: ["RBAC-CAP-110", "RBAC-ENT-004"],
    priority: "High",
  status: "Backlog",
  storyPoints: 8,
  assignee: "Audit Team",
    
    notes: "Transparency for auditors"
  },

  // EPIC-7: IGA Integration
  {
    id: "US-7.1",
    epicId: "EPIC-7",
    title: "As the RBAC system, I can send provisioning requests to IGA",
    description: "Integrate with IGA platform to execute provisioning decisions",
    acceptanceCriteria: [
      "RBAC sends provisioning requests via API",
      "IGA acknowledges receipt of request",
      "RBAC tracks provisioning status",
      "Failed provisioning is surfaced"
    ],
      requirements: ["RBAC-CAP-111", "RBAC-CAP-112"],
    priority: "High",
  status: "Backlog",
  storyPoints: 13,
  assignee: "Engineering Team",
    
    notes: "Execution contract with IGA"
  },
  {
    id: "US-7.2",
    epicId: "EPIC-7",
    title: "As the RBAC system, I can retrieve audit evidence from IGA",
    description: "Query IGA platform for audit evidence of access decisions",
    acceptanceCriteria: [
      "RBAC can query IGA for provisioning evidence",
      "Evidence includes timestamps and actors",
      "Evidence can be displayed in audit reports",
      "Evidence retrieval is performant"
    ],
      requirements: ["RBAC-CAP-113", "RBAC-ENT-004"],
    priority: "High",
  status: "Backlog",
  storyPoints: 8,
  assignee: "Engineering Team",
    
    notes: "Central audit evidence"
  },

  // EPIC-8: Directory Integration
  {
    id: "US-8.1",
    epicId: "EPIC-8",
    title: "As the IGA system, I can provision Active Directory groups",
    description: "Create and manage AD security groups via IGA platform",
    acceptanceCriteria: [
      "IGA can create new AD groups",
      "IGA can add/remove members from groups",
      "IGA can delete groups",
      "All operations are logged"
    ],
      requirements: ["RBAC-INT-005", "RBAC-INT-008", "RBAC-INT-012"],
  priority: "Medium",
  status: "Backlog",
  storyPoints: 8,
  assignee: "IAM Engineering",
    
    notes: "AD enforcement plane"
  },
  {
    id: "US-8.2",
    epicId: "EPIC-8",
    title: "As the IGA system, I can detect directory drift",
    description: "Detect out-of-band changes to directory groups and memberships",
    acceptanceCriteria: [
      "System periodically scans directory state",
      "Drift (unauthorized changes) is detected",
      "Drift is surfaced in reports",
      "Drift can trigger alerts"
    ],
      requirements: ["RBAC-INT-010", "RBAC-IGA-006"],
  priority: "Medium",
  status: "Backlog",
  storyPoints: 8,
  assignee: "IAM Engineering",
    
    notes: "Drift detection and surfacing"
  },

  // EPIC-9: Workday Integration
  {
    id: "US-9.1",
    epicId: "EPIC-9",
    title: "As the IAM system, I can ingest employee data from Workday",
    description: "Establish Workday as HR system of record and ingest attributes",
    acceptanceCriteria: [
      "System connects to Workday API",
      "Employee attributes are ingested daily",
      "Attributes include job title, department, manager",
      "Ingestion failures are logged"
    ],
    requirements: ["RBAC-INT-001", "RBAC-INT-002"],
  priority: "Medium",
  status: "Backlog",
  storyPoints: 13,
  assignee: "HRIS / IAM",
    
    notes: "HR system of record transition"
  },

  // EPIC-10: AI Discovery
  {
    id: "US-10.1",
    epicId: "EPIC-10",
    title: "As an RBAC admin, I can use AI tool to analyze access patterns",
    description: "Optional AI-powered tool ingests logs and proposes candidate roles",
    acceptanceCriteria: [
      "Tool ingests access logs from applications",
      "Tool correlates logs with HR attributes",
      "Tool proposes candidate roles based on patterns",
      "Proposals require governance approval",
      "Tool outputs are retained as evidence"
    ],
      requirements: ["OPT-DISC-01", "OPT-DISC-02", "OPT-DISC-03", "OPT-DISC-04", "RBAC-CAP-109"],
  priority: "Low",
  status: "Backlog",
  storyPoints: 21,
  assignee: "Implementation Partner",
    
    notes: "Optional accelerator - advisory only"
  }
];
