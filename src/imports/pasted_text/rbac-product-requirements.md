Product Requirements Document - Role Based Access Control (RBAC) - DRAFT



By Jordan Eisenback

15 min

2

Add a reaction
Vision
Establish RBAC as the enterprise standard for governing access to applications and solutions, enabling least privilege access, scalable identity automation, and audit ready access governance. RBAC will serve as a foundational capability for Zero Trust architecture, reducing security risk while improving operational efficiency and compliance outcomes. The product enables consistent, role based access decisions across the enterprise without relying on manual or ad hoc permission management.

Problem Definition
Problem Statement
Pilot’s current access management approach relies heavily on manual, application‑specific permission assignments rather than standardized roles. This results in over‑privileged users, inconsistent access policies, and operational inefficiencies across teams and systems.

As the organization scales, manual provisioning and deprovisioning do not scale with it. Access changes are error‑prone, slow to execute, and difficult to track consistently, increasing security and compliance risk during onboarding, role changes, and offboarding.

From a governance perspective, the current model makes it difficult to consistently answer who has access, why access was granted, who approved it, and when it was last reviewed. As a result, audit and compliance activities require significant manual effort, and access risk is managed reactively rather than through a repeatable control model.

High Level Approach
Pilot will establish a standardized enterprise Role‑Based Access Control (RBAC) model that defines business roles, maps roles to approved access entitlements, and governs how access is requested, approved, reviewed, and audited across enterprise applications.

The RBAC model supports:

Role definition and lifecycle management

Access requests and approvals

Periodic access certifications (attestation)

Governed exception handling

Auditability and traceability of access decisions

RBAC will be delivered through a phased onboarding approach, using standardized application discovery inputs and consistent documentation of access decisions, risks, and dependencies to ensure scalable and repeatable adoption.

This product implements RBAC consistent with NIST guidance:

Roles represent job functions

Permissions are assigned to roles

Users gain access only through role assignment

Access decisions are enforced by consuming solutions

Constraints ensure least privilege and separation of duties

Scope
This product governs logical access to enterprise applications, platforms, and solutions through a standardized RBAC model. RBAC defines who may access solutions and perform actions by assigning users (human and non-human) to business roles with approved entitlements.

In Scope
Identity Types
This product governs access for multiple identity categories, each subject to RBAC and IGA governance controls. Identity categories include, but are not limited to:

Employees

Retail Operations

Transportation

Corporate

Contractors / temporary workers

Vendors and third‑party users

Non‑human identities (e.g., service accounts, application identities)

Identity category influences eligibility, approval requirements, certification cadence, and access duration, but does not change the fundamental RBAC model

The RBAC and IGA model applies consistently across identity categories; however, governance controls (e.g., eligibility rules, approval routing, certification frequency, and JIT requirements) may vary based on identity category and risk.

Governance and Execution
This product includes the following RBAC governance and execution capabilities:

Logical access to enterprise applications and platforms

Role definition, eligibility, assignment, and lifecycle management

Access requests, approvals, certifications, exceptions, and audit evidence

Governance of access to licensed software through role assignment

Administrative access to solutions that manage infrastructure or hardware (e.g., device management or network management platforms)

Just-in-time (JIT) role activation and time-bound access, where supported by the IGA platform, including approval, activation, expiration, and audit evidence

Configuration of the enterprise IGA platform required to implement RBAC governance, provisioning, certification, and just-in-time access patterns

Operating Model and Control Planes
The IGA platform is the system of record for role-based provisioning, deprovisioning, access reviews, and just-in-time (JIT) access enablement where applicable.

Privileged Access Management (PAM) capabilities (e.g., session isolation, credential vaulting, privileged session monitoring) remain managed by CyberArk and are out of scope for RBAC implementation, except for governance integration and role eligibility alignment.

RBAC provides the authorization and governance layer within the Zero Trust model, while authentication, risk evaluation, and runtime enforcement are handled by adjacent identity, security, and infrastructure platforms.

Conditionally In Scope
Access to data repositories where access is controlled through roles (e.g., database roles, schema access, data platform permissions)

Access to hardware or network resources where access is role‑based and governed through standard identity integrations

Local or host‑scoped service accounts, where access can be discovered, documented, or reviewed through existing tools or integrations. These accounts are treated as non‑human identities for governance visibility and risk awareness but may not support full RBAC lifecycle management or automated enforcement.

Out of Scope
Physical access controls and hardware security mechanisms

Data classification, retention, encryption, masking, or data governance policies

Asset inventory and lifecycle management beyond access governance

PAM platform configuration and session-level privileged controls (managed through CyberArk)

