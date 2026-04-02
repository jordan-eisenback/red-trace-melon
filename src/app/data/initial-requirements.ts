import { Requirement } from "../types/requirement";

export const initialRequirements: Requirement[] = [
  {
    "id": "RBAC-ENT-001",
    "req": "Establish a standardized, enterprise role-based access governance model that defines roles, maps roles to entitlements, and governs access decisions consistently across applications",
    "type": "Enterprise",
    "outcome": "Consistent role-based access decisions across the enterprise",
    "owner": "RBAC Program / IAM Governance",
    "parent": null,
    "notes": "Implementation notes: Establish a standardized, enterprise role-based access governance model that defines roles, maps roles to entitlements, . Outcome: Consistent role-based access decisions across the enterprise. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-ENT-002",
    "req": "The system SHALL enforce least privilege access by ensuring users receive only the access required for their job function and by explicitly identifying and governing privileged or sensitive access",
    "type": "Enterprise",
    "outcome": "Reduced access risk and over-privilege",
    "owner": "RBAC Program / IAM Governance",
    "parent": null,
    "notes": "Implementation notes: The system SHALL enforce least privilege access by ensuring users receive only the access required for their job functio. Outcome: Reduced access risk and over-privilege. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-ENT-003",
    "req": "Govern the full access lifecycle, including request, approval, activation, review, revocation, and exception handling, in a repeatable and auditable manner",
    "type": "Enterprise",
    "outcome": "End-to-end controlled access lifecycle",
    "owner": "RBAC Program / IAM Governance",
    "parent": null,
    "notes": "Implementation notes: Govern the full access lifecycle, including request, approval, activation, review, revocation, and exception handling, i. Outcome: End-to-end controlled access lifecycle. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-ENT-004",
    "req": "Produce complete, attributable, and auditable evidence of access decisions sufficient to support SOX and other regulatory audits without manual reconstruction",
    "type": "Enterprise",
    "outcome": "Audit-ready access governance",
    "owner": "Audit / Compliance",
    "parent": null,
    "notes": "Implementation notes: Produce complete, attributable, and auditable evidence of access decisions sufficient to support SOX and other regulator. Outcome: Audit-ready access governance. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-ENT-005",
    "req": "The system SHALL support scalable onboarding of applications, identities, and roles without bespoke redesign or manual controls",
    "type": "Enterprise",
    "outcome": "Scalable RBAC adoption",
    "owner": "RBAC Program / IAM Governance",
    "parent": null,
    "notes": "Implementation notes: The system SHALL support scalable onboarding of applications, identities, and roles without bespoke redesign or manual c. Outcome: Scalable RBAC adoption. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-ENT-006",
    "req": "Define access intent, policy, and governance while delegating execution, automation, and enforcement to an enterprise IGA platform",
    "type": "Enterprise",
    "outcome": "Clear separation of governance and execution",
    "owner": "Enterprise IAM",
    "parent": null,
    "notes": "Implementation notes: Define access intent, policy, and governance while delegating execution, automation, and enforcement to an enterprise IG. Outcome: Clear separation of governance and execution. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-101",
    "req": "The system SHALL provide a standardized discovery model to capture application RBAC readiness inputs",
    "type": "Capability",
    "outcome": "Consistent, scalable application onboarding",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "notes": "Implementation notes: The system SHALL provide a standardized discovery model to capture application RBAC readiness inputs. Outcome: Consistent, scalable application onboarding. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-102",
    "req": "The system SHALL require completion of minimum discovery criteria before entitlement mapping",
    "type": "Capability",
    "outcome": "Readiness gating enforced",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "notes": "Implementation notes: The system SHALL require completion of minimum discovery criteria before entitlement mapping. Outcome: Readiness gating enforced. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-103",
    "req": "The system SHALL require identification of business and technical owners",
    "type": "Capability",
    "outcome": "Clear accountability",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL require identification of business and technical owners. Outcome: Clear accountability. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-104",
    "req": "The system SHALL require documented role constructs or confirmation none exist",
    "type": "Capability",
    "outcome": "Role clarity",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL require documented role constructs or confirmation none exist. Outcome: Role clarity. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-105",
    "req": "The system SHALL require a current permission inventory",
    "type": "Capability",
    "outcome": "Visibility into access risk",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL require a current permission inventory. Outcome: Visibility into access risk. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-106",
    "req": "The system SHALL identify privileged access paths during discovery",
    "type": "Capability",
    "outcome": "Early risk identification",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL identify privileged access paths during discovery. Outcome: Early risk identification. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-107",
    "req": "The system SHALL capture segregation-of-duties considerations",
    "type": "Capability",
    "outcome": "SoD risks identified",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL capture segregation-of-duties considerations. Outcome: SoD risks identified. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-108",
    "req": "The system SHALL track discovery lifecycle status",
    "type": "Capability",
    "outcome": "Operational transparency",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "notes": "Implementation notes: The system SHALL track discovery lifecycle status. Outcome: Operational transparency. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-109",
    "req": "The system SHALL retain discovery artifacts as audit evidence",
    "type": "Capability",
    "outcome": "Audit-ready onboarding evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL retain discovery artifacts as audit evidence. Outcome: Audit-ready onboarding evidence. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-110",
    "req": "The system SHALL support RBAC governance for non-human identities",
    "type": "Capability",
    "outcome": "Consistent governance across identity types",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL support RBAC governance for non-human identities. Outcome: Consistent governance across identity types. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-201",
    "req": "The system SHALL support explicit definition of business roles",
    "type": "Capability",
    "outcome": "Standardized role model",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL support explicit definition of business roles. Outcome: Standardized role model. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-202",
    "req": "The system SHALL enforce role eligibility criteria",
    "type": "Capability",
    "outcome": "Reduced inappropriate access",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL enforce role eligibility criteria. Outcome: Reduced inappropriate access. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-203",
    "req": "The system SHALL require documented role purpose and owner",
    "type": "Capability",
    "outcome": "Role accountability",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL require documented role purpose and owner. Outcome: Role accountability. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-204",
    "req": "The system SHALL support role lifecycle states",
    "type": "Capability",
    "outcome": "Controlled role evolution",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL support role lifecycle states. Outcome: Controlled role evolution. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-205",
    "req": "The system SHALL ensure users inherit access only through roles",
    "type": "Capability",
    "outcome": "Enforced least privilege",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL ensure users inherit access only through roles. Outcome: Enforced least privilege. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-206",
    "req": "The system SHALL automatically revoke access when role removed",
    "type": "Capability",
    "outcome": "Deterministic deprovisioning",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL automatically revoke access when role removed. Outcome: Deterministic deprovisioning. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-207",
    "req": "The system SHALL support role composition",
    "type": "Capability",
    "outcome": "Scalable role design",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "notes": "Implementation notes: The system SHALL support role composition. Outcome: Scalable role design. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-208",
    "req": "The system SHALL support periodic role review",
    "type": "Capability",
    "outcome": "Ongoing role hygiene",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL support periodic role review. Outcome: Ongoing role hygiene. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-209",
    "req": "The system SHALL require approval and justification for material role changes",
    "type": "Capability",
    "outcome": "Auditable role changes",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL require approval and justification for material role changes. Outcome: Auditable role changes. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-301",
    "req": "The system SHALL enforce role-to-permission mapping",
    "type": "Capability",
    "outcome": "Consistent access model",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL enforce role-to-permission mapping. Outcome: Consistent access model. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-302",
    "req": "The system SHALL require justification for permissions in roles",
    "type": "Capability",
    "outcome": "Least privilege defensibility",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL require justification for permissions in roles. Outcome: Least privilege defensibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-303",
    "req": "The system SHALL flag privileged entitlements during mapping",
    "type": "Capability",
    "outcome": "Privileged access visibility",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL flag privileged entitlements during mapping. Outcome: Privileged access visibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-304",
    "req": "The system SHALL require role owner approval for permission changes",
    "type": "Capability",
    "outcome": "Controlled permission lifecycle",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL require role owner approval for permission changes. Outcome: Controlled permission lifecycle. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-305",
    "req": "The system SHALL apply privileged designation using governance criteria",
    "type": "Capability",
    "outcome": "Risk-based governance",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL apply privileged designation using governance criteria. Outcome: Risk-based governance. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-401",
    "req": "The system SHALL support role-based access requests",
    "type": "Capability",
    "outcome": "Consistent request experience",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL support role-based access requests. Outcome: Consistent request experience. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-402",
    "req": "The system SHALL route approvals based on governance rules",
    "type": "Capability",
    "outcome": "Policy-driven approvals",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL route approvals based on governance rules. Outcome: Policy-driven approvals. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-403",
    "req": "The system SHALL record approval decisions as evidence",
    "type": "Capability",
    "outcome": "Attributable approval trail",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL record approval decisions as evidence. Outcome: Attributable approval trail. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-404",
    "req": "The system SHALL prevent fulfillment without approvals",
    "type": "Capability",
    "outcome": "Enforced authorization",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL prevent fulfillment without approvals. Outcome: Enforced authorization. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-405",
    "req": "The system SHALL support time-bound / JIT role activation",
    "type": "Capability",
    "outcome": "Reduced standing privilege",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL support time-bound / JIT role activation. Outcome: Reduced standing privilege. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-406",
    "req": "Automatically revoke JIT access",
    "type": "Capability",
    "outcome": "Automatic cleanup",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: Automatically revoke JIT access. Outcome: Automatic cleanup. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-407",
    "req": "The system SHALL record JIT events as audit evidence",
    "type": "Capability",
    "outcome": "Full lifecycle evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL record JIT events as audit evidence. Outcome: Full lifecycle evidence. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-501",
    "req": "The system SHALL support periodic access certifications",
    "type": "Capability",
    "outcome": "Ongoing access validation",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL support periodic access certifications. Outcome: Ongoing access validation. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-502",
    "req": "The system SHALL assign certifiers by governance rules",
    "type": "Capability",
    "outcome": "Correct reviewer assignment",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL assign certifiers by governance rules. Outcome: Correct reviewer assignment. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-503",
    "req": "The system SHALL record certification decisions",
    "type": "Capability",
    "outcome": "Attributable review evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL record certification decisions. Outcome: Attributable review evidence. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-504",
    "req": "The system SHALL trigger actions from certification outcomes",
    "type": "Capability",
    "outcome": "Closed-loop enforcement",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL trigger actions from certification outcomes. Outcome: Closed-loop enforcement. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-505",
    "req": "The system SHALL set certification cadence by risk tier",
    "type": "Capability",
    "outcome": "Risk-based reviews",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL set certification cadence by risk tier. Outcome: Risk-based reviews. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-601",
    "req": "The system SHALL support documented access exceptions",
    "type": "Capability",
    "outcome": "Governed deviations",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL support documented access exceptions. Outcome: Governed deviations. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-602",
    "req": "The system SHALL enforce expiration or revalidation of exceptions",
    "type": "Capability",
    "outcome": "Time-bound risk",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "notes": "Implementation notes: The system SHALL enforce expiration or revalidation of exceptions. Outcome: Time-bound risk. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-603",
    "req": "The system SHALL support emergency (break glass) access with review",
    "type": "Capability",
    "outcome": "Controlled emergency access",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: The system SHALL support emergency (break glass) access with review. Outcome: Controlled emergency access. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-604",
    "req": "The system SHALL retain exception and emergency evidence",
    "type": "Capability",
    "outcome": "Defensible non-standard access",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL retain exception and emergency evidence. Outcome: Defensible non-standard access. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-605",
    "req": "The system SHALL trigger role review from repeated exceptions",
    "type": "Capability",
    "outcome": "Role model improvement",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "notes": "Implementation notes: The system SHALL trigger role review from repeated exceptions. Outcome: Role model improvement. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-701",
    "req": "The system SHALL report who has access and why",
    "type": "Capability",
    "outcome": "Transparency",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL report who has access and why. Outcome: Transparency. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-702",
    "req": "The system SHALL retain historical access records",
    "type": "Capability",
    "outcome": "Longitudinal evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL retain historical access records. Outcome: Longitudinal evidence. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-703",
    "req": "The system SHALL support on-demand audit evidence",
    "type": "Capability",
    "outcome": "Zero manual reconstruction",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL support on-demand audit evidence. Outcome: Zero manual reconstruction. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-704",
    "req": "The system SHALL ensure evidence is complete and attributable",
    "type": "Capability",
    "outcome": "Compliance defensibility",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: The system SHALL ensure evidence is complete and attributable. Outcome: Compliance defensibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-801",
    "req": "RBAC depends on IGA for execution",
    "type": "Capability",
    "outcome": "Clear execution boundary",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-006",
    "notes": "Implementation notes: RBAC depends on IGA for execution. Outcome: Clear execution boundary. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-802",
    "req": "IGA is system of record for roles and assignments",
    "type": "Capability",
    "outcome": "Authoritative source",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-006",
    "notes": "Implementation notes: IGA is system of record for roles and assignments. Outcome: Authoritative source. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-803",
    "req": "IGA executes provisioning, certification, JIT",
    "type": "Capability",
    "outcome": "Lifecycle automation",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "notes": "Implementation notes: IGA executes provisioning, certification, JIT. Outcome: Lifecycle automation. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-CAP-804",
    "req": "IGA retains audit evidence for all access events",
    "type": "Capability",
    "outcome": "Centralized evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "notes": "Implementation notes: IGA retains audit evidence for all access events. Outcome: Centralized evidence. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-001",
    "req": "The system SHALL support hybrid identity environments spanning on-premises and SaaS",
    "type": "IGA Functional",
    "outcome": "RBAC roles executable across all environments",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support hybrid identity environments spanning on-premises and SaaS. Outcome: RBAC roles executable across all environments. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-002",
    "req": "The system SHALL support coexistence of on-premises and SaaS components with equivalent capability",
    "type": "IGA Functional",
    "outcome": "Phased RBAC adoption without disruption",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support coexistence of on-premises and SaaS components with equivalent capability. Outcome: Phased RBAC adoption without disruption. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-003",
    "req": "The system SHALL support phased migration and parallel operation with legacy IAM systems",
    "type": "IGA Functional",
    "outcome": "RBAC transition without access loss",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support phased migration and parallel operation with legacy IAM systems. Outcome: RBAC transition without access loss. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-004",
    "req": "The system SHALL support governance of connected and non-connected applications",
    "type": "IGA Functional",
    "outcome": "Complete access governance coverage",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support governance of connected and non-connected applications. Outcome: Complete access governance coverage. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-005",
    "req": "The system SHALL include non-connected applications in access reviews and certifications",
    "type": "IGA Functional",
    "outcome": "All access subject to review",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL include non-connected applications in access reviews and certifications. Outcome: All access subject to review. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-006",
    "req": "The system SHALL support standard enterprise integration patterns (APIs, directories, DBs, files, SCIM)",
    "type": "IGA Functional",
    "outcome": "Standardized provisioning execution",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support standard enterprise integration patterns (APIs, directories, DBs, files, SCIM). Outcome: Standardized provisioning execution. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-007",
    "req": "The system SHALL provide prebuilt connectors for common enterprise and SaaS systems",
    "type": "IGA Functional",
    "outcome": "Faster application onboarding",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL provide prebuilt connectors for common enterprise and SaaS systems. Outcome: Faster application onboarding. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-008",
    "req": "The system SHALL provide extensibility mechanisms where direct connectors do not exist",
    "type": "IGA Functional",
    "outcome": "Long-tail application support",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL provide extensibility mechanisms where direct connectors do not exist. Outcome: Long-tail application support. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-009",
    "req": "The system SHALL provide comprehensive audit logging for identity, access, and governance actions",
    "type": "IGA Functional",
    "outcome": "Foundational audit trail",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL provide comprehensive audit logging for identity, access, and governance actions. Outcome: Foundational audit trail. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-010",
    "req": "The system SHALL capture approver identity, timestamps, and before/after access state",
    "type": "IGA Functional",
    "outcome": "Full decision traceability",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL capture approver identity, timestamps, and before/after access state. Outcome: Full decision traceability. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-011",
    "req": "The system SHALL support configurable audit log retention policies",
    "type": "IGA Functional",
    "outcome": "Evidence retained per policy",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL support configurable audit log retention policies. Outcome: Evidence retained per policy. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-012",
    "req": "The system SHALL detect and report governed directory and group membership changes",
    "type": "IGA Functional",
    "outcome": "Access drift visibility",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL detect and report governed directory and group membership changes. Outcome: Access drift visibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-013",
    "req": "The system SHALL detect access granted outside IGA-governed workflows",
    "type": "IGA Functional",
    "outcome": "Exception and violation detection",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL detect access granted outside IGA-governed workflows. Outcome: Exception and violation detection. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-014",
    "req": "The system SHALL retain reconciliation actions and outcomes as audit evidence",
    "type": "IGA Functional",
    "outcome": "Proof of remediation",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL retain reconciliation actions and outcomes as audit evidence. Outcome: Proof of remediation. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-015",
    "req": "The system SHALL support periodic access certifications by role and/or entitlement",
    "type": "IGA Functional",
    "outcome": "Ongoing access validation",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support periodic access certifications by role and/or entitlement. Outcome: Ongoing access validation. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-016",
    "req": "The system SHALL retain certification decisions with reviewer, outcome, and timestamp",
    "type": "IGA Functional",
    "outcome": "Certification evidence",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "notes": "Implementation notes: The system SHALL retain certification decisions with reviewer, outcome, and timestamp. Outcome: Certification evidence. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-017",
    "req": "The system SHALL support role-level certifications",
    "type": "IGA Functional",
    "outcome": "RBAC-native reviews",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support role-level certifications. Outcome: RBAC-native reviews. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-018",
    "req": "Automatically revoke access when removal is approved during certification",
    "type": "IGA Functional",
    "outcome": "Closed-loop access removal",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: Automatically revoke access when removal is approved during certification. Outcome: Closed-loop access removal. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-019",
    "req": "The system SHALL support certification delegation, escalation, and overdue tracking",
    "type": "IGA Functional",
    "outcome": "Scalable certification operations",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support certification delegation, escalation, and overdue tracking. Outcome: Scalable certification operations. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-020",
    "req": "The system SHALL support hybrid identity environments spanning on-prem and SaaS",
    "type": "IGA Functional",
    "outcome": "Hybrid execution supported",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "notes": "Duplicate of RBAC-IGA-001. Implementation notes: The system SHALL support hybrid identity environments spanning on-prem and SaaS. Outcome: Hybrid execution supported. Provide concrete mapping, config, or references.",
    "status": "Not Validated"
  },
  {
    "id": "RBAC-IGA-021",
    "req": "The system SHALL support coexistence of on-prem and SaaS components",
    "type": "IGA Functional",
    "outcome": "Parallel execution",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support coexistence of on-prem and SaaS components. Outcome: Parallel execution. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-022",
    "req": "The system SHALL support phased migration with legacy IAM",
    "type": "IGA Functional",
    "outcome": "No access disruption",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: The system SHALL support phased migration with legacy IAM. Outcome: No access disruption. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-023",
    "req": "The system SHALL ingest access from connected and non-connected apps",
    "type": "IGA Functional",
    "outcome": "Complete access visibility",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "notes": "Implementation notes: The system SHALL ingest access from connected and non-connected apps. Outcome: Complete access visibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-024",
    "req": "The system SHALL support API, directory, JDBC, file ingestion",
    "type": "IGA Functional",
    "outcome": "Standard ingestion",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "notes": "Implementation notes: The system SHALL support API, directory, JDBC, file ingestion. Outcome: Standard ingestion. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-025",
    "req": "The system SHALL correlate accounts and entitlements to roles",
    "type": "IGA Functional",
    "outcome": "Accurate role mapping",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-201",
    "notes": "Implementation notes: The system SHALL correlate accounts and entitlements to roles. Outcome: Accurate role mapping. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-026",
    "req": "The system SHALL flag privileged access during ingestion",
    "type": "IGA Functional",
    "outcome": "Privileged visibility",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-303",
    "notes": "Implementation notes: The system SHALL flag privileged access during ingestion. Outcome: Privileged visibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-027",
    "req": "The system SHALL enforce RBAC role execution",
    "type": "IGA Functional",
    "outcome": "Deterministic access",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-201",
    "notes": "Implementation notes: The system SHALL enforce RBAC role execution. Outcome: Deterministic access. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-028",
    "req": "The system SHALL support ABAC eligibility enforcement",
    "type": "IGA Functional",
    "outcome": "Policy-based access",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-202",
    "notes": "Implementation notes: The system SHALL support ABAC eligibility enforcement. Outcome: Policy-based access. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-029",
    "req": "Auto-revoke access on attribute change",
    "type": "IGA Functional",
    "outcome": "Lifecycle enforcement",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-206",
    "notes": "Implementation notes: Auto-revoke access on attribute change. Outcome: Lifecycle enforcement. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-030",
    "req": "The system SHALL prevent direct entitlement bypass",
    "type": "IGA Functional",
    "outcome": "No uncontrolled access",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-301",
    "notes": "Implementation notes: The system SHALL prevent direct entitlement bypass. Outcome: No uncontrolled access. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-031",
    "req": "The system SHALL execute provisioning independent of intake UI",
    "type": "IGA Functional",
    "outcome": "Reliable fulfillment",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL execute provisioning independent of intake UI. Outcome: Reliable fulfillment. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-032",
    "req": "The system SHALL support cross-system orchestration",
    "type": "IGA Functional",
    "outcome": "End-to-end provisioning",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL support cross-system orchestration. Outcome: End-to-end provisioning. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-033",
    "req": "Auto-revoke access from certifications",
    "type": "IGA Functional",
    "outcome": "Closed-loop governance",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-504",
    "notes": "Implementation notes: Auto-revoke access from certifications. Outcome: Closed-loop governance. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-034",
    "req": "The system SHALL support just-in-time privileged access",
    "type": "IGA Functional",
    "outcome": "Reduced standing privilege",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-405",
    "notes": "Implementation notes: The system SHALL support just-in-time privileged access. Outcome: Reduced standing privilege. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-035",
    "req": "Automatically expire JIT access",
    "type": "IGA Functional",
    "outcome": "Time-bound enforcement",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-406",
    "notes": "Implementation notes: Automatically expire JIT access. Outcome: Time-bound enforcement. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-036",
    "req": "The system SHALL retain JIT approval and expiration evidence",
    "type": "IGA Functional",
    "outcome": "Auditable JIT",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-407",
    "notes": "Implementation notes: The system SHALL retain JIT approval and expiration evidence. Outcome: Auditable JIT. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-037",
    "req": "The system SHALL support role and entitlement certifications",
    "type": "IGA Functional",
    "outcome": "Ongoing validation",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "notes": "Implementation notes: The system SHALL support role and entitlement certifications. Outcome: Ongoing validation. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-038",
    "req": "The system SHALL support role-level certifications",
    "type": "IGA Functional",
    "outcome": "RBAC-native reviews",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "notes": "Duplicate of RBAC-IGA-017. Implementation notes: The system SHALL support role-level certifications. Outcome: RBAC-native reviews. Provide concrete mapping, config, or references.",
    "status": "Not Validated"
  },
  {
    "id": "RBAC-IGA-039",
    "req": "The system SHALL support escalation and overdue tracking",
    "type": "IGA Functional",
    "outcome": "Scalable certifications",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "notes": "Duplicate of RBAC-IGA-019. Implementation notes: The system SHALL support escalation and overdue tracking. Outcome: Scalable certifications. Provide concrete mapping, config, or references.",
    "status": "Not Validated"
  },
  {
    "id": "RBAC-IGA-040",
    "req": "The system SHALL capture attributable audit logs",
    "type": "IGA Functional",
    "outcome": "Audit defensibility",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "notes": "Implementation notes: The system SHALL capture attributable audit logs. Outcome: Audit defensibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-041",
    "req": "The system SHALL detect out-of-band access",
    "type": "IGA Functional",
    "outcome": "Drift detection",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-701",
    "notes": "Implementation notes: The system SHALL detect out-of-band access. Outcome: Drift detection. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-IGA-042",
    "req": "The system SHALL retain reconciliation history",
    "type": "IGA Functional",
    "outcome": "Historical evidence",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-702",
    "notes": "Implementation notes: The system SHALL retain reconciliation history. Outcome: Historical evidence. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-001",
    "req": "The system SHALL consume joiner/mover/leaver lifecycle events from Workday HR",
    "type": "Interface",
    "outcome": "Authoritative lifecycle",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-105",
    "notes": "Implementation notes: The system SHALL consume joiner/mover/leaver lifecycle events from Workday HR. Outcome: Authoritative lifecycle. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-002",
    "req": "The system SHALL ingest identity attributes from Workday to drive role eligibility",
    "type": "Interface",
    "outcome": "Deterministic eligibility",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-206",
    "notes": "Implementation notes: The system SHALL ingest identity attributes from Workday to drive role eligibility. Outcome: Deterministic eligibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-003",
    "req": "The system SHALL refresh Workday attributes to support timely access changes",
    "type": "Interface",
    "outcome": "Near real-time enforcement",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-206",
    "notes": "Implementation notes: The system SHALL refresh Workday attributes to support timely access changes. Outcome: Near real-time enforcement. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-004",
    "req": "The system SHALL retain audit evidence of Workday attribute changes affecting access",
    "type": "Interface",
    "outcome": "Audit defensibility",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-704",
    "notes": "Implementation notes: The system SHALL retain audit evidence of Workday attribute changes affecting access. Outcome: Audit defensibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-005",
    "req": "The system SHALL ingest directory accounts and groups",
    "type": "Interface",
    "outcome": "Directory visibility",
    "owner": "IAM",
    "parent": "RBAC-CAP-105",
    "notes": "Implementation notes: The system SHALL ingest directory accounts and groups. Outcome: Directory visibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-006",
    "req": "The system SHALL map directory groups to roles",
    "type": "Interface",
    "outcome": "RBAC enforcement",
    "owner": "IAM",
    "parent": "RBAC-CAP-201",
    "notes": "Implementation notes: The system SHALL map directory groups to roles. Outcome: RBAC enforcement. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-007",
    "req": "The system SHALL flag privileged directory groups",
    "type": "Interface",
    "outcome": "Privileged visibility",
    "owner": "IAM",
    "parent": "RBAC-CAP-303",
    "notes": "Implementation notes: The system SHALL flag privileged directory groups. Outcome: Privileged visibility. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-008",
    "req": "Provision directory memberships",
    "type": "Interface",
    "outcome": "Automated enforcement",
    "owner": "IAM",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: Provision directory memberships. Outcome: Automated enforcement. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-009",
    "req": "Revoke directory access on role removal",
    "type": "Interface",
    "outcome": "Deterministic revocation",
    "owner": "IAM",
    "parent": "RBAC-CAP-504",
    "notes": "Implementation notes: Revoke directory access on role removal. Outcome: Deterministic revocation. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-010",
    "req": "The system SHALL detect out-of-band directory changes",
    "type": "Interface",
    "outcome": "Drift detection",
    "owner": "IAM",
    "parent": "RBAC-CAP-701",
    "notes": "Duplicate of RBAC-IGA-041. Implementation notes: The system SHALL detect out-of-band directory changes. Outcome: Drift detection. Provide concrete mapping, config, or references.",
    "status": "Not Validated"
  },
  {
    "id": "RBAC-INT-011",
    "req": "The system SHALL retain directory reconciliation evidence",
    "type": "Interface",
    "outcome": "Audit history",
    "owner": "IAM",
    "parent": "RBAC-CAP-702",
    "notes": "Implementation notes: The system SHALL retain directory reconciliation evidence. Outcome: Audit history. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-012",
    "req": "The system SHALL receive access request intake from ServiceNow ITSM",
    "type": "Interface",
    "outcome": "Standardized requests",
    "owner": "ServiceNow ↔ IGA Integration",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL receive access request intake from ServiceNow ITSM. Outcome: Standardized requests. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-013",
    "req": "The system SHALL execute fulfillment for ServiceNow-approved access requests",
    "type": "Interface",
    "outcome": "End-to-end traceability",
    "owner": "ServiceNow ↔ IGA Integration",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL execute fulfillment for ServiceNow-approved access requests. Outcome: End-to-end traceability. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-014",
    "req": "The system SHALL block fulfillment of ServiceNow requests until approval is recorded",
    "type": "Interface",
    "outcome": "No bypass paths",
    "owner": "ServiceNow ↔ IGA Integration",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL block fulfillment of ServiceNow requests until approval is recorded. Outcome: No bypass paths. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-015",
    "req": "The system SHALL provide standard connectors",
    "type": "Interface",
    "outcome": "Fast onboarding",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "notes": "Implementation notes: The system SHALL provide standard connectors. Outcome: Fast onboarding. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-016",
    "req": "The system SHALL support extensibility where connectors unavailable",
    "type": "Interface",
    "outcome": "Long-tail coverage",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "notes": "Implementation notes: The system SHALL support extensibility where connectors unavailable. Outcome: Long-tail coverage. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-017",
    "req": "Provision via API/JDBC/REST",
    "type": "Interface",
    "outcome": "Target execution",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: Provision via API/JDBC/REST. Outcome: Target execution. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-018",
    "req": "The system SHALL support governed scripting",
    "type": "Interface",
    "outcome": "Scripted coverage",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL support governed scripting. Outcome: Scripted coverage. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-INT-019",
    "req": "Script execution is auditable",
    "type": "Interface",
    "outcome": "Auditable automation",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "notes": "Implementation notes: Script execution is auditable. Outcome: Auditable automation. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-001",
    "req": "The system SHALL provide 24x7 support for critical failures",
    "type": "NFR",
    "outcome": "Operational continuity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL provide 24x7 support for critical failures. Outcome: Operational continuity. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-002",
    "req": "Define SLA response times for failures",
    "type": "NFR",
    "outcome": "Predictable response",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: Define SLA response times for failures. Outcome: Predictable response. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-003",
    "req": "Prioritize incidents impacting audit evidence",
    "type": "NFR",
    "outcome": "Audit protection",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "notes": "Implementation notes: Prioritize incidents impacting audit evidence. Outcome: Audit protection. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-004",
    "req": "Scale ingestion to enterprise volumes",
    "type": "NFR",
    "outcome": "Enterprise scale",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "notes": "Implementation notes: Scale ingestion to enterprise volumes. Outcome: Enterprise scale. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-005",
    "req": "The system SHALL support peak provisioning loads",
    "type": "NFR",
    "outcome": "Performance stability",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL support peak provisioning loads. Outcome: Performance stability. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-006",
    "req": "The system SHALL support large certification campaigns",
    "type": "NFR",
    "outcome": "Scalable reviews",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "notes": "Implementation notes: The system SHALL support large certification campaigns. Outcome: Scalable reviews. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-007",
    "req": "The system SHALL prevent unauthorized provisioning",
    "type": "NFR",
    "outcome": "Control integrity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-201",
    "notes": "Implementation notes: The system SHALL prevent unauthorized provisioning. Outcome: Control integrity. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-008",
    "req": "Protect audit logs from tampering",
    "type": "NFR",
    "outcome": "Evidence integrity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "notes": "Implementation notes: Protect audit logs from tampering. Outcome: Evidence integrity. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-009",
    "req": "Govern IGA admin access",
    "type": "NFR",
    "outcome": "Admin accountability",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "notes": "Implementation notes: Govern IGA admin access. Outcome: Admin accountability. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-010",
    "req": "Publish release cadence",
    "type": "NFR",
    "outcome": "Predictable change",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "notes": "Implementation notes: Publish release cadence. Outcome: Predictable change. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-011",
    "req": "The system SHALL support phased rollouts",
    "type": "NFR",
    "outcome": "Low-risk upgrades",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "notes": "Implementation notes: The system SHALL support phased rollouts. Outcome: Low-risk upgrades. Provide concrete mapping, config, or references."
  },
  {
    "id": "RBAC-NFR-012",
    "req": "Preserve audit evidence across upgrades",
    "type": "NFR",
    "outcome": "Audit continuity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "notes": "Implementation notes: Preserve audit evidence across upgrades. Outcome: Audit continuity. Provide concrete mapping, config, or references."
  }
];
