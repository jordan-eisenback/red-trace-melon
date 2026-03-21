import { Requirement } from "../types/requirement";

export const initialRequirements: Requirement[] = [
  {
    "id": "RBAC-ENT-001",
    "req": "Establish a standardized, enterprise role-based access governance model that defines roles, maps roles to entitlements, and governs access decisions consistently across applications",
    "type": "Enterprise",
    "outcome": "Consistent role-based access decisions across the enterprise",
    "owner": "RBAC Program / IAM Governance",
    "parent": "None",
    "_raw": "RBAC-ENT-001\tEstablish a standardized, enterprise role-based access governance model that defines roles, maps roles to entitlements, and governs access decisions consistently across applications\tEnterprise\tRBAC Program / IAM Governance\tNone\tConsistent role-based access decisions across the enterprise\tFoundation requirement; all RBAC capabilities roll up here\tApproved\tMust Have\tRBAC-TC-087, RBAC-TC-143, RBAC-TC-144, RBAC-TC-145, RBAC-TC-146\tIAM Team\tGIVEN a role-based access model is defined, WHEN access decisions are made across applications, THEN all decisions follow standardized role definitions with 100% consistency\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-ENT-002",
    "req": "The system SHALL enforce least privilege access by ensuring users receive only the access required for their job function and by explicitly identifying and governing privileged or sensitive access",
    "type": "Enterprise",
    "outcome": "Reduced access risk and over-privilege",
    "owner": "RBAC Program / IAM Governance",
    "parent": "None",
    "_raw": "RBAC-ENT-002\tThe system SHALL enforce least privilege access by ensuring users receive only the access required for their job function and by explicitly identifying and governing privileged or sensitive access\tEnterprise\tRBAC Program / IAM Governance\tNone\tReduced access risk and over-privilege\tDrives privileged designation, SoD, and risk-based controls\tApproved\tMust Have\tRBAC-TC-088\tIAM Governance Lead\tGIVEN least privilege policy is enforced, WHEN users are provisioned access, THEN access is limited to job function requirements AND privileged access is explicitly flagged\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-ENT-003",
    "req": "Govern the full access lifecycle, including request, approval, activation, review, revocation, and exception handling, in a repeatable and auditable manner",
    "type": "Enterprise",
    "outcome": "End-to-end controlled access lifecycle",
    "owner": "RBAC Program / IAM Governance",
    "parent": "None",
    "_raw": "RBAC-ENT-003\tGovern the full access lifecycle, including request, approval, activation, review, revocation, and exception handling, in a repeatable and auditable manner\tEnterprise\tRBAC Program / IAM Governance\tNone\tEnd-to-end controlled access lifecycle\tLifecycle completeness and determinism\tApproved\tMust Have\tRBAC-TC-001, RBAC-TC-002\tIAM Team\tGIVEN the access lifecycle is governed, WHEN any access event occurs (request/approval/activation/review/revocation/exception), THEN the event is logged with full audit trail\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-ENT-004",
    "req": "Produce complete, attributable, and auditable evidence of access decisions sufficient to support SOX and other regulatory audits without manual reconstruction",
    "type": "Enterprise",
    "outcome": "Audit-ready access governance",
    "owner": "Audit / Compliance",
    "parent": "None",
    "_raw": "RBAC-ENT-004\tProduce complete, attributable, and auditable evidence of access decisions sufficient to support SOX and other regulatory audits without manual reconstruction\tEnterprise\tAudit / Compliance\tNone\tAudit-ready access governance\tEliminates spreadsheets, screenshots, and tribal knowledge\tApproved\tMust Have\tRBAC-TC-003\tCompliance & Audit Team\tGIVEN SOX audit requirements, WHEN evidence is requested, THEN complete attributable evidence is retrievable without manual reconstruction within 24 hours\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-ENT-005",
    "req": "The system SHALL support scalable onboarding of applications, identities, and roles without bespoke redesign or manual controls",
    "type": "Enterprise",
    "outcome": "Scalable RBAC adoption",
    "owner": "RBAC Program / IAM Governance",
    "parent": "None",
    "_raw": "RBAC-ENT-005\tThe system SHALL support scalable onboarding of applications, identities, and roles without bespoke redesign or manual controls\tEnterprise\tRBAC Program / IAM Governance\tNone\tScalable RBAC adoption\tEnables enterprise-wide rollout\tApproved\tMust Have\tRBAC-TC-089\tIAM Team\tGIVEN new applications/identities/roles need onboarding, WHEN onboarding is initiated, THEN standard templates are used with no bespoke development required\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-ENT-006",
    "req": "Define access intent, policy, and governance while delegating execution, automation, and enforcement to an enterprise IGA platform",
    "type": "Enterprise",
    "outcome": "Clear separation of governance and execution",
    "owner": "Enterprise IAM",
    "parent": "None",
    "_raw": "RBAC-ENT-006\tDefine access intent, policy, and governance while delegating execution, automation, and enforcement to an enterprise IGA platform\tEnterprise\tEnterprise IAM\tNone\tClear separation of governance and execution\tRBAC governs; IGA executes\tApproved\tMust Have\tRBAC-TC-090\tIAM Team\tGIVEN RBAC defines policy and IGA executes, WHEN access changes occur, THEN RBAC governs intent AND IGA automates enforcement with clear separation\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-101",
    "req": "The system SHALL provide a standardized discovery model to capture application RBAC readiness inputs",
    "type": "Capability",
    "outcome": "Consistent, scalable application onboarding",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "_raw": "RBAC-CAP-101\tThe system SHALL provide a standardized discovery model to capture application RBAC readiness inputs\tCapability\tRBAC Product\tRBAC-ENT-005\tConsistent, scalable application onboarding\tEnables repeatable intake without bespoke analysis\tApproved\tCould Have\tRBAC-TC-004\tRBAC Product Team\tGIVEN a new application, WHEN discovery is initiated, THEN standardized intake questionnaire is presented with all required fields\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-102",
    "req": "The system SHALL require completion of minimum discovery criteria before entitlement mapping",
    "type": "Capability",
    "outcome": "Readiness gating enforced",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "_raw": "RBAC-CAP-102\tThe system SHALL require completion of minimum discovery criteria before entitlement mapping\tCapability\tRBAC Product\tRBAC-ENT-005\tReadiness gating enforced\tPrevents premature onboarding\tApproved\tCould Have\tRBAC-TC-005\tRBAC Product Team\tGIVEN discovery is incomplete, WHEN user attempts entitlement mapping, THEN system blocks with clear error message\t1\t2026-03-20\tRBAC-CAP-101\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-103",
    "req": "The system SHALL require identification of business and technical owners",
    "type": "Capability",
    "outcome": "Clear accountability",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-103\tThe system SHALL require identification of business and technical owners\tCapability\tRBAC Product\tRBAC-ENT-001\tClear accountability\tOwnership is prerequisite to governance\tApproved\tCould Have\tRBAC-TC-006\tRBAC Product Team\tGIVEN discovery submission, WHEN owner fields are empty, THEN system rejects with validation error\t1\t2026-03-20\tRBAC-CAP-101\t\tEmployee, Contractor, Vendor, Dealer\tN/A"
  },
  {
    "id": "RBAC-CAP-104",
    "req": "The system SHALL require documented role constructs or confirmation none exist",
    "type": "Capability",
    "outcome": "Role clarity",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-104\tThe system SHALL require documented role constructs or confirmation none exist\tCapability\tRBAC Product\tRBAC-ENT-001\tRole clarity\tAvoids hidden or ad-hoc roles\tApproved\tCould Have\tRBAC-TC-007\tRBAC Product Team\tGIVEN discovery process, WHEN role constructs exist, THEN they are documented; WHEN none exist, THEN explicit confirmation is required\t1\t2026-03-20\tRBAC-CAP-103\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-105",
    "req": "The system SHALL require a current permission inventory",
    "type": "Capability",
    "outcome": "Visibility into access risk",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-105\tThe system SHALL require a current permission inventory\tCapability\tRBAC Product\tRBAC-ENT-002\tVisibility into access risk\tBaseline for least privilege\tApproved\tCould Have\tRBAC-TC-008\tRBAC Product Team\tGIVEN discovery process, WHEN permission inventory is missing, THEN system blocks progression\t1\t2026-03-20\tRBAC-CAP-101\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-106",
    "req": "The system SHALL identify privileged access paths during discovery",
    "type": "Capability",
    "outcome": "Early risk identification",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-106\tThe system SHALL identify privileged access paths during discovery\tCapability\tRBAC Product\tRBAC-ENT-002\tEarly risk identification\tDrives heightened governance\tApproved\tMust Have\tRBAC-TC-009\tRBAC Product Team\tGIVEN discovery process, WHEN privileged access paths exist, THEN they are flagged for heightened governance\t1\t2026-03-20\tRBAC-CAP-105\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-107",
    "req": "The system SHALL capture segregation-of-duties considerations",
    "type": "Capability",
    "outcome": "SoD risks identified",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-107\tThe system SHALL capture segregation-of-duties considerations\tCapability\tRBAC Product\tRBAC-ENT-002\tSoD risks identified\tSupports compliance controls\tApproved\tMust Have\tRBAC-TC-010\tRBAC Product Team\tGIVEN discovery process, WHEN SoD conflicts are identified, THEN they are captured and linked to compliance rules\t1\t2026-03-20\tRBAC-CAP-106\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-108",
    "req": "The system SHALL track discovery lifecycle status",
    "type": "Capability",
    "outcome": "Operational transparency",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "_raw": "RBAC-CAP-108\tThe system SHALL track discovery lifecycle status\tCapability\tRBAC Product\tRBAC-ENT-005\tOperational transparency\tEnables scalable pipeline management\tApproved\tShould Have\tRBAC-TC-011\tRBAC Product Team\tGIVEN discovery lifecycle, WHEN status changes, THEN transitions are tracked with timestamps\t1\t2026-03-20\tRBAC-CAP-101\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-109",
    "req": "The system SHALL retain discovery artifacts as audit evidence",
    "type": "Capability",
    "outcome": "Audit-ready onboarding evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-109\tThe system SHALL retain discovery artifacts as audit evidence\tCapability\tRBAC Product\tRBAC-ENT-004\tAudit-ready onboarding evidence\tEliminates manual reconstruction\tApproved\tMust Have\tRBAC-TC-012\tRBAC Product Team\tGIVEN audit request, WHEN discovery artifacts are requested, THEN all documents are retrievable\t1\t2026-03-20\tRBAC-CAP-108\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-110",
    "req": "The system SHALL support RBAC governance for non-human identities",
    "type": "Capability",
    "outcome": "Consistent governance across identity types",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-110\tThe system SHALL support RBAC governance for non-human identities\tCapability\tRBAC Product\tRBAC-ENT-001\tConsistent governance across identity types\tNon-human access governed, not excluded\tApproved\tCould Have\tRBAC-TC-013, RBAC-TC-147\tRBAC Product Team\tGIVEN non-human identity, WHEN discovery is executed, THEN governance model applies equally to service accounts\t1\t2026-03-20\tRBAC-CAP-101\t\tNon-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-201",
    "req": "The system SHALL support explicit definition of business roles",
    "type": "Capability",
    "outcome": "Standardized role model",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-201\tThe system SHALL support explicit definition of business roles\tCapability\tRBAC Product\tRBAC-ENT-001\tStandardized role model\tRoles reflect job functions\tApproved\tShould Have\tRBAC-TC-065, RBAC-TC-157, RBAC-TC-163\tRBAC Product Team\tGIVEN role creation, WHEN business role is defined, THEN name, description, owner, and eligibility are captured\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-202",
    "req": "The system SHALL enforce role eligibility criteria",
    "type": "Capability",
    "outcome": "Reduced inappropriate access",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-202\tThe system SHALL enforce role eligibility criteria\tCapability\tRBAC Product\tRBAC-ENT-002\tReduced inappropriate access\tPrevents over-assignment\tApproved\tCould Have\tRBAC-TC-021, RBAC-TC-022, RBAC-TC-158\tRBAC Product Team\tGIVEN role assignment, WHEN eligibility criteria not met, THEN assignment is blocked\t1\t2026-03-20\tRBAC-CAP-201\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-203",
    "req": "The system SHALL require documented role purpose and owner",
    "type": "Capability",
    "outcome": "Role accountability",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-203\tThe system SHALL require documented role purpose and owner\tCapability\tRBAC Product\tRBAC-ENT-001\tRole accountability\tOwnership enables lifecycle governance\tApproved\tCould Have\tRBAC-TC-066\tRBAC Product Team\tGIVEN role creation, WHEN purpose or owner is missing, THEN system rejects creation\t1\t2026-03-20\tRBAC-CAP-201\t\tEmployee, Contractor, Vendor, Dealer\tN/A"
  },
  {
    "id": "RBAC-CAP-204",
    "req": "The system SHALL support role lifecycle states",
    "type": "Capability",
    "outcome": "Controlled role evolution",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-204\tThe system SHALL support role lifecycle states\tCapability\tRBAC Product\tRBAC-ENT-003\tControlled role evolution\tPrevents orphaned roles\tApproved\tShould Have\tRBAC-TC-067\tRBAC Product Team\tGIVEN role lifecycle, WHEN status changes (Draft/Active/Deprecated/Retired), THEN transitions are logged with approvals\t1\t2026-03-20\tRBAC-CAP-201\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-205",
    "req": "The system SHALL ensure users inherit access only through roles",
    "type": "Capability",
    "outcome": "Enforced least privilege",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-205\tThe system SHALL ensure users inherit access only through roles\tCapability\tRBAC Product\tRBAC-ENT-002\tEnforced least privilege\tEliminates direct entitlement sprawl\tApproved\tCould Have\tRBAC-TC-024\tRBAC Product Team\tGIVEN access model, WHEN user access is evaluated, THEN all access is inherited through roles only\t1\t2026-03-20\tRBAC-CAP-201\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-206",
    "req": "The system SHALL automatically revoke access when role removed",
    "type": "Capability",
    "outcome": "Deterministic deprovisioning",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-206\tThe system SHALL automatically revoke access when role removed\tCapability\tRBAC Product\tRBAC-ENT-003\tDeterministic deprovisioning\tNo manual cleanup\tApproved\tMust Have\tRBAC-TC-023, RBAC-TC-148, RBAC-TC-149, RBAC-TC-152, RBAC-TC-153, RBAC-TC-172\tRBAC Product Team\tGIVEN role removal, WHEN role is removed from user, THEN all associated access is automatically revoked within SLA\t1\t2026-03-20\tRBAC-CAP-204\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-CAP-207",
    "req": "The system SHALL support role composition",
    "type": "Capability",
    "outcome": "Scalable role design",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-005",
    "_raw": "RBAC-CAP-207\tThe system SHALL support role composition\tCapability\tRBAC Product\tRBAC-ENT-005\tScalable role design\tReduces duplication\tApproved\tCould Have\tRBAC-TC-068\tRBAC Product Team\tGIVEN role design, WHEN composite role is created, THEN child permissions are inherited and documented\t1\t2026-03-20\tRBAC-CAP-201\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-208",
    "req": "The system SHALL support periodic role review",
    "type": "Capability",
    "outcome": "Ongoing role hygiene",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-208\tThe system SHALL support periodic role review\tCapability\tRBAC Product\tRBAC-ENT-003\tOngoing role hygiene\tPrevents role drift\tApproved\tCould Have\tRBAC-TC-069\tRBAC Product Team\tGIVEN periodic review cycle, WHEN review is triggered, THEN all roles in scope are reviewed with outcomes recorded\t1\t2026-03-20\tRBAC-CAP-204\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-209",
    "req": "The system SHALL require approval and justification for material role changes",
    "type": "Capability",
    "outcome": "Auditable role changes",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-209\tThe system SHALL require approval and justification for material role changes\tCapability\tRBAC Product\tRBAC-ENT-004\tAuditable role changes\tChange control enforced\tApproved\tMust Have\tRBAC-TC-070\tRBAC Product Team\tGIVEN role change, WHEN material change is requested, THEN approval and justification are required before implementation\t1\t2026-03-20\tRBAC-CAP-204\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-301",
    "req": "The system SHALL enforce role-to-permission mapping",
    "type": "Capability",
    "outcome": "Consistent access model",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-301\tThe system SHALL enforce role-to-permission mapping\tCapability\tRBAC Product\tRBAC-ENT-001\tConsistent access model\tCentralizes authorization\tApproved\tCould Have\tRBAC-TC-019\tRBAC Product Team\tGIVEN role definition, WHEN permissions are mapped, THEN role-to-permission relationships are enforced consistently\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-302",
    "req": "The system SHALL require justification for permissions in roles",
    "type": "Capability",
    "outcome": "Least privilege defensibility",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-302\tThe system SHALL require justification for permissions in roles\tCapability\tRBAC Product\tRBAC-ENT-002\tLeast privilege defensibility\tExplains access scope\tApproved\tCould Have\tRBAC-TC-071\tRBAC Product Team\tGIVEN permission assignment, WHEN permission is added to role, THEN business justification is required\t1\t2026-03-20\tRBAC-CAP-301\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-303",
    "req": "The system SHALL flag privileged entitlements during mapping",
    "type": "Capability",
    "outcome": "Privileged access visibility",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-303\tThe system SHALL flag privileged entitlements during mapping\tCapability\tRBAC Product\tRBAC-ENT-002\tPrivileged access visibility\tDrives stricter controls\tApproved\tMust Have\tRBAC-TC-020\tRBAC Product Team\tGIVEN entitlement mapping, WHEN privileged entitlement is identified, THEN privileged flag is automatically applied\t1\t2026-03-20\tRBAC-CAP-301\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-304",
    "req": "The system SHALL require role owner approval for permission changes",
    "type": "Capability",
    "outcome": "Controlled permission lifecycle",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-304\tThe system SHALL require role owner approval for permission changes\tCapability\tRBAC Product\tRBAC-ENT-003\tControlled permission lifecycle\tPrevents silent expansion\tApproved\tCould Have\tRBAC-TC-072\tRBAC Product Team\tGIVEN permission change, WHEN permissions are modified, THEN role owner approval is required\t1\t2026-03-20\tRBAC-CAP-303\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-305",
    "req": "The system SHALL apply privileged designation using governance criteria",
    "type": "Capability",
    "outcome": "Risk-based governance",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-305\tThe system SHALL apply privileged designation using governance criteria\tCapability\tRBAC Product\tRBAC-ENT-002\tRisk-based governance\tEnables tiered controls\tApproved\tMust Have\tRBAC-TC-073\tRBAC Product Team\tGIVEN privileged designation, WHEN governance criteria are met, THEN privileged flag is applied automatically\t1\t2026-03-20\tRBAC-CAP-301\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-401",
    "req": "The system SHALL support role-based access requests",
    "type": "Capability",
    "outcome": "Consistent request experience",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-401\tThe system SHALL support role-based access requests\tCapability\tRBAC Product\tRBAC-ENT-001\tConsistent request experience\tEliminates entitlement picking\tApproved\tShould Have\tRBAC-TC-074\tRBAC Product Team\tGIVEN access request, WHEN user requests access, THEN role-based selection is presented (not individual entitlements)\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-402",
    "req": "The system SHALL route approvals based on governance rules",
    "type": "Capability",
    "outcome": "Policy-driven approvals",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-402\tThe system SHALL route approvals based on governance rules\tCapability\tRBAC Product\tRBAC-ENT-003\tPolicy-driven approvals\tReduces variance\tApproved\tCould Have\tRBAC-TC-075\tRBAC Product Team\tGIVEN access request, WHEN approval is needed, THEN routing follows governance rules (manager, role owner, etc.)\t1\t2026-03-20\tRBAC-CAP-401\t\tEmployee, Contractor, Vendor, Dealer\tRole Change"
  },
  {
    "id": "RBAC-CAP-403",
    "req": "The system SHALL record approval decisions as evidence",
    "type": "Capability",
    "outcome": "Attributable approval trail",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-403\tThe system SHALL record approval decisions as evidence\tCapability\tRBAC Product\tRBAC-ENT-004\tAttributable approval trail\tAudit defensibility\tApproved\tMust Have\tRBAC-TC-076\tRBAC Product Team\tGIVEN approval decision, WHEN approver acts, THEN decision is recorded with identity, timestamp, and justification\t1\t2026-03-20\tRBAC-CAP-402\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-404",
    "req": "The system SHALL prevent fulfillment without approvals",
    "type": "Capability",
    "outcome": "Enforced authorization",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-404\tThe system SHALL prevent fulfillment without approvals\tCapability\tRBAC Product\tRBAC-ENT-003\tEnforced authorization\tNo bypass paths\tApproved\tMust Have\tRBAC-TC-077\tRBAC Product Team\tGIVEN incomplete approvals, WHEN fulfillment is attempted, THEN system blocks until all approvals complete\t1\t2026-03-20\tRBAC-CAP-402\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-405",
    "req": "The system SHALL support time-bound / JIT role activation",
    "type": "Capability",
    "outcome": "Reduced standing privilege",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-405\tThe system SHALL support time-bound / JIT role activation\tCapability\tRBAC Product\tRBAC-ENT-002\tReduced standing privilege\tRisk-aware access\tApproved\tCould Have\tRBAC-TC-028, RBAC-TC-167, RBAC-TC-174\tRBAC Product Team\tGIVEN JIT request, WHEN approved, THEN access is granted with explicit time boundary\t1\t2026-03-20\tRBAC-CAP-401\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-406",
    "req": "Automatically revoke JIT access",
    "type": "Capability",
    "outcome": "Automatic cleanup",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-406\tAutomatically revoke JIT access\tCapability\tRBAC Product\tRBAC-ENT-003\tAutomatic cleanup\tNo lingering access\tApproved\tMust Have\tRBAC-TC-029\tRBAC Product Team\tGIVEN JIT access, WHEN time boundary expires, THEN access is automatically revoked\t1\t2026-03-20\tRBAC-CAP-405\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-407",
    "req": "The system SHALL record JIT events as audit evidence",
    "type": "Capability",
    "outcome": "Full lifecycle evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-407\tThe system SHALL record JIT events as audit evidence\tCapability\tRBAC Product\tRBAC-ENT-004\tFull lifecycle evidence\tCovers elevated access\tApproved\tMust Have\tRBAC-TC-030\tRBAC Product Team\tGIVEN JIT lifecycle, WHEN audit is requested, THEN full activation/deactivation evidence is available\t1\t2026-03-20\tRBAC-CAP-406\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-501",
    "req": "The system SHALL support periodic access certifications",
    "type": "Capability",
    "outcome": "Ongoing access validation",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-501\tThe system SHALL support periodic access certifications\tCapability\tRBAC Product\tRBAC-ENT-003\tOngoing access validation\tGovernance loop\tApproved\tShould Have\tRBAC-TC-031, RBAC-TC-155, RBAC-TC-159, RBAC-TC-164, RBAC-TC-173\tRBAC Product Team\tGIVEN certification schedule, WHEN campaign launches, THEN all in-scope access is included\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-502",
    "req": "The system SHALL assign certifiers by governance rules",
    "type": "Capability",
    "outcome": "Correct reviewer assignment",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-502\tThe system SHALL assign certifiers by governance rules\tCapability\tRBAC Product\tRBAC-ENT-003\tCorrect reviewer assignment\tPrevents conflicts\tApproved\tCould Have\tRBAC-TC-033\tRBAC Product Team\tGIVEN certification campaign, WHEN certifiers are assigned, THEN assignment follows governance rules with escalation\t1\t2026-03-20\tRBAC-CAP-501\t\tEmployee, Contractor, Vendor, Dealer\tN/A"
  },
  {
    "id": "RBAC-CAP-503",
    "req": "The system SHALL record certification decisions",
    "type": "Capability",
    "outcome": "Attributable review evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-503\tThe system SHALL record certification decisions\tCapability\tRBAC Product\tRBAC-ENT-004\tAttributable review evidence\tAudit ready\tApproved\tShould Have\tRBAC-TC-032, RBAC-TC-160, RBAC-TC-165\tRBAC Product Team\tGIVEN certification review, WHEN certifier decides, THEN decision is recorded with timestamp and identity\t1\t2026-03-20\tRBAC-CAP-502\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-504",
    "req": "The system SHALL trigger actions from certification outcomes",
    "type": "Capability",
    "outcome": "Closed-loop enforcement",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-504\tThe system SHALL trigger actions from certification outcomes\tCapability\tRBAC Product\tRBAC-ENT-003\tClosed-loop enforcement\tReviews drive change\tApproved\tShould Have\tRBAC-TC-027\tRBAC Product Team\tGIVEN certification outcome, WHEN revoke decision is made, THEN access removal is triggered automatically\t1\t2026-03-20\tRBAC-CAP-503\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Expedited Termination"
  },
  {
    "id": "RBAC-CAP-505",
    "req": "The system SHALL set certification cadence by risk tier",
    "type": "Capability",
    "outcome": "Risk-based reviews",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-505\tThe system SHALL set certification cadence by risk tier\tCapability\tRBAC Product\tRBAC-ENT-002\tRisk-based reviews\tFocus on sensitive access\tApproved\tShould Have\tRBAC-TC-078\tRBAC Product Team\tGIVEN risk tier, WHEN certification cadence is configured, THEN frequency matches risk level (higher risk = more frequent)\t1\t2026-03-20\tRBAC-CAP-501\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tN/A"
  },
  {
    "id": "RBAC-CAP-601",
    "req": "The system SHALL support documented access exceptions",
    "type": "Capability",
    "outcome": "Governed deviations",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-601\tThe system SHALL support documented access exceptions\tCapability\tRBAC Product\tRBAC-ENT-003\tGoverned deviations\tNo informal workarounds\tApproved\tCould Have\tRBAC-TC-046, RBAC-TC-162, RBAC-TC-169\tRBAC Product Team\tGIVEN access exception, WHEN exception is requested, THEN justification, approver, and expiration are documented\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-602",
    "req": "The system SHALL enforce expiration or revalidation of exceptions",
    "type": "Capability",
    "outcome": "Time-bound risk",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-002",
    "_raw": "RBAC-CAP-602\tThe system SHALL enforce expiration or revalidation of exceptions\tCapability\tRBAC Product\tRBAC-ENT-002\tTime-bound risk\tLimits standing exceptions\tApproved\tCould Have\tRBAC-TC-047, RBAC-TC-156\tRBAC Product Team\tGIVEN exception expiration, WHEN date is reached, THEN access is revoked OR revalidation workflow triggers\t1\t2026-03-20\tRBAC-CAP-601\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence"
  },
  {
    "id": "RBAC-CAP-603",
    "req": "The system SHALL support emergency (break glass) access with review",
    "type": "Capability",
    "outcome": "Controlled emergency access",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-603\tThe system SHALL support emergency (break glass) access with review\tCapability\tRBAC Product\tRBAC-ENT-003\tControlled emergency access\tAccountability preserved\tApproved\tCould Have\tRBAC-TC-048\tRBAC Product Team\tGIVEN emergency, WHEN break-glass access is invoked, THEN post-access review is automatically scheduled\t1\t2026-03-20\tRBAC-CAP-601\t\tEmployee, Contractor, Vendor, Dealer\tExpedited Termination"
  },
  {
    "id": "RBAC-CAP-604",
    "req": "The system SHALL retain exception and emergency evidence",
    "type": "Capability",
    "outcome": "Defensible non-standard access",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-604\tThe system SHALL retain exception and emergency evidence\tCapability\tRBAC Product\tRBAC-ENT-004\tDefensible non-standard access\tAudit completeness\tApproved\tMust Have\tRBAC-TC-049\tRBAC Product Team\tGIVEN audit request, WHEN exception/emergency evidence is requested, THEN complete trail is retrievable\t1\t2026-03-20\tRBAC-CAP-602\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-605",
    "req": "The system SHALL trigger role review from repeated exceptions",
    "type": "Capability",
    "outcome": "Role model improvement",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-001",
    "_raw": "RBAC-CAP-605\tThe system SHALL trigger role review from repeated exceptions\tCapability\tRBAC Product\tRBAC-ENT-001\tRole model improvement\tExceptions drive design fixes\tApproved\tCould Have\tRBAC-TC-050\tRBAC Product Team\tGIVEN repeated exceptions (3+), WHEN pattern is detected, THEN role review workflow is triggered\t1\t2026-03-20\tRBAC-CAP-601\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-CAP-701",
    "req": "The system SHALL report who has access and why",
    "type": "Capability",
    "outcome": "Transparency",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-701\tThe system SHALL report who has access and why\tCapability\tRBAC Product\tRBAC-ENT-004\tTransparency\tCore audit question\tApproved\tCould Have\tRBAC-TC-051\tRBAC Product Team\tGIVEN access inquiry, WHEN report is generated, THEN user, role, entitlements, and justification are displayed\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-702",
    "req": "The system SHALL retain historical access records",
    "type": "Capability",
    "outcome": "Longitudinal evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-702\tThe system SHALL retain historical access records\tCapability\tRBAC Product\tRBAC-ENT-004\tLongitudinal evidence\tSupports audits\tApproved\tCould Have\tRBAC-TC-052\tRBAC Product Team\tGIVEN historical inquiry, WHEN point-in-time access is requested, THEN snapshot shows access state with effective dates\t1\t2026-03-20\tRBAC-CAP-701\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-703",
    "req": "The system SHALL support on-demand audit evidence",
    "type": "Capability",
    "outcome": "Zero manual reconstruction",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-703\tThe system SHALL support on-demand audit evidence\tCapability\tRBAC Product\tRBAC-ENT-004\tZero manual reconstruction\tAudit efficiency\tApproved\tMust Have\tRBAC-TC-053\tRBAC Product Team\tGIVEN SOX audit, WHEN evidence package is requested, THEN complete package is generated without manual assembly\t1\t2026-03-20\tRBAC-CAP-701\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-704",
    "req": "The system SHALL ensure evidence is complete and attributable",
    "type": "Capability",
    "outcome": "Compliance defensibility",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-704\tThe system SHALL ensure evidence is complete and attributable\tCapability\tRBAC Product\tRBAC-ENT-004\tCompliance defensibility\tSOX-aligned\tApproved\tMust Have\tRBAC-TC-054\tRBAC Product Team\tGIVEN evidence review, WHEN records are examined, THEN timestamp, actor, action, and outcome are present\t1\t2026-03-20\tRBAC-CAP-701\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-801",
    "req": "RBAC depends on IGA for execution",
    "type": "Capability",
    "outcome": "Clear execution boundary",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-006",
    "_raw": "RBAC-CAP-801\tRBAC depends on IGA for execution\tCapability\tRBAC Product\tRBAC-ENT-006\tClear execution boundary\tRBAC governs, IGA executes\tApproved\tCould Have\tRBAC-TC-061\tRBAC Product Team\tGIVEN IGA outage, WHEN IGA is offline, THEN RBAC policy definitions remain accessible\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-802",
    "req": "IGA is system of record for roles and assignments",
    "type": "Capability",
    "outcome": "Authoritative source",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-006",
    "_raw": "RBAC-CAP-802\tIGA is system of record for roles and assignments\tCapability\tRBAC Product\tRBAC-ENT-006\tAuthoritative source\tEliminates ambiguity\tApproved\tShould Have\tRBAC-TC-062\tRBAC Product Team\tGIVEN RBAC policy update, WHEN policy is published, THEN IGA correctly interprets and executes\t1\t2026-03-20\tRBAC-CAP-801\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-803",
    "req": "IGA executes provisioning, certification, JIT",
    "type": "Capability",
    "outcome": "Lifecycle automation",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-003",
    "_raw": "RBAC-CAP-803\tIGA executes provisioning, certification, JIT\tCapability\tRBAC Product\tRBAC-ENT-003\tLifecycle automation\tScalable enforcement\tApproved\tShould Have\tRBAC-TC-063\tRBAC Product Team\tGIVEN IGA execution, WHEN provisioning/certification completes, THEN evidence is returned to RBAC audit trail\t1\t2026-03-20\tRBAC-CAP-801\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-CAP-804",
    "req": "IGA retains audit evidence for all access events",
    "type": "Capability",
    "outcome": "Centralized evidence",
    "owner": "RBAC Product",
    "parent": "RBAC-ENT-004",
    "_raw": "RBAC-CAP-804\tIGA retains audit evidence for all access events\tCapability\tRBAC Product\tRBAC-ENT-004\tCentralized evidence\tAudit-ready by design\tApproved\tMust Have\tRBAC-TC-064\tRBAC Product Team\tGIVEN IGA migration, WHEN platform is replaced, THEN RBAC definitions are portable via export/import\t1\t2026-03-20\tRBAC-CAP-801\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-IGA-001",
    "req": "The system SHALL support hybrid identity environments spanning on-premises and SaaS",
    "type": "IGA Functional",
    "outcome": "RBAC roles executable across all environments",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-001\tThe system SHALL support hybrid identity environments spanning on-premises and SaaS\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tRBAC roles executable across all environments\tRequired for enterprise-wide RBAC execution\tApproved\tShould Have\tRBAC-TC-014, RBAC-TC-091, RBAC-TC-150, RBAC-TC-151\tIGA Platform Team\tGIVEN hybrid environment, WHEN provisioning occurs, THEN both SaaS and on-prem targets receive consistent enforcement\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-002",
    "req": "The system SHALL support coexistence of on-premises and SaaS components with equivalent capability",
    "type": "IGA Functional",
    "outcome": "Phased RBAC adoption without disruption",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-002\tThe system SHALL support coexistence of on-premises and SaaS components with equivalent capability\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tPhased RBAC adoption without disruption\tEnables incremental migration\tApproved\tShould Have\tRBAC-TC-015, RBAC-TC-092\tIGA Platform Team\tGIVEN hybrid deployment, WHEN on-prem and SaaS components operate, THEN no functional gaps exist\t1\t2026-03-20\tRBAC-IGA-001\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-003",
    "req": "The system SHALL support phased migration and parallel operation with legacy IAM systems",
    "type": "IGA Functional",
    "outcome": "RBAC transition without access loss",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-003\tThe system SHALL support phased migration and parallel operation with legacy IAM systems\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tRBAC transition without access loss\tProtects business continuity\tApproved\tShould Have\tRBAC-TC-016, RBAC-TC-093\tIGA Platform Team\tGIVEN parallel operation, WHEN IGA runs alongside legacy IAM, THEN no access loss occurs during transition\t1\t2026-03-20\tRBAC-IGA-001\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-004",
    "req": "The system SHALL support governance of connected and non-connected applications",
    "type": "IGA Functional",
    "outcome": "Complete access governance coverage",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-004\tThe system SHALL support governance of connected and non-connected applications\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tComplete access governance coverage\tPrevents audit blind spots\tApproved\tShould Have\tRBAC-TC-094\tIGA Platform Team\tGIVEN IGA architecture, WHEN scaled, THEN performance SLAs are met without degradation\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-005",
    "req": "The system SHALL include non-connected applications in access reviews and certifications",
    "type": "IGA Functional",
    "outcome": "All access subject to review",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-005\tThe system SHALL include non-connected applications in access reviews and certifications\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tAll access subject to review\tManual access still governed\tApproved\tShould Have\tRBAC-TC-017, RBAC-TC-095\tIGA Platform Team\tGIVEN non-connected app, WHEN ingested, THEN access is included in governance reviews\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-006",
    "req": "The system SHALL support standard enterprise integration patterns (APIs, directories, DBs, files, SCIM)",
    "type": "IGA Functional",
    "outcome": "Standardized provisioning execution",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-006\tThe system SHALL support standard enterprise integration patterns (APIs, directories, DBs, files, SCIM)\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tStandardized provisioning execution\tAvoids bespoke integrations\tApproved\tShould Have\tRBAC-TC-018, RBAC-TC-096\tIGA Platform Team\tGIVEN integration requirement, WHEN API/JDBC connector is used, THEN all accounts are visible\t1\t2026-03-20\tRBAC-IGA-005\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-007",
    "req": "The system SHALL provide prebuilt connectors for common enterprise and SaaS systems",
    "type": "IGA Functional",
    "outcome": "Faster application onboarding",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-007\tThe system SHALL provide prebuilt connectors for common enterprise and SaaS systems\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tFaster application onboarding\tImproves scalability\tApproved\tShould Have\tRBAC-TC-097\tIGA Platform Team\tGIVEN integration pattern, WHEN connector is deployed, THEN standard protocol is followed\t1\t2026-03-20\tRBAC-IGA-006\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-008",
    "req": "The system SHALL provide extensibility mechanisms where direct connectors do not exist",
    "type": "IGA Functional",
    "outcome": "Long-tail application support",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-008\tThe system SHALL provide extensibility mechanisms where direct connectors do not exist\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tLong-tail application support\tEnsures RBAC coverage completeness\tApproved\tShould Have\tRBAC-TC-026, RBAC-TC-098\tIGA Platform Team\tGIVEN orchestration need, WHEN workflow is chained, THEN all steps execute in sequence with logging\t1\t2026-03-20\tRBAC-IGA-007\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-009",
    "req": "The system SHALL provide comprehensive audit logging for identity, access, and governance actions",
    "type": "IGA Functional",
    "outcome": "Foundational audit trail",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-009\tThe system SHALL provide comprehensive audit logging for identity, access, and governance actions\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tFoundational audit trail\tRequired for compliance\tApproved\tMust Have\tRBAC-TC-099\tIGA Platform Team\tGIVEN provisioning request, WHEN target system is reached, THEN access is created per specification\t1\t2026-03-20\tRBAC-IGA-005\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-010",
    "req": "The system SHALL capture approver identity, timestamps, and before/after access state",
    "type": "IGA Functional",
    "outcome": "Full decision traceability",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-010\tThe system SHALL capture approver identity, timestamps, and before/after access state\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tFull decision traceability\tAttribution required for SOX\tApproved\tShould Have\tRBAC-TC-034, RBAC-TC-100, RBAC-TC-175\tIGA Platform Team\tGIVEN approval workflow, WHEN approval is recorded, THEN identity and timestamp are captured\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-011",
    "req": "The system SHALL support configurable audit log retention policies",
    "type": "IGA Functional",
    "outcome": "Evidence retained per policy",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-011\tThe system SHALL support configurable audit log retention policies\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tEvidence retained per policy\tAligns to regulatory requirements\tApproved\tMust Have\tRBAC-TC-101\tIGA Platform Team\tGIVEN certification requirement, WHEN campaign executes, THEN IGA presents access for review\t1\t2026-03-20\tRBAC-IGA-010\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-012",
    "req": "The system SHALL detect and report governed directory and group membership changes",
    "type": "IGA Functional",
    "outcome": "Access drift visibility",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-012\tThe system SHALL detect and report governed directory and group membership changes\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tAccess drift visibility\tSupports least privilege\tApproved\tShould Have\tRBAC-TC-102\tIGA Platform Team\tGIVEN access reconciliation, WHEN scheduled, THEN IGA compares actual vs expected access\t1\t2026-03-20\tRBAC-IGA-010\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-013",
    "req": "The system SHALL detect access granted outside IGA-governed workflows",
    "type": "IGA Functional",
    "outcome": "Exception and violation detection",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-013\tThe system SHALL detect access granted outside IGA-governed workflows\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tException and violation detection\tSurfaces unauthorized access\tApproved\tShould Have\tRBAC-TC-035, RBAC-TC-103, RBAC-TC-166\tIGA Platform Team\tGIVEN out-of-band access, WHEN detected, THEN drift is flagged for remediation\t1\t2026-03-20\tRBAC-IGA-010\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-014",
    "req": "The system SHALL retain reconciliation actions and outcomes as audit evidence",
    "type": "IGA Functional",
    "outcome": "Proof of remediation",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-014\tThe system SHALL retain reconciliation actions and outcomes as audit evidence\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tProof of remediation\tRequired for defensibility\tApproved\tMust Have\tRBAC-TC-036, RBAC-TC-104\tIGA Platform Team\tGIVEN reconciliation history, WHEN audit requested, THEN outcomes are retained and retrievable\t1\t2026-03-20\tRBAC-IGA-013\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-015",
    "req": "The system SHALL support periodic access certifications by role and/or entitlement",
    "type": "IGA Functional",
    "outcome": "Ongoing access validation",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-015\tThe system SHALL support periodic access certifications by role and/or entitlement\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tOngoing access validation\tDrives lifecycle governance\tApproved\tShould Have\tRBAC-TC-105\tIGA Platform Team\tGIVEN reporting need, WHEN report is requested, THEN IGA provides access intelligence\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-016",
    "req": "The system SHALL retain certification decisions with reviewer, outcome, and timestamp",
    "type": "IGA Functional",
    "outcome": "Certification evidence",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-804",
    "_raw": "RBAC-IGA-016\tThe system SHALL retain certification decisions with reviewer, outcome, and timestamp\tIGA Functional\tIGA Platform\tRBAC-CAP-804\tCertification evidence\tEliminates manual reconstruction\tApproved\tShould Have\tRBAC-TC-106\tIGA Platform Team\tGIVEN analytics requirement, WHEN access patterns analyzed, THEN insights are surfaced\t1\t2026-03-20\tRBAC-IGA-015\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-017",
    "req": "The system SHALL support role-level certifications",
    "type": "IGA Functional",
    "outcome": "RBAC-native reviews",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-017\tThe system SHALL support role-level certifications\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tRBAC-native reviews\tAligns reviews to role model\tApproved\tShould Have\tRBAC-TC-107\tIGA Platform Team\tGIVEN audit request, WHEN evidence is needed, THEN IGA provides complete access trail\t1\t2026-03-20\tRBAC-IGA-015\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-018",
    "req": "Automatically revoke access when removal is approved during certification",
    "type": "IGA Functional",
    "outcome": "Closed-loop access removal",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-018\tAutomatically revoke access when removal is approved during certification\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tClosed-loop access removal\tPrevents lingering access\tApproved\tMust Have\tRBAC-TC-108\tIGA Platform Team\tGIVEN compliance requirement, WHEN policy is evaluated, THEN IGA enforces consistently\t1\t2026-03-20\tRBAC-IGA-015\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-019",
    "req": "The system SHALL support certification delegation, escalation, and overdue tracking",
    "type": "IGA Functional",
    "outcome": "Scalable certification operations",
    "owner": "IGA Platform",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-019\tThe system SHALL support certification delegation, escalation, and overdue tracking\tIGA Functional\tIGA Platform\tRBAC-CAP-803\tScalable certification operations\tRequired at enterprise scale\tApproved\tShould Have\tRBAC-TC-109\tIGA Platform Team\tGIVEN risk assessment, WHEN access risk is calculated, THEN score reflects actual risk posture\t1\t2026-03-20\tRBAC-IGA-015\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-020",
    "req": "The system SHALL support hybrid identity environments spanning on-prem and SaaS",
    "type": "IGA Functional",
    "outcome": "Hybrid execution supported",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-020\tThe system SHALL support hybrid identity environments spanning on-prem and SaaS\tIGA Functional\tIGA Vendor\tRBAC-CAP-803\tHybrid execution supported\tFR-1.1\tApproved\tShould Have\tRBAC-TC-120\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-021",
    "req": "The system SHALL support coexistence of on-prem and SaaS components",
    "type": "IGA Functional",
    "outcome": "Parallel execution",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-021\tThe system SHALL support coexistence of on-prem and SaaS components\tIGA Functional\tIGA Vendor\tRBAC-CAP-803\tParallel execution\tFR-1.2\tApproved\tShould Have\tRBAC-TC-121\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-020\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-022",
    "req": "The system SHALL support phased migration with legacy IAM",
    "type": "IGA Functional",
    "outcome": "No access disruption",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-IGA-022\tThe system SHALL support phased migration with legacy IAM\tIGA Functional\tIGA Vendor\tRBAC-CAP-803\tNo access disruption\tFR-1.3\tApproved\tShould Have\tRBAC-TC-122\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-020\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-023",
    "req": "The system SHALL ingest access from connected and non-connected apps",
    "type": "IGA Functional",
    "outcome": "Complete access visibility",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "_raw": "RBAC-IGA-023\tThe system SHALL ingest access from connected and non-connected apps\tIGA Functional\tIGA Vendor\tRBAC-CAP-105\tComplete access visibility\tFR-2.1\tApproved\tShould Have\tRBAC-TC-123\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\t\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-024",
    "req": "The system SHALL support API, directory, JDBC, file ingestion",
    "type": "IGA Functional",
    "outcome": "Standard ingestion",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "_raw": "RBAC-IGA-024\tThe system SHALL support API, directory, JDBC, file ingestion\tIGA Functional\tIGA Vendor\tRBAC-CAP-105\tStandard ingestion\tFR-2.3, FR-2.9\tApproved\tShould Have\tRBAC-TC-124\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-023\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-025",
    "req": "The system SHALL correlate accounts and entitlements to roles",
    "type": "IGA Functional",
    "outcome": "Accurate role mapping",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-201",
    "_raw": "RBAC-IGA-025\tThe system SHALL correlate accounts and entitlements to roles\tIGA Functional\tIGA Vendor\tRBAC-CAP-201\tAccurate role mapping\tFR-2.7\tApproved\tShould Have\tRBAC-TC-125\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-024\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-026",
    "req": "The system SHALL flag privileged access during ingestion",
    "type": "IGA Functional",
    "outcome": "Privileged visibility",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-303",
    "_raw": "RBAC-IGA-026\tThe system SHALL flag privileged access during ingestion\tIGA Functional\tIGA Vendor\tRBAC-CAP-303\tPrivileged visibility\tFR-2.8\tApproved\tMust Have\tRBAC-TC-126\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\t\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-027",
    "req": "The system SHALL enforce RBAC role execution",
    "type": "IGA Functional",
    "outcome": "Deterministic access",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-201",
    "_raw": "RBAC-IGA-027\tThe system SHALL enforce RBAC role execution\tIGA Functional\tIGA Vendor\tRBAC-CAP-201\tDeterministic access\tFR-3.1\tApproved\tShould Have\tRBAC-TC-127\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-026\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-028",
    "req": "The system SHALL support ABAC eligibility enforcement",
    "type": "IGA Functional",
    "outcome": "Policy-based access",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-202",
    "_raw": "RBAC-IGA-028\tThe system SHALL support ABAC eligibility enforcement\tIGA Functional\tIGA Vendor\tRBAC-CAP-202\tPolicy-based access\tFR-3.2\tApproved\tShould Have\tRBAC-TC-128\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-027\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-029",
    "req": "Auto-revoke access on attribute change",
    "type": "IGA Functional",
    "outcome": "Lifecycle enforcement",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-206",
    "_raw": "RBAC-IGA-029\tAuto-revoke access on attribute change\tIGA Functional\tIGA Vendor\tRBAC-CAP-206\tLifecycle enforcement\tFR-3.3, FR-3.7\tApproved\tShould Have\tRBAC-TC-129\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-023\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-030",
    "req": "The system SHALL prevent direct entitlement bypass",
    "type": "IGA Functional",
    "outcome": "No uncontrolled access",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-301",
    "_raw": "RBAC-IGA-030\tThe system SHALL prevent direct entitlement bypass\tIGA Functional\tIGA Vendor\tRBAC-CAP-301\tNo uncontrolled access\tFR-3.6\tApproved\tShould Have\tRBAC-TC-130\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-028\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-031",
    "req": "The system SHALL execute provisioning independent of intake UI",
    "type": "IGA Functional",
    "outcome": "Reliable fulfillment",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-IGA-031\tThe system SHALL execute provisioning independent of intake UI\tIGA Functional\tIGA Vendor\tRBAC-CAP-404\tReliable fulfillment\tFR-6.3\tApproved\tShould Have\tRBAC-TC-131\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\t\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-032",
    "req": "The system SHALL support cross-system orchestration",
    "type": "IGA Functional",
    "outcome": "End-to-end provisioning",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-IGA-032\tThe system SHALL support cross-system orchestration\tIGA Functional\tIGA Vendor\tRBAC-CAP-404\tEnd-to-end provisioning\tFR-6.4, FR-6.5\tApproved\tShould Have\tRBAC-TC-132\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-033",
    "req": "Auto-revoke access from certifications",
    "type": "IGA Functional",
    "outcome": "Closed-loop governance",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-504",
    "_raw": "RBAC-IGA-033\tAuto-revoke access from certifications\tIGA Functional\tIGA Vendor\tRBAC-CAP-504\tClosed-loop governance\tFR-7.10\tApproved\tShould Have\tRBAC-TC-133\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-034",
    "req": "The system SHALL support just-in-time privileged access",
    "type": "IGA Functional",
    "outcome": "Reduced standing privilege",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-405",
    "_raw": "RBAC-IGA-034\tThe system SHALL support just-in-time privileged access\tIGA Functional\tIGA Vendor\tRBAC-CAP-405\tReduced standing privilege\tFR-5.1\tApproved\tMust Have\tRBAC-TC-134\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-035",
    "req": "Automatically expire JIT access",
    "type": "IGA Functional",
    "outcome": "Time-bound enforcement",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-406",
    "_raw": "RBAC-IGA-035\tAutomatically expire JIT access\tIGA Functional\tIGA Vendor\tRBAC-CAP-406\tTime-bound enforcement\tFR-5.2\tApproved\tShould Have\tRBAC-TC-135\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-036",
    "req": "The system SHALL retain JIT approval and expiration evidence",
    "type": "IGA Functional",
    "outcome": "Auditable JIT",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-407",
    "_raw": "RBAC-IGA-036\tThe system SHALL retain JIT approval and expiration evidence\tIGA Functional\tIGA Vendor\tRBAC-CAP-407\tAuditable JIT\tFR-5.4\tApproved\tMust Have\tRBAC-TC-136\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-033\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-037",
    "req": "The system SHALL support role and entitlement certifications",
    "type": "IGA Functional",
    "outcome": "Ongoing validation",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "_raw": "RBAC-IGA-037\tThe system SHALL support role and entitlement certifications\tIGA Functional\tIGA Vendor\tRBAC-CAP-501\tOngoing validation\tFR-7.7\tApproved\tShould Have\tRBAC-TC-137\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-038",
    "req": "The system SHALL support role-level certifications",
    "type": "IGA Functional",
    "outcome": "RBAC-native reviews",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "_raw": "RBAC-IGA-038\tThe system SHALL support role-level certifications\tIGA Functional\tIGA Vendor\tRBAC-CAP-501\tRBAC-native reviews\tFR-7.9\tApproved\tShould Have\tRBAC-TC-138\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-037\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-039",
    "req": "The system SHALL support escalation and overdue tracking",
    "type": "IGA Functional",
    "outcome": "Scalable certifications",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "_raw": "RBAC-IGA-039\tThe system SHALL support escalation and overdue tracking\tIGA Functional\tIGA Vendor\tRBAC-CAP-501\tScalable certifications\tFR-7.11\tApproved\tShould Have\tRBAC-TC-139\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-037\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-040",
    "req": "The system SHALL capture attributable audit logs",
    "type": "IGA Functional",
    "outcome": "Audit defensibility",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "_raw": "RBAC-IGA-040\tThe system SHALL capture attributable audit logs\tIGA Functional\tIGA Vendor\tRBAC-CAP-704\tAudit defensibility\tFR-7.1, FR-7.2\tApproved\tMust Have\tRBAC-TC-140\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\t\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-041",
    "req": "The system SHALL detect out-of-band access",
    "type": "IGA Functional",
    "outcome": "Drift detection",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-701",
    "_raw": "RBAC-IGA-041\tThe system SHALL detect out-of-band access\tIGA Functional\tIGA Vendor\tRBAC-CAP-701\tDrift detection\tFR-7.5\tApproved\tShould Have\tRBAC-TC-141\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-040\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-IGA-042",
    "req": "The system SHALL retain reconciliation history",
    "type": "IGA Functional",
    "outcome": "Historical evidence",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-702",
    "_raw": "RBAC-IGA-042\tThe system SHALL retain reconciliation history\tIGA Functional\tIGA Vendor\tRBAC-CAP-702\tHistorical evidence\tFR-7.6\tApproved\tShould Have\tRBAC-TC-142\tIGA Vendor\tGIVEN IGA platform capability, WHEN function is invoked, THEN execution completes with audit evidence\t1\t2026-03-20\tRBAC-IGA-041\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-001",
    "req": "The system SHALL consume joiner/mover/leaver lifecycle events from Workday HR",
    "type": "Interface",
    "outcome": "Authoritative lifecycle",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-105",
    "_raw": "RBAC-INT-001\tThe system SHALL consume joiner/mover/leaver lifecycle events from Workday HR\tInterface\tWorkday → IGA Integration\tRBAC-CAP-105\tAuthoritative lifecycle\tIR-WD-1\tApproved\tShould Have\tRBAC-TC-037, RBAC-TC-115, RBAC-TC-154, RBAC-TC-170, RBAC-TC-171\tIAM Team\tGIVEN Workday hire event, WHEN JML event fires, THEN IGA receives and processes within 15 minutes\t1\t2026-03-20\tRBAC-IGA-023\tIGA ↔ Workday\tEmployee, Contractor\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-002",
    "req": "The system SHALL ingest identity attributes from Workday to drive role eligibility",
    "type": "Interface",
    "outcome": "Deterministic eligibility",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-206",
    "_raw": "RBAC-INT-002\tThe system SHALL ingest identity attributes from Workday to drive role eligibility\tInterface\tWorkday → IGA Integration\tRBAC-CAP-206\tDeterministic eligibility\tIR-WD-2\tApproved\tShould Have\tRBAC-TC-113\tIAM Team\tGIVEN Workday identity attributes, WHEN attributes change, THEN IGA ingests for role eligibility evaluation\t1\t2026-03-20\tRBAC-IGA-029\tIGA ↔ Workday\tEmployee, Contractor\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-003",
    "req": "The system SHALL refresh Workday attributes to support timely access changes",
    "type": "Interface",
    "outcome": "Near real-time enforcement",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-206",
    "_raw": "RBAC-INT-003\tThe system SHALL refresh Workday attributes to support timely access changes\tInterface\tWorkday → IGA Integration\tRBAC-CAP-206\tNear real-time enforcement\tIR-WD-3\tApproved\tShould Have\tRBAC-TC-114\tIAM Team\tGIVEN Workday termination, WHEN leaver event fires, THEN IGA initiates deprovisioning within SLA\t1\t2026-03-20\tRBAC-IGA-029\tIGA ↔ Workday\tEmployee, Contractor\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-004",
    "req": "The system SHALL retain audit evidence of Workday attribute changes affecting access",
    "type": "Interface",
    "outcome": "Audit defensibility",
    "owner": "Workday → IGA Integration",
    "parent": "RBAC-CAP-704",
    "_raw": "RBAC-INT-004\tThe system SHALL retain audit evidence of Workday attribute changes affecting access\tInterface\tWorkday → IGA Integration\tRBAC-CAP-704\tAudit defensibility\tIR-WD-4\tApproved\tMust Have\tRBAC-TC-038\tIAM Team\tGIVEN Workday mover event, WHEN attributes change, THEN IGA evaluates and adjusts access per policy\t1\t2026-03-20\tRBAC-IGA-040\tIGA ↔ Workday\tEmployee, Contractor\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-005",
    "req": "The system SHALL ingest directory accounts and groups",
    "type": "Interface",
    "outcome": "Directory visibility",
    "owner": "IAM",
    "parent": "RBAC-CAP-105",
    "_raw": "RBAC-INT-005\tThe system SHALL ingest directory accounts and groups\tInterface\tIAM\tRBAC-CAP-105\tDirectory visibility\tDIR-1.1\tApproved\tShould Have\tRBAC-TC-055\tIAM Team\tGIVEN AD provisioning, WHEN account is created, THEN attributes and groups are set correctly\t1\t2026-03-20\tRBAC-IGA-024\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-006",
    "req": "The system SHALL map directory groups to roles",
    "type": "Interface",
    "outcome": "RBAC enforcement",
    "owner": "IAM",
    "parent": "RBAC-CAP-201",
    "_raw": "RBAC-INT-006\tThe system SHALL map directory groups to roles\tInterface\tIAM\tRBAC-CAP-201\tRBAC enforcement\tDIR-1.2\tApproved\tShould Have\tRBAC-TC-056\tIAM Team\tGIVEN Entra ID provisioning, WHEN account is created, THEN attributes and licenses are assigned\t1\t2026-03-20\tRBAC-IGA-027\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-INT-007",
    "req": "The system SHALL flag privileged directory groups",
    "type": "Interface",
    "outcome": "Privileged visibility",
    "owner": "IAM",
    "parent": "RBAC-CAP-303",
    "_raw": "RBAC-INT-007\tThe system SHALL flag privileged directory groups\tInterface\tIAM\tRBAC-CAP-303\tPrivileged visibility\tDIR-1.3\tApproved\tMust Have\tRBAC-TC-057\tIAM Team\tGIVEN attribute sync, WHEN IGA updates attribute, THEN change propagates to directory within SLA\t1\t2026-03-20\tRBAC-IGA-026\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-008",
    "req": "Provision directory memberships",
    "type": "Interface",
    "outcome": "Automated enforcement",
    "owner": "IAM",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-INT-008\tProvision directory memberships\tInterface\tIAM\tRBAC-CAP-404\tAutomated enforcement\tDIR-2.1\tApproved\tShould Have\tRBAC-TC-039, RBAC-TC-168\tIAM Team\tGIVEN role assignment, WHEN role is granted, THEN AD/Entra group membership is updated\t1\t2026-03-20\tRBAC-IGA-031\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-INT-009",
    "req": "Revoke directory access on role removal",
    "type": "Interface",
    "outcome": "Deterministic revocation",
    "owner": "IAM",
    "parent": "RBAC-CAP-504",
    "_raw": "RBAC-INT-009\tRevoke directory access on role removal\tInterface\tIAM\tRBAC-CAP-504\tDeterministic revocation\tDIR-2.2\tApproved\tShould Have\tRBAC-TC-058\tIAM Team\tGIVEN role removal, WHEN role is revoked, THEN AD/Entra group membership is removed\t1\t2026-03-20\tRBAC-IGA-033\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-010",
    "req": "The system SHALL detect out-of-band directory changes",
    "type": "Interface",
    "outcome": "Drift detection",
    "owner": "IAM",
    "parent": "RBAC-CAP-701",
    "_raw": "RBAC-INT-010\tThe system SHALL detect out-of-band directory changes\tInterface\tIAM\tRBAC-CAP-701\tDrift detection\tDIR-3.1\tApproved\tShould Have\tRBAC-TC-059\tIAM Team\tGIVEN reconciliation, WHEN IGA compares to directory, THEN orphans and unauthorized access are detected\t1\t2026-03-20\tRBAC-IGA-041\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-INT-011",
    "req": "The system SHALL retain directory reconciliation evidence",
    "type": "Interface",
    "outcome": "Audit history",
    "owner": "IAM",
    "parent": "RBAC-CAP-702",
    "_raw": "RBAC-INT-011\tThe system SHALL retain directory reconciliation evidence\tInterface\tIAM\tRBAC-CAP-702\tAudit history\tDIR-3.2\tApproved\tMust Have\tRBAC-TC-060\tIAM Team\tGIVEN provisioning failure, WHEN error occurs, THEN retry per policy and alert on persistent failure\t1\t2026-03-20\tRBAC-IGA-042\tIGA ↔ Directory (AD/Entra)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-INT-012",
    "req": "The system SHALL receive access request intake from ServiceNow ITSM",
    "type": "Interface",
    "outcome": "Standardized requests",
    "owner": "ServiceNow ↔ IGA Integration",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-INT-012\tThe system SHALL receive access request intake from ServiceNow ITSM\tInterface\tServiceNow ↔ IGA Integration\tRBAC-CAP-404\tStandardized requests\tFR-4.1\tApproved\tShould Have\tRBAC-TC-110, RBAC-TC-111\tIAM Team\tGIVEN ServiceNow request, WHEN access request is submitted, THEN IGA receives for processing\t1\t2026-03-20\tRBAC-IGA-031\tIGA ↔ ServiceNow\tEmployee, Contractor, Vendor, Dealer\tRole Change"
  },
  {
    "id": "RBAC-INT-013",
    "req": "The system SHALL execute fulfillment for ServiceNow-approved access requests",
    "type": "Interface",
    "outcome": "End-to-end traceability",
    "owner": "ServiceNow ↔ IGA Integration",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-INT-013\tThe system SHALL execute fulfillment for ServiceNow-approved access requests\tInterface\tServiceNow ↔ IGA Integration\tRBAC-CAP-404\tEnd-to-end traceability\tFR-4.2\tApproved\tShould Have\tRBAC-TC-025, RBAC-TC-112, RBAC-TC-161\tIAM Team\tGIVEN ServiceNow approval, WHEN approval is recorded, THEN IGA executes fulfillment\t1\t2026-03-20\tRBAC-IGA-031\tIGA ↔ ServiceNow\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-INT-014",
    "req": "The system SHALL block fulfillment of ServiceNow requests until approval is recorded",
    "type": "Interface",
    "outcome": "No bypass paths",
    "owner": "ServiceNow ↔ IGA Integration",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-INT-014\tThe system SHALL block fulfillment of ServiceNow requests until approval is recorded\tInterface\tServiceNow ↔ IGA Integration\tRBAC-CAP-404\tNo bypass paths\tRBAC-REQ-4.4\tApproved\tMust Have\tRBAC-TC-040\tIAM Team\tGIVEN ServiceNow request, WHEN approval is missing, THEN IGA blocks fulfillment\t1\t2026-03-20\tRBAC-IGA-031\tIGA ↔ ServiceNow\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-INT-015",
    "req": "The system SHALL provide standard connectors",
    "type": "Interface",
    "outcome": "Fast onboarding",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "_raw": "RBAC-INT-015\tThe system SHALL provide standard connectors\tInterface\tIGA Vendor\tRBAC-CAP-105\tFast onboarding\tFR-2.4\tApproved\tShould Have\tRBAC-TC-116\tIGA Vendor\tGIVEN API target, WHEN provisioning is requested, THEN API call succeeds with logging\t1\t2026-03-20\tRBAC-IGA-024\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-016",
    "req": "The system SHALL support extensibility where connectors unavailable",
    "type": "Interface",
    "outcome": "Long-tail coverage",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "_raw": "RBAC-INT-016\tThe system SHALL support extensibility where connectors unavailable\tInterface\tIGA Vendor\tRBAC-CAP-105\tLong-tail coverage\tFR-2.5\tApproved\tShould Have\tRBAC-TC-117\tIGA Vendor\tGIVEN REST endpoint, WHEN access change is needed, THEN REST call executes correctly\t1\t2026-03-20\tRBAC-IGA-024\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-INT-017",
    "req": "Provision via API/JDBC/REST",
    "type": "Interface",
    "outcome": "Target execution",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-INT-017\tProvision via API/JDBC/REST\tInterface\tIGA Vendor\tRBAC-CAP-404\tTarget execution\tFR-3.6\tApproved\tShould Have\tRBAC-TC-118\tIGA Vendor\tGIVEN JDBC target, WHEN database access is provisioned, THEN connection and update succeed\t1\t2026-03-20\tRBAC-IGA-031\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change, Leave of Absence, Expedited Termination"
  },
  {
    "id": "RBAC-INT-018",
    "req": "The system SHALL support governed scripting",
    "type": "Interface",
    "outcome": "Scripted coverage",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-INT-018\tThe system SHALL support governed scripting\tInterface\tIGA Vendor\tRBAC-CAP-404\tScripted coverage\tFR-4.3\tApproved\tShould Have\tRBAC-TC-119\tIGA Vendor\tGIVEN script-based target, WHEN provisioning script runs, THEN execution is logged and auditable\t1\t2026-03-20\tRBAC-IGA-032\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tRole Change"
  },
  {
    "id": "RBAC-INT-019",
    "req": "Script execution is auditable",
    "type": "Interface",
    "outcome": "Auditable automation",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "_raw": "RBAC-INT-019\tScript execution is auditable\tInterface\tIGA Vendor\tRBAC-CAP-704\tAuditable automation\tFR-4.4\tApproved\tMust Have\tRBAC-TC-041\tIGA Vendor\tGIVEN custom connector, WHEN deployed, THEN standard integration patterns are followed\t\t\tRBAC-IGA-040\tIGA ↔ Target Systems (API)\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-001",
    "req": "The system SHALL provide 24x7 support for critical failures",
    "type": "NFR",
    "outcome": "Operational continuity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-NFR-001\tThe system SHALL provide 24x7 support for critical failures\tNFR\tIGA Vendor\tRBAC-CAP-404\tOperational continuity\tSupport model\tApproved\tCould Have\tRBAC-TC-079\tIGA Vendor\tGIVEN availability requirement, WHEN system is measured, THEN uptime meets 99.9% SLA\t\t\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-002",
    "req": "Define SLA response times for failures",
    "type": "NFR",
    "outcome": "Predictable response",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-NFR-002\tDefine SLA response times for failures\tNFR\tIGA Vendor\tRBAC-CAP-404\tPredictable response\tSLA matrix\tApproved\tCould Have\tRBAC-TC-042\tIGA Vendor\tGIVEN provisioning failure, WHEN incident occurs, THEN resolution is within defined SLA\t\t\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-003",
    "req": "Prioritize incidents impacting audit evidence",
    "type": "NFR",
    "outcome": "Audit protection",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "_raw": "RBAC-NFR-003\tPrioritize incidents impacting audit evidence\tNFR\tIGA Vendor\tRBAC-CAP-704\tAudit protection\tRunbook\tApproved\tMust Have\tRBAC-TC-080\tIGA Vendor\tGIVEN performance requirement, WHEN load is applied, THEN response times meet SLA\t\t\tRBAC-IGA-040\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-004",
    "req": "Scale ingestion to enterprise volumes",
    "type": "NFR",
    "outcome": "Enterprise scale",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-105",
    "_raw": "RBAC-NFR-004\tScale ingestion to enterprise volumes\tNFR\tIGA Vendor\tRBAC-CAP-105\tEnterprise scale\tReference architecture\tApproved\tCould Have\tRBAC-TC-081\tIGA Vendor\tGIVEN scalability requirement, WHEN user/app volume increases, THEN performance is maintained\t\t\tRBAC-IGA-023\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-005",
    "req": "The system SHALL support peak provisioning loads",
    "type": "NFR",
    "outcome": "Performance stability",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-NFR-005\tThe system SHALL support peak provisioning loads\tNFR\tIGA Vendor\tRBAC-CAP-404\tPerformance stability\tBenchmarks\tApproved\tCould Have\tRBAC-TC-043\tIGA Vendor\tGIVEN bulk operation, WHEN mass provisioning occurs, THEN no degradation is observed\t\t\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-006",
    "req": "The system SHALL support large certification campaigns",
    "type": "NFR",
    "outcome": "Scalable reviews",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-501",
    "_raw": "RBAC-NFR-006\tThe system SHALL support large certification campaigns\tNFR\tIGA Vendor\tRBAC-CAP-501\tScalable reviews\tLoad tests\tApproved\tShould Have\tRBAC-TC-082\tIGA Vendor\tGIVEN security requirement, WHEN access is attempted, THEN authentication/authorization enforced\t\t\tRBAC-IGA-037\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-007",
    "req": "The system SHALL prevent unauthorized provisioning",
    "type": "NFR",
    "outcome": "Control integrity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-201",
    "_raw": "RBAC-NFR-007\tThe system SHALL prevent unauthorized provisioning\tNFR\tIGA Vendor\tRBAC-CAP-201\tControl integrity\tDesign docs\tApproved\tCould Have\tRBAC-TC-083\tIGA Vendor\tGIVEN data protection, WHEN sensitive data is handled, THEN encryption is applied\t\t\tRBAC-IGA-027\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-008",
    "req": "Protect audit logs from tampering",
    "type": "NFR",
    "outcome": "Evidence integrity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "_raw": "RBAC-NFR-008\tProtect audit logs from tampering\tNFR\tIGA Vendor\tRBAC-CAP-704\tEvidence integrity\tSecurity architecture\tApproved\tMust Have\tRBAC-TC-044\tIGA Vendor\tGIVEN audit integrity, WHEN log tampering is attempted, THEN it is blocked or detected\t\t\tRBAC-IGA-040\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-009",
    "req": "Govern IGA admin access",
    "type": "NFR",
    "outcome": "Admin accountability",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "_raw": "RBAC-NFR-009\tGovern IGA admin access\tNFR\tIGA Vendor\tRBAC-CAP-704\tAdmin accountability\tAdmin model\tApproved\tCould Have\tRBAC-TC-084\tIGA Vendor\tGIVEN compliance requirement, WHEN audit is conducted, THEN all evidence is available\t\t\tRBAC-IGA-040\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-010",
    "req": "Publish release cadence",
    "type": "NFR",
    "outcome": "Predictable change",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-803",
    "_raw": "RBAC-NFR-010\tPublish release cadence\tNFR\tIGA Vendor\tRBAC-CAP-803\tPredictable change\tRelease calendar\tApproved\tCould Have\tRBAC-TC-085\tIGA Vendor\tGIVEN recoverability requirement, WHEN disaster occurs, THEN recovery meets RTO/RPO\t\t\tRBAC-IGA-020\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-011",
    "req": "The system SHALL support phased rollouts",
    "type": "NFR",
    "outcome": "Low-risk upgrades",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-404",
    "_raw": "RBAC-NFR-011\tThe system SHALL support phased rollouts\tNFR\tIGA Vendor\tRBAC-CAP-404\tLow-risk upgrades\tDeployment plan\tApproved\tCould Have\tRBAC-TC-086\tIGA Vendor\tGIVEN maintainability, WHEN updates are needed, THEN changes are deployable with minimal downtime\t\t\tRBAC-IGA-031\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  },
  {
    "id": "RBAC-NFR-012",
    "req": "Preserve audit evidence across upgrades",
    "type": "NFR",
    "outcome": "Audit continuity",
    "owner": "IGA Vendor",
    "parent": "RBAC-CAP-704",
    "_raw": "RBAC-NFR-012\tPreserve audit evidence across upgrades\tNFR\tIGA Vendor\tRBAC-CAP-704\tAudit continuity\tUpgrade policy\tApproved\tMust Have\tRBAC-TC-045\tIGA Vendor\tGIVEN platform upgrade, WHEN upgrade completes, THEN all evidence and data are retained\t\t\tRBAC-IGA-040\t\tEmployee, Contractor, Vendor, Dealer, Non-Human\tAll"
  }
];