Infrastructure-level authorization enforcement outside of IGA and consuming applications

RBAC integrates with authoritative solutions (e.g., identity platforms, CMDB, data platforms) where required for access governance but does not replace those solutions as sources of record.

Goals & Success
Objectives
Enforce least privilege access across enterprise solutions

Reduce over privileged access and exception sprawl

Enable scalable, automated access provisioning

Improve audit and compliance defensibility

Key Results (Outcomes)
As an enterprise customer of the RBAC product, I want access decisions to be consistent across applications so the product delivers predictable, repeatable outcomes at scale.

As a business consumer of the RBAC product, I want roles that reflect real job responsibilities so access is easy to request, easy to approve, and correct by default.

As the RBAC Product Owner, I want a standardized onboarding and governance model so new applications can be added without redesigning the product or increasing operational complexity.

As an application owner consuming the RBAC product, I want a clear and supported role model so access for my application is easier to manage, support, and audit over time.

As a platform owner integrating with the RBAC product, I want standard integration and enforcement patterns so RBAC adoption does not introduce bespoke logic or operational risk.

As an identity data owner supporting the RBAC product, I want access decisions to rely on authoritative attributes so the product behaves deterministically and avoids manual overrides.

As a security stakeholder consuming RBAC outcomes, I want the product to clearly distinguish standard, privileged, and sensitive access so elevated risk is intentional and visible.

As an audit and compliance consumer, I want the RBAC product to produce complete, self‑contained access evidence so audits do not require manual reconstruction or tribal knowledge.

As an incident responder using the RBAC product, I want emergency access capabilities that prioritize speed while preserving accountability and automatic cleanup.

As a third‑party access sponsor, I want external users governed through the same RBAC product model so the product provides a single, enterprise view of access risk.

Functional Requirements
Below are the core RBAC capabilities to be delivered.

Capability 1 — Application Discovery & Onboarding Standardization
The solution shall:

Provide a standardized discovery model to capture application RBAC readiness inputs, including ownership, user populations, role constructs, entitlements, approval model, certification expectations, and privileged access considerations

Require completion of defined minimum criteria before an application can proceed to entitlement mapping

Minimum discovery criteria includes: 

Identified business and technical owners

Documented role constructs (or confirmation none exist)

Current permission inventory or equivalent export

Identification of privileged access paths

SoD considerations.

Track discovery status using a defined lifecycle (e.g., Not Started, In Progress, Blocked, Complete)

Retain discovery artifacts and decisions as governance evidence

The RBAC model shall explicitly address non human identities (e.g., service accounts, application identities), including role definition, approval, review, and evidence requirements where applicable

User Stories
As an application owner, I want a clear and consistent discovery intake so my application can be onboarded without rework or ambiguity.

As IAM governance, I want standardized discovery inputs so onboarding readiness and risk can be assessed consistently.

As security, I want privileged access paths identified during discovery so elevated risk is acknowledged before access is granted.

As audit and compliance, I want discovery decisions retained so onboarding governance can be validated later.

SOX Alignment:
This capability supports SOX scoping by identifying applications, roles, and access paths that impact financial reporting, including privileged access and segregation‑of‑duties considerations.

Capability 2 — Role Definition & Lifecycle Management
The solution shall:

Support explicit definition of business roles that are based on job functions or responsibilities

Support role eligibility criteria (e.g., job family, department, employment type) that restrict which users may request or be assigned a role

Require each role to have a documented business purpose, intended user population, and accountable owner

Support role lifecycle states (e.g., Draft, Active, Deprecated, Retired)

Ensure users inherit permissions only through role assignment

Automatically revoke inherited permissions when a role assignment is removed

Support role composition (e.g., composite roles or role hierarchies) where appropriate to reduce duplication and support scalable onboarding patterns

Support periodic review of role definitions and entitlement mappings based on certification outcomes, exception trends, and access usage insights

Role changes that materially alter access scope require documented justification and owner approval, and must be visible for audit review.

SOX Alignment:
This capability supports SOX Section 404 access controls by enforcing role‑based access aligned to job responsibilities and maintaining controlled role lifecycle states.

User Stories
As a role owner, I want to define and maintain roles with clear purpose so that access remains aligned to business need

As IAM governance, I want controlled role lifecycle changes so that roles do not drift or proliferate unchecked

As audit and compliance, I want clear ownership and justification for each role so access can be defended.

As a requestor, I want to see only roles I am eligible for so I do not submit inappropriate access requests

As a role owner, I want to understand how many users and applications are impacted before I change or retire a role so I can assess risk and disruption

