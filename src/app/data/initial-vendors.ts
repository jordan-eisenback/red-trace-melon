import { VendorAppData } from "../types/vendor";

export const initialVendorData: VendorAppData = {
  "vendors": [
    {
      "id": "vendor-1",
      "name": "Current Vendor (Cayosoft)",
      "type": "existing",
      "createdAt": "2026-03-27T14:38:52.765Z"
    },
    {
      "id": "vendor-2",
      "name": "Replacement Option 1 (Netwrix)",
      "type": "replacement",
      "createdAt": "2026-03-27T14:38:52.765Z"
    },
    {
      "id": "vendor-3",
      "name": "Replacement Option 2",
      "type": "replacement",
      "createdAt": "2026-03-27T14:38:52.765Z"
    }
  ],
  "evaluators": [
    {
      "id": "eval-1",
      "name": "Default Evaluator",
      "email": "evaluator@example.com",
      "createdAt": "2026-03-27T14:38:52.765Z"
    }
  ],
  "criteriaProfiles": [
    {
      "id": "criteria-profile-default",
      "name": "Identity Governance Comparison",
      "description": "Standard identity governance evaluation criteria",
      "criteria": [
        {
          "id": "cat-pmn90bfj0-core-identity-governance",
          "category": "Core Identity Governance",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-core-identity-governance-user-lifecycle-automation-jml-",
              "name": "User Lifecycle Automation (JML)",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-core-identity-governance-access-request-approval-workflows",
              "name": "Access Request & Approval Workflows",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-core-identity-governance-certification-bulk-capabilities",
              "name": "Certification & Bulk Capabilities",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-hybrid-architecture",
          "category": "Hybrid Architecture",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-hybrid-architecture-architecture-model",
              "name": "Architecture Model",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-hybrid-architecture-hybrid-coexistence-support",
              "name": "Hybrid Coexistence Support",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-integration-connectivity",
          "category": "Integration & Connectivity",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-integration-connectivity-application-connectivity-model",
              "name": "Application Connectivity Model",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-integration-connectivity-workflow-integration-and-automation",
              "name": "Workflow Integration and Automation",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-integration-connectivity-itsm-workflow-integration",
              "name": "ITSM & Workflow Integration",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-integration-connectivity-integration-flexibility",
              "name": "Integration Flexibility",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-access-model-roles",
          "category": "Access Model & Roles",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-access-model-roles-decision-making-depth",
              "name": "Decision Making Depth",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-access-model-roles-role-design-composition",
              "name": "Role Design & Composition",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-access-model-roles-policy-model-enforcement",
              "name": "Policy Model & Enforcement",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-security-audit-compliance",
          "category": "Security, Audit & Compliance",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-security-audit-compliance-audit-depth-traceability",
              "name": "Audit Depth & Traceability",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-security-audit-compliance-change-detection-correction",
              "name": "Change Detection & Correction",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-security-audit-compliance-privileged-access-controls",
              "name": "Privileged Access Controls",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-security-audit-compliance-compliance-framework-support",
              "name": "Compliance Framework Support",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-customization-extensibility",
          "category": "Customization & Extensibility",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-customization-extensibility-workflow-customization",
              "name": "Workflow Customization",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-customization-extensibility-platform-automation-apis",
              "name": "Platform Automation & APIs",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-customization-extensibility-ui-branding-extensibility",
              "name": "UI & Branding Extensibility",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-customization-extensibility-scripting-low-code-tools",
              "name": "Scripting & Low-Code Tools",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-deployment-migration",
          "category": "Deployment & Migration",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-deployment-migration-planned-deployment-support",
              "name": "Planned Deployment Support",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-deployment-migration-deployment-model-flexibility",
              "name": "Deployment Model Flexibility",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-deployment-migration-migration-planning-tooling",
              "name": "Migration Planning & Tooling",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-deployment-migration-migration-cutover-readiness",
              "name": "Migration & Cutover Readiness",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-analytics-reporting",
          "category": "Analytics & Reporting",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-analytics-reporting-operational-reporting",
              "name": "Operational Reporting",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-analytics-reporting-compliance-audit-reporting",
              "name": "Compliance & Audit Reporting",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-analytics-reporting-dashboard-visualization",
              "name": "Dashboard & Visualization",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-support-model-slas",
          "category": "Support Model & SLAs",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-support-model-slas-support-coverage",
              "name": "Support Coverage",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-support-model-slas-portal-resources",
              "name": "Portal & Resources",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-support-model-slas-premium-tiers-slas",
              "name": "Premium Tiers & SLAs",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-vendor-stability-roadmap",
          "category": "Vendor Stability & Roadmap",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-vendor-stability-roadmap-vendor-viability",
              "name": "Vendor Viability",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-vendor-stability-roadmap-roadmap-transparency",
              "name": "Roadmap Transparency",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-vendor-stability-roadmap-partner-management",
              "name": "Partner Management",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        },
        {
          "id": "cat-pmn90bfj0-cost-commercial",
          "category": "Cost & Commercial",
          "subCriteria": [
            {
              "id": "sub-pmn90bfj0-cost-commercial-licensing-complexity",
              "name": "Licensing Complexity",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-cost-commercial-cost-predictability",
              "name": "Cost Predictability",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-cost-commercial-total-cost-of-ownership",
              "name": "Total Cost of Ownership",
              "description": "",
              "linkedRequirementIds": []
            },
            {
              "id": "sub-pmn90bfj0-cost-commercial-renewal-cost",
              "name": "Renewal Cost",
              "description": "",
              "linkedRequirementIds": []
            }
          ]
        }
      ],
      "createdAt": "2026-03-27T14:38:52.765Z",
      "updatedAt": "2026-03-27T14:38:52.765Z"
    }
  ],
  "activeCriteriaProfileId": "criteria-profile-default",
  "weightingProfiles": [
    {
      "id": "weighting-profile-default",
      "name": "Default Profile",
      "description": "Equal weighting across all criteria",
      "scaleConfig": {
        "type": "1-5"
      },
      "scoringMode": "sub-criteria",
      "weights": [
        {
          "criterionId": "cat-pmn90bfj0-core-identity-governance",
          "subCriterionId": "sub-pmn90bfj0-core-identity-governance-user-lifecycle-automation-jml-",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-core-identity-governance",
          "subCriterionId": "sub-pmn90bfj0-core-identity-governance-access-request-approval-workflows",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-core-identity-governance",
          "subCriterionId": "sub-pmn90bfj0-core-identity-governance-certification-bulk-capabilities",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-hybrid-architecture",
          "subCriterionId": "sub-pmn90bfj0-hybrid-architecture-architecture-model",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-hybrid-architecture",
          "subCriterionId": "sub-pmn90bfj0-hybrid-architecture-hybrid-coexistence-support",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-integration-connectivity",
          "subCriterionId": "sub-pmn90bfj0-integration-connectivity-application-connectivity-model",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-integration-connectivity",
          "subCriterionId": "sub-pmn90bfj0-integration-connectivity-workflow-integration-and-automation",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-integration-connectivity",
          "subCriterionId": "sub-pmn90bfj0-integration-connectivity-itsm-workflow-integration",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-integration-connectivity",
          "subCriterionId": "sub-pmn90bfj0-integration-connectivity-integration-flexibility",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-access-model-roles",
          "subCriterionId": "sub-pmn90bfj0-access-model-roles-decision-making-depth",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-access-model-roles",
          "subCriterionId": "sub-pmn90bfj0-access-model-roles-role-design-composition",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-access-model-roles",
          "subCriterionId": "sub-pmn90bfj0-access-model-roles-policy-model-enforcement",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-security-audit-compliance",
          "subCriterionId": "sub-pmn90bfj0-security-audit-compliance-audit-depth-traceability",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-security-audit-compliance",
          "subCriterionId": "sub-pmn90bfj0-security-audit-compliance-change-detection-correction",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-security-audit-compliance",
          "subCriterionId": "sub-pmn90bfj0-security-audit-compliance-privileged-access-controls",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-security-audit-compliance",
          "subCriterionId": "sub-pmn90bfj0-security-audit-compliance-compliance-framework-support",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-customization-extensibility",
          "subCriterionId": "sub-pmn90bfj0-customization-extensibility-workflow-customization",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-customization-extensibility",
          "subCriterionId": "sub-pmn90bfj0-customization-extensibility-platform-automation-apis",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-customization-extensibility",
          "subCriterionId": "sub-pmn90bfj0-customization-extensibility-ui-branding-extensibility",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-customization-extensibility",
          "subCriterionId": "sub-pmn90bfj0-customization-extensibility-scripting-low-code-tools",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-deployment-migration",
          "subCriterionId": "sub-pmn90bfj0-deployment-migration-planned-deployment-support",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-deployment-migration",
          "subCriterionId": "sub-pmn90bfj0-deployment-migration-deployment-model-flexibility",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-deployment-migration",
          "subCriterionId": "sub-pmn90bfj0-deployment-migration-migration-planning-tooling",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-deployment-migration",
          "subCriterionId": "sub-pmn90bfj0-deployment-migration-migration-cutover-readiness",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-analytics-reporting",
          "subCriterionId": "sub-pmn90bfj0-analytics-reporting-operational-reporting",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-analytics-reporting",
          "subCriterionId": "sub-pmn90bfj0-analytics-reporting-compliance-audit-reporting",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-analytics-reporting",
          "subCriterionId": "sub-pmn90bfj0-analytics-reporting-dashboard-visualization",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-support-model-slas",
          "subCriterionId": "sub-pmn90bfj0-support-model-slas-support-coverage",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-support-model-slas",
          "subCriterionId": "sub-pmn90bfj0-support-model-slas-portal-resources",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-support-model-slas",
          "subCriterionId": "sub-pmn90bfj0-support-model-slas-premium-tiers-slas",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-vendor-stability-roadmap",
          "subCriterionId": "sub-pmn90bfj0-vendor-stability-roadmap-vendor-viability",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-vendor-stability-roadmap",
          "subCriterionId": "sub-pmn90bfj0-vendor-stability-roadmap-roadmap-transparency",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-vendor-stability-roadmap",
          "subCriterionId": "sub-pmn90bfj0-vendor-stability-roadmap-partner-management",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-cost-commercial",
          "subCriterionId": "sub-pmn90bfj0-cost-commercial-licensing-complexity",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-cost-commercial",
          "subCriterionId": "sub-pmn90bfj0-cost-commercial-cost-predictability",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-cost-commercial",
          "subCriterionId": "sub-pmn90bfj0-cost-commercial-total-cost-of-ownership",
          "weight": 1
        },
        {
          "criterionId": "cat-pmn90bfj0-cost-commercial",
          "subCriterionId": "sub-pmn90bfj0-cost-commercial-renewal-cost",
          "weight": 1
        }
      ],
      "createdAt": "2026-03-27T14:38:52.765Z",
      "updatedAt": "2026-03-27T14:38:52.765Z"
    }
  ],
  "activeProfileId": "weighting-profile-default",
  "scores": []
};
