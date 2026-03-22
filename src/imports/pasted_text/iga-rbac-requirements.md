Identity Governance and and Administration (IGA) Requirements for RBAC - DRAFT



By Jordan Eisenback

4 min

2

Add a reaction
Purpose and Scope
The Identity Governance and Administration (IGA) platform is a required dependency for the Enterprise RBAC product. The IGA platform is responsible for executing RBAC governance decisions, including access provisioning, de‑provisioning, time‑bound access, access reviews, and audit evidence retention.

This document does not represent the full set of Enterprise RBAC requirements.

This document defines the Identity Governance and Administration (IGA) platform requirements necessary to execute, enforce, and audit approved RBAC decisions. It focuses on execution mechanics, including provisioning, de‑provisioning, certification workflows, time‑bound access, integrations, and audit evidence.

Core IGA Requirements
Platform Architecture and Deployment
FR‑1.1 The platform shall support hybrid identity environments spanning on‑premises and SaaS deployments.

FR‑1.2 The platform shall support coexistence of on‑premises and SaaS components with equivalent functional capability.

FR‑1.3 The platform shall support phased migration and parallel operation with legacy identity and access management systems.

Application Connectivity and Coverage
FR‑2.1 The platform shall support governance of both connected and non‑connected applications.

FR‑2.2 The platform shall include non‑connected applications in User Access Reviews (UAR) and certification processes.

FR‑2.3 The platform shall support enterprise integration patterns including APIs, directories, databases, flat files, and SCIM.

FR‑2.4 The platform shall provide pre‑built connectors for common enterprise and SaaS systems.

FR‑2.5 The platform shall provide extensibility mechanisms where direct connectors are not available

FR‑2.6 The platform shall treat directory groups as governed applications, supporting ownership assignment, lifecycle state, certifications, and audit history

FR‑2.7 The platform shall correlate discovered accounts and entitlements to business roles during ingestion

FR‑2.8 The platform shall identify and flag privileged or elevated access at ingestion time and persist this classification for use in approval, certification, and reporting

FR‑2.9 The platform shall support JDBC‑based ingestion and REST‑based provisioning for enterprise systems where required

Role, Policy, and Access Governance
FR‑3.1 The platform shall support Role‑Based Access Control (RBAC)

FR‑3.2 The platform shall support Attribute‑Based Access Control (ABAC)

FR‑3.3 The platform shall allow provisioning rules based on HR and identity attributes such as job code, department, employment type, and location

FR‑3.4 The platform shall support role modeling constructs suitable for enterprise access management

FR‑3.5 The platform shall support role analysis or role derivation capabilities

FR‑3.6 Roles shall be the primary governance construct. Direct assignment of entitlements to users shall be restricted to governed workflows and shall not bypass role‑based governance

FR‑3.7 The platform shall automatically re‑evaluate attribute‑driven eligibility and provisioning rules and shall assign or remove access when authoritative identity attributes change

FR‑3.8 The platform shall evaluate Segregation of Duties (SoD) policies during access requests and role assignments

FR‑3.9 The platform shall support governed SoD outcomes, including blocking, exception routing, and compensating controls

FR‑3.10 The platform shall surface SoD conflicts during access certifications and audits and shall retain SoD evaluations and decisions as audit evidence

Identity Lifecycle and HR Integration
FR-4.1 The platform shall integrate with Workday as an authoritative HR source

FR-4.2 The platform shall consume HR attributes to drive identity lifecycle events

FR-4.3 The platform shall support write‑back to HR systems when endpoints are available

FR-4.4 The platform shall detect and manage orphaned identity objects

Privileged Access and Time‑Bound Controls
FR‑5.1 The platform shall support time‑bound (Just‑In‑Time) access as a standard access pattern for privileged roles

FR‑5.2 The platform shall automatically de‑provision access when time‑boxed conditions expire

FR‑5.3 The platform shall support approval workflows for privileged access based on role risk

FR‑5.4 The platform shall retain activation, expiration, approval, and execution outcomes for time‑bound access as audit evidence

Workflow, ITSM, and Orchestration
FR‑6.1 The platform shall provide configurable approval workflows

FR‑6.2 The platform shall integrate with ServiceNow as the access request intake and user experience layer

FR‑6.3 The platform shall evaluate eligibility, enforce approval logic, and execute fulfillment and revocation independent of the request intake UI

FR‑6.4 The platform shall support cross‑system orchestration where data from one source system drives provisioning actions in another

FR‑6.5 The platform shall support chained orchestration flows and retain execution evidence for audit and troubleshooting purposes

Audit, Compliance, and Reporting
FR‑7.1 The platform shall provide comprehensive audit logging for identity, access, and governance actions

FR‑7.2 The platform shall capture approver identity, timestamps, and before‑and‑after access state for all governed actions

FR‑7.3 The platform shall support configurable or defined audit log retention policies

FR‑7.4 The platform shall detect and report directory and group membership changes that it governs

FR‑7.5 The platform detect and surface access changes outside IGA‑governed workflows where technically feasible

FR‑7.6 The platform shall retain reconciliation actions and outcomes related to out‑of‑band access as audit evidence

FR‑7.7 The platform shall support periodic access certifications, including certifications performed by application owners and/or role owners

FR‑7.8 The platform shall retain access certification decisions as audit evidence, including reviewer identity, decision outcome, rationale where provided, and decision timestamp

FR‑7.9 The platform shall support role‑level certifications in addition to entitlement‑level reviews

FR‑7.10 The platform shall automatically revoke access when removal is approved during a certification

FR‑7.11 The platform shall support certification features including filtering, prioritization, delegation, reassignment, escalation, and overdue tracking

Extensibility and Automation
FR‑8.1 The platform shall allow the use of external scripts (e.g., PowerShell) where required

FR‑8.2 The platform shall support execution of custom scripts as part of platform workflows

Non‑Functional Requirements
Support and Service Levels
NFR‑1.1 The vendor shall provide defined support tiers

NFR‑1.2 The vendor shall provide documented SLA response times by severity

NFR‑1.3 The vendor shall offer 24×7 support options for critical incidents

Release, Patch, and Change Management
NFR‑2.1 The platform shall follow a documented release cadence

NFR‑2.2 The vendor shall provide advance notice of upgrades and maintenance activities

NFR‑2.3 The platform shall support controlled or phased rollout of updates

Scalability and Commercial Model
NFR-3.1 The licensing model shall scale based on managed identity population

NFR-3.2 The vendor shall document pricing tiers and SKU structure

NFR-3.3 The vendor shall define rules for price adjustments during the contract term

Implementation and Transition
NFR-4.1 The vendor shall support phased implementation approaches

NFR-4.2 The vendor shall provide implementation or professional services options

NFR-4.3 The solution shall minimize operational disruption during transition