Capability 3 — Entitlement Mapping
The solution shall:

Enforce a role to permission model where permissions are assigned only to roles

Require documented justification for permissions mapped to a role, including access level (e.g., read/write/admin)

Identify and flag elevated or privileged entitlements during mapping

Require role owner approval for permission changes

Privileged designation is applied based on governance‑defined criteria, and drives stricter approval and certification requirements

SOX Alignment:
This capability supports SOX by ensuring permissions impacting financial reporting are assigned only through approved roles with documented business justification.

User Stories
As an Application Owner, I want to map roles to permissions once so access is consistent and repeatable

As IT Cybersecurity, I want visibility into elevated permissions so risk is explicitly acknowledged and governed

As IAM Operations, I want entitlement mappings to be clear so provisioning errors are minimized

As IT Cybersecurity, I want to identify entitlements assigned outside of defined roles so access drift can be remediated

As audit and compliance, I want visibility into why permissions are included in a role so access scope is explainable.

Capability 4 — Access Request & Approval Governance
The solution shall:

Support access requests based on role assignment rather than direct entitlement selection

Route approvals based on defined governance rules (e.g., standard vs privileged roles)

Record approval decisions, approvers, and timestamps as evidence

Prevent fulfillment of access without required approvals

Support time-bound role activation (JIT) requests for roles designated as eligible for JIT

Enforce approval requirements prior to JIT activation based on role risk

Automatically revoke JIT access at expiration without manual intervention

Record JIT activation and expiration as access events for audit purposes

SOX Alignment:
This capability supports SOX IT General Controls by enforcing approval‑based access provisioning and retaining authorization evidence for all access affecting financial systems.

User Stories
As a Requestor, I want to request access using clear role descriptions so I select the right access

As an Approver, I want to understand the role’s purpose and risk so I can make informed decisions

As Compliance, I want approval evidence retained automatically

As a Requestor, I want to understand why my access request was denied or blocked so I know what action to take next

As an Approver, I want to see whether a request violates role eligibility or segregation of duties rules so I can make informed decisions

As audit and compliance, I want approval decisions recorded automatically as evidence

Capability 5 — Access Certification (Review & Attestation)
The solution shall:

Support periodic access certifications at the role and/or entitlement level

Assign certifiers based on governance (manager, role owner, application owner)

Record certification decisions (certify/revoke/change) with timestamps

Trigger revocation or fulfillment actions based on certification outcomes where supported

Support automatic evaluation and revocation of role assignments based on user lifecycle events where authoritative data is available

Certification cadence is determined by application and role risk tier, with higher‑risk access subject to more frequent review.

SOX Alignment:
This capability supports SOX user access review requirements by enabling periodic, role‑based access certifications with auditable outcomes and revocation tracking.

User Stories
As a Manager, I want to review my team’s access efficiently so inappropriate access is removed

As a Certifier, I want to delegate or reassign certification tasks when I am unavailable so reviews are completed on time

As a Role Owner, I want to revalidate role membership so roles remain accurate over time

As Audit/Compliance, I want certification evidence without manual reconstruction

As IAM Governance, I want to identify overdue or incomplete certifications so I can escalate and ensure governance deadlines are met

Capability 6 — Exception & Emergency (“Break Glass”) Governance
Just-in-time (JIT) access is a standard governed access pattern and is distinct from emergency (“break glass”) access.

Break glass access is reserved for incident or continuity scenarios where normal JIT or request workflows cannot be used, and requires post-event review.

The solution shall:

Support documented exceptions to standard roles with required justification

Enforce expiration or revalidation requirements for exceptions

Support emergency access scenarios with required post event review

Retain exception and emergency access records as audit evidence

Provide visibility into known access conflicts and compensating controls, even when access is approved

Exceptions must not be used as a substitute for missing or poorly designed roles; repeated exceptions for similar access must trigger role model review.

SOX Alignment:
This capability supports SOX compensating controls by governing non‑standard and emergency access through time‑bound approvals, documentation, and post‑event review.

User Stories
As Security, I want exceptions to be time bound so standing risk is minimized

As an Application Owner, I want emergency access when needed without bypassing governance

As Audit/Compliance, I want visibility into all non standard access paths

As Security, I want to see exceptions approaching expiration so I can ensure timely revalidation or removal

As a Role Owner, I want to understand which exceptions are compensating for missing or poorly designed roles so the role model can be improved

As IAM governance, I want repeated exceptions to trigger role model improvement rather than becoming permanent workarounds.

Capability 7 — Auditability & Reporting
The solution shall:

Provide reporting that answers who has access, why it was granted, who approved it, and when it was reviewed

