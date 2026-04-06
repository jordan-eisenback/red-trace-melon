import { Workstream } from "../types/workstream";

export const initialWorkstreams: Workstream[] = [
  {
    "id": "WS-01",
    "order": 1,
    "title": "Project Governance & Coordination",
    "description": "Overall project planning and tracking; dependency management across IAM, HCM, ServiceNow, and applications; stakeholder alignment and decision facilitation.",
    "layer": "foundational",
    "dependsOn": [],
    "status": "in-progress",
    "startDate": "2025-01-06",
    "endDate": "2025-12-31",
    "activities": [
      {
        "id": "WS-01-A1",
        "title": "Overall project planning and tracking",
        "order": 1
      },
      {
        "id": "WS-01-A2",
        "title": "Dependency management across IAM, HCM, ServiceNow, and applications",
        "order": 2
      },
      {
        "id": "WS-01-A3",
        "title": "Stakeholder alignment and decision facilitation",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-02",
    "order": 2,
    "title": "RBAC Requirements & Governance Definition",
    "description": "Define enterprise RBAC principles and control objectives; document RBAC functional and non-functional requirements; establish role governance, ownership, and approval expectations.",
    "layer": "foundational",
    "dependsOn": [
      "WS-01"
    ],
    "status": "in-progress",
    "startDate": "2025-01-06",
    "endDate": "2025-03-31",
    "activities": [
      {
        "id": "WS-02-A1",
        "title": "Define enterprise RBAC principles and control objectives",
        "order": 1
      },
      {
        "id": "WS-02-A2",
        "title": "Document RBAC functional and non-functional requirements",
        "order": 2
      },
      {
        "id": "WS-02-A3",
        "title": "Establish role governance, ownership, and approval expectations",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-03",
    "order": 3,
    "title": "Identity & Population Modeling",
    "description": "Define identity populations in scope (employees, contractors, vendors, non-human); map workforce lifecycle events to access changes; align authoritative sources and identity attributes.",
    "layer": "foundational",
    "dependsOn": [
      "WS-02"
    ],
    "status": "not-started",
    "startDate": "2025-02-03",
    "endDate": "2025-05-30",
    "activities": [
      {
        "id": "WS-03-A1",
        "title": "Define identity populations in scope (employees, contractors, vendors, non-human)",
        "order": 1
      },
      {
        "id": "WS-03-A2",
        "title": "Map workforce lifecycle events to access changes",
        "order": 2
      },
      {
        "id": "WS-03-A3",
        "title": "Align authoritative sources and identity attributes",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-04",
    "order": 4,
    "title": "HCM Roles & Workflow Alignment",
    "description": "Define standard HCM roles and role attributes; establish HCM-driven triggers for access changes; align HCM outputs to RBAC and downstream provisioning needs.",
    "layer": "foundational",
    "dependsOn": [
      "WS-02",
      "WS-03"
    ],
    "status": "not-started",
    "startDate": "2025-03-03",
    "endDate": "2025-06-27",
    "activities": [
      {
        "id": "WS-04-A1",
        "title": "Define standard HCM roles and role attributes",
        "order": 1
      },
      {
        "id": "WS-04-A2",
        "title": "Establish HCM-driven triggers for access changes",
        "order": 2
      },
      {
        "id": "WS-04-A3",
        "title": "Align HCM outputs to RBAC and downstream provisioning needs",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-05",
    "order": 5,
    "title": "Application Discovery & Role Intake",
    "description": "Inventory and prioritize applications for RBAC onboarding; perform role and permission intake with application owners; identify privileged and sensitive access.",
    "layer": "application",
    "dependsOn": [
      "WS-02"
    ],
    "status": "not-started",
    "startDate": "2025-02-03",
    "endDate": "2025-06-27",
    "activities": [
      {
        "id": "WS-05-A1",
        "title": "Inventory and prioritize applications for RBAC onboarding",
        "order": 1
      },
      {
        "id": "WS-05-A2",
        "title": "Perform role and permission intake with application owners",
        "order": 2
      },
      {
        "id": "WS-05-A3",
        "title": "Identify privileged and sensitive access",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-06",
    "order": 6,
    "title": "IGA Tool Evaluation & Implementation",
    "description": "Define IGA capabilities required to support RBAC; complete vendor evaluation and selection; configure and integrate IGA tooling to enforce RBAC decisions.",
    "layer": "tooling",
    "dependsOn": [
      "WS-02",
      "WS-03",
      "WS-05"
    ],
    "status": "not-started",
    "startDate": "2025-04-01",
    "endDate": "2025-09-30",
    "activities": [
      {
        "id": "WS-06-A1",
        "title": "Define IGA capabilities required to support RBAC",
        "order": 1
      },
      {
        "id": "WS-06-A2",
        "title": "Complete vendor evaluation and selection",
        "order": 2
      },
      {
        "id": "WS-06-A3",
        "title": "Configure and integrate IGA tooling to enforce RBAC decisions",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-07",
    "order": 7,
    "title": "ServiceNow Integration (Access Requests)",
    "description": "Define access request and fulfillment model; build approval workflows aligned to RBAC governance; integrate ServiceNow with IGA and identity sources.",
    "layer": "tooling",
    "dependsOn": [
      "WS-02",
      "WS-05",
      "WS-06"
    ],
    "status": "not-started",
    "startDate": "2025-07-01",
    "endDate": "2025-10-31",
    "activities": [
      {
        "id": "WS-07-A1",
        "title": "Define access request and fulfillment model",
        "order": 1
      },
      {
        "id": "WS-07-A2",
        "title": "Build approval workflows aligned to RBAC governance",
        "order": 2
      },
      {
        "id": "WS-07-A3",
        "title": "Integrate ServiceNow with IGA and identity sources",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-08",
    "order": 8,
    "title": "Technical Integration & Readiness",
    "description": "Assess directory, application, and API readiness; define integration patterns and sequencing; address technical constraints and non-functional requirements.",
    "layer": "delivery",
    "dependsOn": [
      "WS-06",
      "WS-05"
    ],
    "status": "not-started",
    "startDate": "2025-07-01",
    "endDate": "2025-10-31",
    "activities": [
      {
        "id": "WS-08-A1",
        "title": "Assess directory, application, and API readiness",
        "order": 1
      },
      {
        "id": "WS-08-A2",
        "title": "Define integration patterns and sequencing",
        "order": 2
      },
      {
        "id": "WS-08-A3",
        "title": "Address technical constraints and non-functional requirements",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-09",
    "order": 9,
    "title": "Pilot, Rollout & Transition",
    "description": "Execute pilot onboarding for initial applications; validate workflows, approvals, and evidence; plan phased rollout to additional systems.",
    "layer": "delivery",
    "dependsOn": [
      "WS-05",
      "WS-06",
      "WS-07"
    ],
    "status": "not-started",
    "startDate": "2025-10-01",
    "endDate": "2025-12-31",
    "activities": [
      {
        "id": "WS-09-A1",
        "title": "Execute pilot onboarding for initial applications",
        "order": 1
      },
      {
        "id": "WS-09-A2",
        "title": "Validate workflows, approvals, and evidence",
        "order": 2
      },
      {
        "id": "WS-09-A3",
        "title": "Plan phased rollout to additional systems",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-10",
    "order": 10,
    "title": "Operations, Audit & Steady-State Support",
    "description": "Enable access reviews, certifications, and audit evidence; define operational ownership and support model; establish success metrics and ongoing improvements.",
    "layer": "delivery",
    "dependsOn": [
      "WS-09",
      "WS-06",
      "WS-07"
    ],
    "status": "not-started",
    "startDate": "2025-11-03",
    "endDate": "2026-03-31",
    "activities": [
      {
        "id": "WS-10-A1",
        "title": "Enable access reviews, certifications, and audit evidence",
        "order": 1
      },
      {
        "id": "WS-10-A2",
        "title": "Define operational ownership and support model",
        "order": 2
      },
      {
        "id": "WS-10-A3",
        "title": "Establish success metrics and ongoing improvements",
        "order": 3
      }
    ]
  },
  {
    "id": "WS-11",
    "order": 11,
    "title": "E2E-WS-1775485356941",
    "description": "",
    "layer": "foundational",
    "dependsOn": [],
    "activities": [],
    "status": "not-started",
    "owner": "",
    "notes": ""
  },
  {
    "id": "WS-12",
    "order": 12,
    "title": "E2E-WS-1775486215914",
    "description": "",
    "layer": "foundational",
    "dependsOn": [],
    "activities": [],
    "status": "not-started",
    "owner": "",
    "notes": ""
  }
];
