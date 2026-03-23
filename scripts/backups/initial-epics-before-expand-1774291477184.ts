export const initialEpics = [
  {
    "id": "EPIC-1",
    "title": "Application Discovery & Onboarding",
    "description": "Build standardized application discovery and onboarding workflow with evidence retention",
    "requirements": [
      "RBAC-CAP-101",
      "RBAC-CAP-102",
      "RBAC-ENT-005",
      "RBAC-ENT-002",
      "RBAC-CAP-103",
      "RBAC-CAP-105",
      "RBAC-CAP-106",
      "RBAC-CAP-107",
      "RBAC-CAP-108",
      "RBAC-CAP-110",
      "RBAC-CAP-303",
      "RBAC-CAP-305",
      "RBAC-CAP-402",
      "RBAC-CAP-403",
      "RBAC-CAP-404",
      "RBAC-CAP-406",
      "RBAC-CAP-601",
      "RBAC-CAP-602",
      "RBAC-CAP-603",
      "RBAC-CAP-604",
      "RBAC-CAP-701",
      "RBAC-CAP-702",
      "RBAC-CAP-704"
    ],
    "owner": "RBAC Product Team",
    "status": "In Progress",
    "priority": "High",
    "notes": "Foundation for scalable RBAC adoption"
  },
  {
    "id": "EPIC-2",
    "title": "Business Role Management",
    "description": "Enable creation, lifecycle management, and composition of business roles",
    "requirements": [
      "RBAC-CAP-103",
      "RBAC-CAP-104",
      "RBAC-CAP-105",
      "RBAC-ENT-001",
      "RBAC-CAP-201",
      "RBAC-CAP-202",
      "RBAC-CAP-203",
      "RBAC-CAP-204",
      "RBAC-CAP-205",
      "RBAC-CAP-206",
      "RBAC-CAP-207",
      "RBAC-CAP-208",
      "RBAC-CAP-209",
      "RBAC-CAP-301",
      "RBAC-CAP-302",
      "RBAC-CAP-304",
      "RBAC-CAP-401",
      "RBAC-CAP-405",
      "RBAC-CAP-605",
      "RBAC-CAP-802",
      "RBAC-IGA-025",
      "RBAC-IGA-027",
      "RBAC-INT-002",
      "RBAC-INT-006",
      "RBAC-INT-009"
    ],
    "owner": "RBAC Product Team",
    "status": "In Progress",
    "priority": "High",
    "notes": "Core role definition capabilities"
  },
  {
    "id": "EPIC-3",
    "title": "Privileged Access Governance",
    "description": "Implement privileged entitlement flagging and governance controls",
    "requirements": [
      "RBAC-CAP-106",
      "RBAC-ENT-002",
      "RBAC-IGA-004"
    ],
    "owner": "Security Team",
    "status": "Backlog",
    "priority": "High",
    "notes": "Least privilege enforcement"
  },
  {
    "id": "EPIC-4",
    "title": "Access Request & Lifecycle",
    "description": "Build role-based access request system with automated lifecycle management",
    "requirements": [
      "RBAC-CAP-107",
      "RBAC-CAP-109",
      "RBAC-ENT-003",
      "RBAC-IGA-005"
    ],
    "owner": "RBAC Product Team",
    "status": "Backlog",
    "priority": "High",
    "notes": "ServiceNow integration for requests"
  },
  {
    "id": "EPIC-5",
    "title": "Access Certification & Review",
    "description": "Create periodic access certification campaigns with automated revocation",
    "requirements": [
      "RBAC-CAP-108",
      "RBAC-IGA-007",
      "RBAC-ENT-003",
      "RBAC-CAP-501",
      "RBAC-CAP-502",
      "RBAC-CAP-503",
      "RBAC-CAP-504",
      "RBAC-CAP-505"
    ],
    "owner": "Compliance Team",
    "status": "Backlog",
    "priority": "Medium",
    "notes": "Ongoing access validation"
  },
  {
    "id": "EPIC-6",
    "title": "Audit Evidence & Reporting",
    "description": "Build comprehensive audit reporting with who-has-access visibility",
    "requirements": [
      "RBAC-CAP-110",
      "RBAC-ENT-004",
      "RBAC-CAP-113",
      "RBAC-ENT-003",
      "RBAC-CAP-109",
      "RBAC-CAP-407",
      "RBAC-CAP-703"
    ],
    "owner": "Audit Team",
    "status": "Backlog",
    "priority": "High",
    "notes": "SOX compliance requirement"
  },
  {
    "id": "EPIC-7",
    "title": "IGA Platform Integration",
    "description": "Integrate with IGA platform for provisioning, certifications, and audit evidence",
    "requirements": [
      "RBAC-CAP-111",
      "RBAC-CAP-112",
      "RBAC-CAP-113",
      "RBAC-ENT-006",
      "RBAC-CAP-801",
      "RBAC-CAP-803",
      "RBAC-CAP-804",
      "RBAC-IGA-001",
      "RBAC-IGA-002",
      "RBAC-IGA-003",
      "RBAC-IGA-004",
      "RBAC-IGA-005",
      "RBAC-IGA-006",
      "RBAC-IGA-007",
      "RBAC-IGA-008",
      "RBAC-IGA-009",
      "RBAC-IGA-010",
      "RBAC-IGA-011",
      "RBAC-IGA-013",
      "RBAC-IGA-014",
      "RBAC-IGA-015",
      "RBAC-IGA-016",
      "RBAC-IGA-017",
      "RBAC-IGA-018",
      "RBAC-IGA-019",
      "RBAC-IGA-020",
      "RBAC-IGA-021",
      "RBAC-IGA-022",
      "RBAC-IGA-023",
      "RBAC-IGA-026",
      "RBAC-IGA-028",
      "RBAC-IGA-029",
      "RBAC-IGA-030",
      "RBAC-IGA-031",
      "RBAC-IGA-032",
      "RBAC-IGA-033",
      "RBAC-IGA-034",
      "RBAC-IGA-035",
      "RBAC-IGA-036",
      "RBAC-IGA-037",
      "RBAC-IGA-038",
      "RBAC-IGA-039",
      "RBAC-IGA-040",
      "RBAC-IGA-041",
      "RBAC-IGA-042",
      "RBAC-INT-004",
      "RBAC-INT-012",
      "RBAC-INT-013",
      "RBAC-INT-014",
      "RBAC-INT-015",
      "RBAC-INT-016",
      "RBAC-INT-017",
      "RBAC-INT-018",
      "RBAC-INT-019",
      "RBAC-NFR-001",
      "RBAC-NFR-002",
      "RBAC-NFR-003",
      "RBAC-NFR-004",
      "RBAC-NFR-005",
      "RBAC-NFR-006",
      "RBAC-NFR-007",
      "RBAC-NFR-008",
      "RBAC-NFR-009",
      "RBAC-NFR-010",
      "RBAC-NFR-011",
      "RBAC-NFR-012"
    ],
    "owner": "Engineering Team",
    "status": "Backlog",
    "priority": "High",
    "notes": "Separation of governance and execution"
  },
  {
    "id": "EPIC-8",
    "title": "Directory Services Integration",
    "description": "Integrate with Active Directory and Entra ID for provisioning and drift detection",
    "requirements": [
      "RBAC-INT-005",
      "RBAC-INT-008",
      "RBAC-INT-010",
      "RBAC-INT-012",
      "RBAC-IGA-001",
      "RBAC-IGA-012",
      "RBAC-IGA-024",
      "RBAC-INT-007",
      "RBAC-INT-011"
    ],
    "owner": "IAM Engineering",
    "status": "Backlog",
    "priority": "Medium",
    "notes": "AD and Entra ID enforcement"
  },
  {
    "id": "EPIC-9",
    "title": "Workday HR Integration",
    "description": "Establish Workday as authoritative source and ingest employee attributes",
    "requirements": [
      "RBAC-INT-001",
      "RBAC-INT-002",
      "RBAC-INT-003",
      "RBAC-INT-004"
    ],
    "owner": "HRIS / IAM",
    "status": "Backlog",
    "priority": "Medium",
    "notes": "HR system of record transition"
  },
  {
    "id": "EPIC-10",
    "title": "AI-Assisted Role Discovery",
    "description": "Optional AI-powered discovery tool for role analysis and recommendations",
    "requirements": [
      "OPT-DISC-01",
      "OPT-DISC-02",
      "OPT-DISC-03",
      "OPT-DISC-04",
      "RBAC-CAP-109",
      "RBAC-ENT-005"
    ],
    "owner": "Implementation Partner",
    "status": "Backlog",
    "priority": "Low",
    "notes": "Optional accelerator tool"
  }
];