Retain historical access decision records (grant/change/revoke)

Support on demand production of audit ready evidence

Audit evidence must be complete, time‑stamped, attributable, and queryable by application, role, user, and time period.

User Stories
As Audit/Compliance, I want to answer access questions quickly without chasing multiple teams

As Audit/Compliance, I want consistent evidence across applications

As security, I want visibility into access patterns and exceptions so risk can be monitored proactively.

As an Application Owner, I want to see who currently has access to my application and why so I can manage risk proactively

As a Manager, I want visibility into my team’s access outside of certification cycles so I can spot issues early

As RBAC Program Leadership, I want visibility into role adoption, exception trends, and certification outcomes so I can assess program health and prioritize improvements

SOX Alignment:
This capability supports SOX audit requirements by providing complete, attributable evidence of access decisions without manual reconstruction.

Capability 8 — Identity Governance and Administration (IGA) Dependency Contract
RBAC is an enterprise access governance product that depends on a capable Identity Governance and Administration (IGA) platform for execution. RBAC defines what access should exist and under what conditions; the IGA platform operationalizes those decisions consistently at enterprise scale.

The IGA platform is a critical dependency for the RBAC product and is required to translate RBAC governance decisions into enforceable, auditable access outcomes across enterprise applications.

RBAC Expectations of the IGA Platform
To support the RBAC product, the IGA platform must:

Act as the system of record for RBAC role definitions, role assignments, and role lifecycle state.

Execute role‑based provisioning and de‑provisioning to downstream systems based on approved RBAC decisions.

Support identity lifecycle–driven access changes (joiner, mover, leaver) so access remains aligned to employment and relationship status.

Enforce approval‑based access governance, ensuring no access is provisioned without required authorization.

Support periodic access certifications (attestation) at the role and/or entitlement level, with outcomes driving revocation where applicable.

Support time‑bound and just‑in‑time (JIT) role activation, including approval, activation, expiration, and evidence retention.

Retain complete, attributable audit evidence for access requests, approvals, activations, revocations, certifications, exceptions, and emergency access.

These capabilities are required for RBAC to achieve its stated objectives of least privilege, scalability, and audit defensibility.

Boundary of Responsibility
RBAC owns:
Role semantics, role governance, eligibility rules, approval intent, segregation‑of‑duties expectations, exception standards, and audit questions (“who has access and why”).

IGA owns:
Execution of RBAC decisions, automation, lifecycle enforcement, certification workflows, and evidence retention.

Downstream systems own:
Runtime enforcement of access based on identities, groups, roles, or entitlements provisioned by IGA.

RBAC does not directly provision access, manage credentials, or enforce runtime authorization. Those responsibilities are delegated to the IGA platform and consuming systems.

Relationship to IGA Requirements
Detailed functional and non‑functional requirements for the IGA platform are defined in the Identity Governance and Administration (IGA) Requirements for RBAC document.

This PRD does not restate those requirements. Instead, it defines the contractual dependency between the RBAC product and the IGA platform and establishes IGA as a non‑optional enabler for RBAC outcomes.

SOX Alignment:
This capability enables SOX compliance by ensuring access governance controls operate consistently and produce auditable evidence through the enterprise IGA platform.

User Flow and Design - WIP
Flow 1 — Application Onboarding into RBAC (Discovery → Ready)
Purpose
Standardize application intake so roles and entitlements can be governed consistently before access is requestable

Primary actors
Application Owner

IAM/RBAC Team

Security

Privacy/Compliance (as needed)

Entry criteria
Application selected for RBAC onboarding

Business and technical owners identified

Steps
Application Owner completes the standardized discovery intake (questionnaire + supporting artifacts as needed

RBAC governance reviews discovery inputs for completeness and risk

RBAC governance synthesizes/validates business roles using eligibility signals and application access patterns

Application is marked “Discovery Complete” and eligible for entitlement mapping.

Key decision points
Discovery completeness: Is the discovery package complete enough to proceed

Privileged/sensitive roles identified: Does the application have privileged roles or emergency access needs

SoD requirements identified: Are separation-of-duties constraints required?

Outputs / evidence captured

Completed RBAC discovery questionnaire

Recorded discovery decisions and onboarding readiness outcome

Exit criteria
Status = Discovery Complete; application is eligible for entitlement mapping

Status model: Not Started → In Progress → Blocked → Complete.

Notes / constraints
Discovery is explicitly structured information capture and readiness gate.

Flow 2 — Standard Access Request (Role Based)
Purpose
Enable governed role-based access requests through ServiceNow, with approvals, SoD checks, and traceable outcomes

Primary actors
Requestor, Manager/Approver (or designated approver), IAM Operations / Access Team, and ServiceNow as the request catalogue UI.

Entry criteria
Role is available/requestable for the application

Requestor initiates an application access request in ServiceNow

For certain access paths, user must appear in ServiceNow “requested for” pick list before access may be requested

Steps
•	Requestor initiates request in ServiceNow and selects the appropriate role/access.
•	ServiceNow request process performs SoD evaluation where configured
•	Request routes to manager/approver (or governance-defined approver)
•	Approver records decision (approve/deny) and rationale as required
•	After approval, request routes to fulfillment/provisioning path
•	Access is provisioned and request is completed with recorded outcome

Key decision points
Eligibility: Is the requestor eligible for the role?

SoD: Does the request trigger a potential SoD violation?

Denial/blocked handling: If denied or blocked, requestor should receive reason

Outputs / evidence captured
Request record in ServiceNow with timestamps and approver identity

SoD check outcome recorded where applicable

Fulfillment outcome recorded

Exit criteria
Request status reflects outcome (Approved + Fulfilled) or (Denied/Blocked with reason)

Design notes
Role selection clarity (role names, descriptions, intended audience) reduces wrong-role requests

Flow 3 — Access Certification (Review & Attestation)
Purpose
Periodically revalidate access and retain evidence; drive revocations through fulfillment path where supported.

Primary actors
Certifier (Manager / Role Owner / Application Owner), Compliance/Audit (observer), IAM Ops (fulfillment for revocations), ServiceNow (if used for tracked fulfillment actions).

Entry criteria


Certification cycle initiated for in-scope roles/access based on governance-defined cadence.

Current access assignments available for review

Steps
Certification cycle is initiated for defined scope

Certifier reviews current access assignments

Certifier records decision per assignment: certify / revoke / change required

Decisions are retained as evidence with timestamps

Revocations/changes are executed via the standard fulfillment path

Key decision points
Delegation: Certifier delegates/reassigns certification tasks when unavailable

Overdue: Governance identifies overdue/incomplete certifications and escalates

Outputs / evidence captured
Certification decisions with timestamps
Tracked revocation actions through fulfillment path

Exit criteria
Certification cycle completed with all items decided, and any revocations initiated/executed via fulfillment path.

Design notes
Throughput requirements: bulk decisions, filtering (privileged roles, exceptions), clear accountability.

Key Variants (Alternative Paths)
Variant A — Privileged Role Request (ServiceNow)
Purpose
Apply heightened governance to privileged access requests.

Privileged definition
Privileged access includes ability to add/delete/modify user access, change configuration settings, develop/promote code changes, or edit schedules of automated jobs.

Primary actors
Requestor, additional approver(s) (per governance), IAM Ops.

Entry criteria
Requestor selects a role flagged as privileged/sensitive (PRD).

Steps
Request flagged as privileged/sensitive.

Approval requires additional approvers beyond manager where defined.

Fulfillment proceeds under controlled process; evidence retained.

Key decision points
Does the role meet privileged criteria?

Are all required privileged approvals present?

Outputs / evidence
Approval chain + timestamps; privileged flag retained.

Variant B — Exception to Standard Roles
Purpose
Grant access that does not fit defined roles while keeping it controlled and time-bound.

Primary actors
Requestor, designated exception approver, IAM Ops, Role Owner (optional reviewer).

Entry criteria
Requestor cannot find an appropriate standard role; submits exception request with business justification.

Steps
Requestor submits exception request with justification

Exception is reviewed/approved by designated authority (governance-defined)

Exception is granted with explicit conditions (expiration and/or revalidation expectation)

Exception is reviewed during certification or defined cadence

Key decision points
Is expiration/revalidation defined?

Is the exception compensating for a missing role?

Outputs / evidence
Exception justification, approver, expiration/revalidation terms, and timestamps.

Variant C — Break Glass / Emergency Access
Purpose
Provide time-sensitive access under controls, with mandatory post-use review.

Primary actors
Requester (or incident responder), Security/IAM Governance, Application Owner, IAM Ops.

Entry criteria
Time-sensitive need where normal workflow would block critical work; “break glass need is declared.”

Steps
Break glass need is declared and recorded with justification.

Emergency access granted under controlled process.

Post-event review confirms appropriateness, documents outcome, and removes/adjusts access as needed.

Key decision points
Is post-event review completed? (PRD explicitly requires post-use review; otherwise becomes uncontrolled exception channel.)

Outputs / evidence
Justification, timestamps, reviewer identity, outcome, and confirmation of access removal/adjustment.