export const initialUserStories = [
  {
    "id": "US-2.1",
    "epicId": "EPIC-2",
    "title": "Establish a standardized, enterprise role-based access governance model that def...",
    "description": "Establish a standardized, enterprise role-based access governance model that defines roles, maps roles to entitlements, and governs access decisions consistently across applications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-ENT-001"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.1",
    "epicId": "EPIC-1",
    "title": "The system SHALL enforce least privilege access by ensuring users receive only t...",
    "description": "The system SHALL enforce least privilege access by ensuring users receive only the access required for their job function and by explicitly identifying and governing privileged or sensitive access",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-ENT-002"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-6.1",
    "epicId": "EPIC-6",
    "title": "Govern the full access lifecycle, including request, approval, activation, revie...",
    "description": "Govern the full access lifecycle, including request, approval, activation, review, revocation, and exception handling, in a repeatable and auditable manner",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-ENT-003"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-6.2",
    "epicId": "EPIC-6",
    "title": "Produce complete, attributable, and auditable evidence of access decisions suffi...",
    "description": "Produce complete, attributable, and auditable evidence of access decisions sufficient to support SOX and other regulatory audits without manual reconstruction",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-ENT-004"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-10.1",
    "epicId": "EPIC-10",
    "title": "The system SHALL support scalable onboarding of applications, identities, and ro...",
    "description": "The system SHALL support scalable onboarding of applications, identities, and roles without bespoke redesign or manual controls",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-ENT-005"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.1",
    "epicId": "EPIC-7",
    "title": "Define access intent, policy, and governance while delegating execution, automat...",
    "description": "Define access intent, policy, and governance while delegating execution, automation, and enforcement to an enterprise IGA platform",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-ENT-006"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.2",
    "epicId": "EPIC-1",
    "title": "The system SHALL provide a standardized discovery model to capture application R...",
    "description": "The system SHALL provide a standardized discovery model to capture application RBAC readiness inputs",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-101"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.3",
    "epicId": "EPIC-1",
    "title": "The system SHALL require completion of minimum discovery criteria before entitle...",
    "description": "The system SHALL require completion of minimum discovery criteria before entitlement mapping",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-102"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.4",
    "epicId": "EPIC-1",
    "title": "The system SHALL require identification of business and technical owners",
    "description": "The system SHALL require identification of business and technical owners",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-103"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.2",
    "epicId": "EPIC-2",
    "title": "The system SHALL require documented role constructs or confirmation none exist",
    "description": "The system SHALL require documented role constructs or confirmation none exist",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-104"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.5",
    "epicId": "EPIC-1",
    "title": "The system SHALL require a current permission inventory",
    "description": "The system SHALL require a current permission inventory",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-105"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.6",
    "epicId": "EPIC-1",
    "title": "The system SHALL identify privileged access paths during discovery",
    "description": "The system SHALL identify privileged access paths during discovery",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-106"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.7",
    "epicId": "EPIC-1",
    "title": "The system SHALL capture segregation-of-duties considerations",
    "description": "The system SHALL capture segregation-of-duties considerations",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-107"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.8",
    "epicId": "EPIC-1",
    "title": "The system SHALL track discovery lifecycle status",
    "description": "The system SHALL track discovery lifecycle status",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-108"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-6.3",
    "epicId": "EPIC-6",
    "title": "The system SHALL retain discovery artifacts as audit evidence",
    "description": "The system SHALL retain discovery artifacts as audit evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-109"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.9",
    "epicId": "EPIC-1",
    "title": "The system SHALL support RBAC governance for non-human identities",
    "description": "The system SHALL support RBAC governance for non-human identities",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-110"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.3",
    "epicId": "EPIC-2",
    "title": "The system SHALL support explicit definition of business roles",
    "description": "The system SHALL support explicit definition of business roles",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-201"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.4",
    "epicId": "EPIC-2",
    "title": "The system SHALL enforce role eligibility criteria",
    "description": "The system SHALL enforce role eligibility criteria",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-202"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.5",
    "epicId": "EPIC-2",
    "title": "The system SHALL require documented role purpose and owner",
    "description": "The system SHALL require documented role purpose and owner",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-203"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.6",
    "epicId": "EPIC-2",
    "title": "The system SHALL support role lifecycle states",
    "description": "The system SHALL support role lifecycle states",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-204"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.7",
    "epicId": "EPIC-2",
    "title": "The system SHALL ensure users inherit access only through roles",
    "description": "The system SHALL ensure users inherit access only through roles",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-205"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.8",
    "epicId": "EPIC-2",
    "title": "The system SHALL automatically revoke access when role removed",
    "description": "The system SHALL automatically revoke access when role removed",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-206"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.9",
    "epicId": "EPIC-2",
    "title": "The system SHALL support role composition",
    "description": "The system SHALL support role composition",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-207"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.10",
    "epicId": "EPIC-2",
    "title": "The system SHALL support periodic role review",
    "description": "The system SHALL support periodic role review",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-208"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.11",
    "epicId": "EPIC-2",
    "title": "The system SHALL require approval and justification for material role changes",
    "description": "The system SHALL require approval and justification for material role changes",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-209"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.12",
    "epicId": "EPIC-2",
    "title": "The system SHALL enforce role-to-permission mapping",
    "description": "The system SHALL enforce role-to-permission mapping",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-301"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.13",
    "epicId": "EPIC-2",
    "title": "The system SHALL require justification for permissions in roles",
    "description": "The system SHALL require justification for permissions in roles",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-302"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.10",
    "epicId": "EPIC-1",
    "title": "The system SHALL flag privileged entitlements during mapping",
    "description": "The system SHALL flag privileged entitlements during mapping",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-303"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.14",
    "epicId": "EPIC-2",
    "title": "The system SHALL require role owner approval for permission changes",
    "description": "The system SHALL require role owner approval for permission changes",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-304"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.11",
    "epicId": "EPIC-1",
    "title": "The system SHALL apply privileged designation using governance criteria",
    "description": "The system SHALL apply privileged designation using governance criteria",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-305"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.15",
    "epicId": "EPIC-2",
    "title": "The system SHALL support role-based access requests",
    "description": "The system SHALL support role-based access requests",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-401"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.12",
    "epicId": "EPIC-1",
    "title": "The system SHALL route approvals based on governance rules",
    "description": "The system SHALL route approvals based on governance rules",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-402"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.13",
    "epicId": "EPIC-1",
    "title": "The system SHALL record approval decisions as evidence",
    "description": "The system SHALL record approval decisions as evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-403"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.14",
    "epicId": "EPIC-1",
    "title": "The system SHALL prevent fulfillment without approvals",
    "description": "The system SHALL prevent fulfillment without approvals",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-404"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.16",
    "epicId": "EPIC-2",
    "title": "The system SHALL support time-bound / JIT role activation",
    "description": "The system SHALL support time-bound / JIT role activation",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-405"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.15",
    "epicId": "EPIC-1",
    "title": "Automatically revoke JIT access",
    "description": "Automatically revoke JIT access",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-406"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-6.4",
    "epicId": "EPIC-6",
    "title": "The system SHALL record JIT events as audit evidence",
    "description": "The system SHALL record JIT events as audit evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-407"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-5.1",
    "epicId": "EPIC-5",
    "title": "The system SHALL support periodic access certifications",
    "description": "The system SHALL support periodic access certifications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-501"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-5.2",
    "epicId": "EPIC-5",
    "title": "The system SHALL assign certifiers by governance rules",
    "description": "The system SHALL assign certifiers by governance rules",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-502"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-5.3",
    "epicId": "EPIC-5",
    "title": "The system SHALL record certification decisions",
    "description": "The system SHALL record certification decisions",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-503"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-5.4",
    "epicId": "EPIC-5",
    "title": "The system SHALL trigger actions from certification outcomes",
    "description": "The system SHALL trigger actions from certification outcomes",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-504"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-5.5",
    "epicId": "EPIC-5",
    "title": "The system SHALL set certification cadence by risk tier",
    "description": "The system SHALL set certification cadence by risk tier",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-505"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.16",
    "epicId": "EPIC-1",
    "title": "The system SHALL support documented access exceptions",
    "description": "The system SHALL support documented access exceptions",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-601"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.17",
    "epicId": "EPIC-1",
    "title": "The system SHALL enforce expiration or revalidation of exceptions",
    "description": "The system SHALL enforce expiration or revalidation of exceptions",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-602"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.18",
    "epicId": "EPIC-1",
    "title": "The system SHALL support emergency (break glass) access with review",
    "description": "The system SHALL support emergency (break glass) access with review",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-603"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.19",
    "epicId": "EPIC-1",
    "title": "The system SHALL retain exception and emergency evidence",
    "description": "The system SHALL retain exception and emergency evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-604"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.17",
    "epicId": "EPIC-2",
    "title": "The system SHALL trigger role review from repeated exceptions",
    "description": "The system SHALL trigger role review from repeated exceptions",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-605"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.20",
    "epicId": "EPIC-1",
    "title": "The system SHALL report who has access and why",
    "description": "The system SHALL report who has access and why",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-701"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.21",
    "epicId": "EPIC-1",
    "title": "The system SHALL retain historical access records",
    "description": "The system SHALL retain historical access records",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-702"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-6.5",
    "epicId": "EPIC-6",
    "title": "The system SHALL support on-demand audit evidence",
    "description": "The system SHALL support on-demand audit evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-703"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-1.22",
    "epicId": "EPIC-1",
    "title": "The system SHALL ensure evidence is complete and attributable",
    "description": "The system SHALL ensure evidence is complete and attributable",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-704"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.2",
    "epicId": "EPIC-7",
    "title": "RBAC depends on IGA for execution",
    "description": "RBAC depends on IGA for execution",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-801"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.18",
    "epicId": "EPIC-2",
    "title": "IGA is system of record for roles and assignments",
    "description": "IGA is system of record for roles and assignments",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-802"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.3",
    "epicId": "EPIC-7",
    "title": "IGA executes provisioning, certification, JIT",
    "description": "IGA executes provisioning, certification, JIT",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-803"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.4",
    "epicId": "EPIC-7",
    "title": "IGA retains audit evidence for all access events",
    "description": "IGA retains audit evidence for all access events",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-CAP-804"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.5",
    "epicId": "EPIC-7",
    "title": "The system SHALL support hybrid identity environments spanning on-premises and S...",
    "description": "The system SHALL support hybrid identity environments spanning on-premises and SaaS",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-001"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.6",
    "epicId": "EPIC-7",
    "title": "The system SHALL support coexistence of on-premises and SaaS components with equ...",
    "description": "The system SHALL support coexistence of on-premises and SaaS components with equivalent capability",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-002"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.7",
    "epicId": "EPIC-7",
    "title": "The system SHALL support phased migration and parallel operation with legacy IAM...",
    "description": "The system SHALL support phased migration and parallel operation with legacy IAM systems",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-003"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.8",
    "epicId": "EPIC-7",
    "title": "The system SHALL support governance of connected and non-connected applications",
    "description": "The system SHALL support governance of connected and non-connected applications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-004"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.9",
    "epicId": "EPIC-7",
    "title": "The system SHALL include non-connected applications in access reviews and certif...",
    "description": "The system SHALL include non-connected applications in access reviews and certifications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-005"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.10",
    "epicId": "EPIC-7",
    "title": "The system SHALL support standard enterprise integration patterns (APIs, directo...",
    "description": "The system SHALL support standard enterprise integration patterns (APIs, directories, DBs, files, SCIM)",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-006"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.11",
    "epicId": "EPIC-7",
    "title": "The system SHALL provide prebuilt connectors for common enterprise and SaaS syst...",
    "description": "The system SHALL provide prebuilt connectors for common enterprise and SaaS systems",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-007"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.12",
    "epicId": "EPIC-7",
    "title": "The system SHALL provide extensibility mechanisms where direct connectors do not...",
    "description": "The system SHALL provide extensibility mechanisms where direct connectors do not exist",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-008"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.13",
    "epicId": "EPIC-7",
    "title": "The system SHALL provide comprehensive audit logging for identity, access, and g...",
    "description": "The system SHALL provide comprehensive audit logging for identity, access, and governance actions",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-009"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.14",
    "epicId": "EPIC-7",
    "title": "The system SHALL capture approver identity, timestamps, and before/after access ...",
    "description": "The system SHALL capture approver identity, timestamps, and before/after access state",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-010"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.15",
    "epicId": "EPIC-7",
    "title": "The system SHALL support configurable audit log retention policies",
    "description": "The system SHALL support configurable audit log retention policies",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-011"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-8.1",
    "epicId": "EPIC-8",
    "title": "The system SHALL detect and report governed directory and group membership chang...",
    "description": "The system SHALL detect and report governed directory and group membership changes",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-012"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.16",
    "epicId": "EPIC-7",
    "title": "The system SHALL detect access granted outside IGA-governed workflows",
    "description": "The system SHALL detect access granted outside IGA-governed workflows",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-013"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.17",
    "epicId": "EPIC-7",
    "title": "The system SHALL retain reconciliation actions and outcomes as audit evidence",
    "description": "The system SHALL retain reconciliation actions and outcomes as audit evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-014"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.18",
    "epicId": "EPIC-7",
    "title": "The system SHALL support periodic access certifications by role and/or entitleme...",
    "description": "The system SHALL support periodic access certifications by role and/or entitlement",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-015"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.19",
    "epicId": "EPIC-7",
    "title": "The system SHALL retain certification decisions with reviewer, outcome, and time...",
    "description": "The system SHALL retain certification decisions with reviewer, outcome, and timestamp",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-016"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.20",
    "epicId": "EPIC-7",
    "title": "The system SHALL support role-level certifications",
    "description": "The system SHALL support role-level certifications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-017"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.21",
    "epicId": "EPIC-7",
    "title": "Automatically revoke access when removal is approved during certification",
    "description": "Automatically revoke access when removal is approved during certification",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-018"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.22",
    "epicId": "EPIC-7",
    "title": "The system SHALL support certification delegation, escalation, and overdue track...",
    "description": "The system SHALL support certification delegation, escalation, and overdue tracking",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-019"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.23",
    "epicId": "EPIC-7",
    "title": "The system SHALL support hybrid identity environments spanning on-prem and SaaS",
    "description": "The system SHALL support hybrid identity environments spanning on-prem and SaaS",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-020"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.24",
    "epicId": "EPIC-7",
    "title": "The system SHALL support coexistence of on-prem and SaaS components",
    "description": "The system SHALL support coexistence of on-prem and SaaS components",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-021"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.25",
    "epicId": "EPIC-7",
    "title": "The system SHALL support phased migration with legacy IAM",
    "description": "The system SHALL support phased migration with legacy IAM",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-022"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.26",
    "epicId": "EPIC-7",
    "title": "The system SHALL ingest access from connected and non-connected apps",
    "description": "The system SHALL ingest access from connected and non-connected apps",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-023"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-8.2",
    "epicId": "EPIC-8",
    "title": "The system SHALL support API, directory, JDBC, file ingestion",
    "description": "The system SHALL support API, directory, JDBC, file ingestion",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-024"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.19",
    "epicId": "EPIC-2",
    "title": "The system SHALL correlate accounts and entitlements to roles",
    "description": "The system SHALL correlate accounts and entitlements to roles",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-025"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.27",
    "epicId": "EPIC-7",
    "title": "The system SHALL flag privileged access during ingestion",
    "description": "The system SHALL flag privileged access during ingestion",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-026"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.20",
    "epicId": "EPIC-2",
    "title": "The system SHALL enforce RBAC role execution",
    "description": "The system SHALL enforce RBAC role execution",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-027"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.28",
    "epicId": "EPIC-7",
    "title": "The system SHALL support ABAC eligibility enforcement",
    "description": "The system SHALL support ABAC eligibility enforcement",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-028"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.29",
    "epicId": "EPIC-7",
    "title": "Auto-revoke access on attribute change",
    "description": "Auto-revoke access on attribute change",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-029"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.30",
    "epicId": "EPIC-7",
    "title": "The system SHALL prevent direct entitlement bypass",
    "description": "The system SHALL prevent direct entitlement bypass",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-030"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.31",
    "epicId": "EPIC-7",
    "title": "The system SHALL execute provisioning independent of intake UI",
    "description": "The system SHALL execute provisioning independent of intake UI",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-031"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.32",
    "epicId": "EPIC-7",
    "title": "The system SHALL support cross-system orchestration",
    "description": "The system SHALL support cross-system orchestration",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-032"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.33",
    "epicId": "EPIC-7",
    "title": "Auto-revoke access from certifications",
    "description": "Auto-revoke access from certifications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-033"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.34",
    "epicId": "EPIC-7",
    "title": "The system SHALL support just-in-time privileged access",
    "description": "The system SHALL support just-in-time privileged access",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-034"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.35",
    "epicId": "EPIC-7",
    "title": "Automatically expire JIT access",
    "description": "Automatically expire JIT access",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-035"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.36",
    "epicId": "EPIC-7",
    "title": "The system SHALL retain JIT approval and expiration evidence",
    "description": "The system SHALL retain JIT approval and expiration evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-036"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.37",
    "epicId": "EPIC-7",
    "title": "The system SHALL support role and entitlement certifications",
    "description": "The system SHALL support role and entitlement certifications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-037"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.38",
    "epicId": "EPIC-7",
    "title": "The system SHALL support role-level certifications",
    "description": "The system SHALL support role-level certifications",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-038"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.39",
    "epicId": "EPIC-7",
    "title": "The system SHALL support escalation and overdue tracking",
    "description": "The system SHALL support escalation and overdue tracking",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-039"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.40",
    "epicId": "EPIC-7",
    "title": "The system SHALL capture attributable audit logs",
    "description": "The system SHALL capture attributable audit logs",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-040"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.41",
    "epicId": "EPIC-7",
    "title": "The system SHALL detect out-of-band access",
    "description": "The system SHALL detect out-of-band access",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-041"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.42",
    "epicId": "EPIC-7",
    "title": "The system SHALL retain reconciliation history",
    "description": "The system SHALL retain reconciliation history",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-IGA-042"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-9.1",
    "epicId": "EPIC-9",
    "title": "The system SHALL consume joiner/mover/leaver lifecycle events from Workday HR",
    "description": "The system SHALL consume joiner/mover/leaver lifecycle events from Workday HR",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-001"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.21",
    "epicId": "EPIC-2",
    "title": "The system SHALL ingest identity attributes from Workday to drive role eligibili...",
    "description": "The system SHALL ingest identity attributes from Workday to drive role eligibility",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-002"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-9.2",
    "epicId": "EPIC-9",
    "title": "The system SHALL refresh Workday attributes to support timely access changes",
    "description": "The system SHALL refresh Workday attributes to support timely access changes",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-003"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.43",
    "epicId": "EPIC-7",
    "title": "The system SHALL retain audit evidence of Workday attribute changes affecting ac...",
    "description": "The system SHALL retain audit evidence of Workday attribute changes affecting access",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-004"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-8.3",
    "epicId": "EPIC-8",
    "title": "The system SHALL ingest directory accounts and groups",
    "description": "The system SHALL ingest directory accounts and groups",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-005"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.22",
    "epicId": "EPIC-2",
    "title": "The system SHALL map directory groups to roles",
    "description": "The system SHALL map directory groups to roles",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-006"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-8.4",
    "epicId": "EPIC-8",
    "title": "The system SHALL flag privileged directory groups",
    "description": "The system SHALL flag privileged directory groups",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-007"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-8.5",
    "epicId": "EPIC-8",
    "title": "Provision directory memberships",
    "description": "Provision directory memberships",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-008"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-2.23",
    "epicId": "EPIC-2",
    "title": "Revoke directory access on role removal",
    "description": "Revoke directory access on role removal",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-009"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-8.6",
    "epicId": "EPIC-8",
    "title": "The system SHALL detect out-of-band directory changes",
    "description": "The system SHALL detect out-of-band directory changes",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-010"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-8.7",
    "epicId": "EPIC-8",
    "title": "The system SHALL retain directory reconciliation evidence",
    "description": "The system SHALL retain directory reconciliation evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-011"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.44",
    "epicId": "EPIC-7",
    "title": "The system SHALL receive access request intake from ServiceNow ITSM",
    "description": "The system SHALL receive access request intake from ServiceNow ITSM",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-012"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.45",
    "epicId": "EPIC-7",
    "title": "The system SHALL execute fulfillment for ServiceNow-approved access requests",
    "description": "The system SHALL execute fulfillment for ServiceNow-approved access requests",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-013"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.46",
    "epicId": "EPIC-7",
    "title": "The system SHALL block fulfillment of ServiceNow requests until approval is reco...",
    "description": "The system SHALL block fulfillment of ServiceNow requests until approval is recorded",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-014"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.47",
    "epicId": "EPIC-7",
    "title": "The system SHALL provide standard connectors",
    "description": "The system SHALL provide standard connectors",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-015"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.48",
    "epicId": "EPIC-7",
    "title": "The system SHALL support extensibility where connectors unavailable",
    "description": "The system SHALL support extensibility where connectors unavailable",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-016"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.49",
    "epicId": "EPIC-7",
    "title": "Provision via API/JDBC/REST",
    "description": "Provision via API/JDBC/REST",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-017"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.50",
    "epicId": "EPIC-7",
    "title": "The system SHALL support governed scripting",
    "description": "The system SHALL support governed scripting",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-018"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.51",
    "epicId": "EPIC-7",
    "title": "Script execution is auditable",
    "description": "Script execution is auditable",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-INT-019"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.52",
    "epicId": "EPIC-7",
    "title": "The system SHALL provide 24x7 support for critical failures",
    "description": "The system SHALL provide 24x7 support for critical failures",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-001"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.53",
    "epicId": "EPIC-7",
    "title": "Define SLA response times for failures",
    "description": "Define SLA response times for failures",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-002"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.54",
    "epicId": "EPIC-7",
    "title": "Prioritize incidents impacting audit evidence",
    "description": "Prioritize incidents impacting audit evidence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-003"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.55",
    "epicId": "EPIC-7",
    "title": "Scale ingestion to enterprise volumes",
    "description": "Scale ingestion to enterprise volumes",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-004"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.56",
    "epicId": "EPIC-7",
    "title": "The system SHALL support peak provisioning loads",
    "description": "The system SHALL support peak provisioning loads",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-005"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.57",
    "epicId": "EPIC-7",
    "title": "The system SHALL support large certification campaigns",
    "description": "The system SHALL support large certification campaigns",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-006"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.58",
    "epicId": "EPIC-7",
    "title": "The system SHALL prevent unauthorized provisioning",
    "description": "The system SHALL prevent unauthorized provisioning",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-007"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.59",
    "epicId": "EPIC-7",
    "title": "Protect audit logs from tampering",
    "description": "Protect audit logs from tampering",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-008"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.60",
    "epicId": "EPIC-7",
    "title": "Govern IGA admin access",
    "description": "Govern IGA admin access",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-009"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.61",
    "epicId": "EPIC-7",
    "title": "Publish release cadence",
    "description": "Publish release cadence",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-010"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.62",
    "epicId": "EPIC-7",
    "title": "The system SHALL support phased rollouts",
    "description": "The system SHALL support phased rollouts",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-011"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  },
  {
    "id": "US-7.63",
    "epicId": "EPIC-7",
    "title": "Preserve audit evidence across upgrades",
    "description": "Preserve audit evidence across upgrades",
    "acceptanceCriteria": [],
    "requirements": [
      "RBAC-NFR-012"
    ],
    "priority": "Medium",
    "status": "Backlog",
    "storyPoints": 3,
    "assignee": "",
    "notes": "Imported from CSV"
  }
];
