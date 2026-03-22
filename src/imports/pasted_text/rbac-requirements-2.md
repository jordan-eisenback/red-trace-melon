ID	Req	Type	Owner	Parent	Outcome	Notes
RBAC‑REQ‑E1	Establish a standardized, enterprise role‑based access governance model that defines roles, maps roles to entitlements, and governs access decisions consistently across applications	Enterprise	RBAC Program / IAM Governance	None	Consistent role‑based access decisions across the enterprise	Foundation requirement; all RBAC capabilities roll up here
RBAC‑REQ‑E2	Enforce least privilege access by ensuring users receive only the access required for their job function and by explicitly identifying and governing privileged or sensitive access	Enterprise	Security / RBAC Governance	None	Reduced access risk and over‑privilege	Drives privileged designation, SoD, and risk‑based controls
RBAC‑REQ‑E3	Govern the full access lifecycle, including request, approval, activation, review, revocation, and exception handling, in a repeatable and auditable manner	Enterprise	IAM / RBAC Product	None	End‑to‑end controlled access lifecycle	Lifecycle completeness and determinism
RBAC‑REQ‑E4	Produce complete, attributable, and auditable evidence of access decisions sufficient to support SOX and other regulatory audits without manual reconstruction	Enterprise	Audit / Compliance	None	Audit‑ready access governance	Eliminates spreadsheets, screenshots, and tribal knowledge
RBAC‑REQ‑E5	Support scalable onboarding of applications, identities, and roles without bespoke redesign or manual controls	Enterprise	Enterprise Architecture / IAM	None	Scalable RBAC adoption	Enables enterprise‑wide rollout
RBAC‑REQ‑E6	Define access intent, policy, and governance while delegating execution, automation, and enforcement to an enterprise IGA platform	Enterprise	Enterprise IAM	None	Clear separation of governance and execution	RBAC governs; IGA executes
RBAC‑REQ‑1.1	Provide a standardized discovery model to capture application RBAC readiness inputs	Capability	RBAC Product	RBAC‑REQ‑E5	Consistent, scalable application onboarding	Enables repeatable intake without bespoke analysis
RBAC‑REQ‑1.2	Require completion of minimum discovery criteria before entitlement mapping	Capability	RBAC Product	RBAC‑REQ‑E5	Readiness gating enforced	Prevents premature onboarding
RBAC‑REQ‑1.3	Require identification of business and technical owners	Capability	RBAC Product	RBAC‑REQ‑E1	Clear accountability	Ownership is prerequisite to governance
RBAC‑REQ‑1.4	Require documented role constructs or confirmation none exist	Capability	RBAC Product	RBAC‑REQ‑E1	Role clarity	Avoids hidden or ad‑hoc roles
RBAC‑REQ‑1.5	Require a current permission inventory	Capability	RBAC Product	RBAC‑REQ‑E2	Visibility into access risk	Baseline for least privilege
RBAC‑REQ‑1.6	Identify privileged access paths during discovery	Capability	RBAC Product	RBAC‑REQ‑E2	Early risk identification	Drives heightened governance
RBAC‑REQ‑1.7	Capture segregation‑of‑duties considerations	Capability	RBAC Product	RBAC‑REQ‑E2	SoD risks identified	Supports compliance controls
RBAC‑REQ‑1.8	Track discovery lifecycle status	Capability	RBAC Product	RBAC‑REQ‑E5	Operational transparency	Enables scalable pipeline management
RBAC‑REQ‑1.9	Retain discovery artifacts as audit evidence	Capability	RBAC Product	RBAC‑REQ‑E4	Audit‑ready onboarding evidence	Eliminates manual reconstruction
RBAC‑REQ‑1.10	Support RBAC governance for non‑human identities	Capability	RBAC Product	RBAC‑REQ‑E1	Consistent governance across identity types	Non‑human access governed, not excluded
RBAC‑REQ‑2.1	Support explicit definition of business roles	Capability	RBAC Product	RBAC‑REQ‑E1	Standardized role model	Roles reflect job functions
RBAC‑REQ‑2.2	Enforce role eligibility criteria	Capability	RBAC Product	RBAC‑REQ‑E2	Reduced inappropriate access	Prevents over‑assignment
RBAC‑REQ‑2.3	Require documented role purpose and owner	Capability	RBAC Product	RBAC‑REQ‑E1	Role accountability	Ownership enables lifecycle governance
RBAC‑REQ‑2.4	Support role lifecycle states	Capability	RBAC Product	RBAC‑REQ‑E3	Controlled role evolution	Prevents orphaned roles
RBAC‑REQ‑2.5	Ensure users inherit access only through roles	Capability	RBAC Product	RBAC‑REQ‑E2	Enforced least privilege	Eliminates direct entitlement sprawl
RBAC‑REQ‑2.6	Automatically revoke access when role removed	Capability	RBAC Product	RBAC‑REQ‑E3	Deterministic deprovisioning	No manual cleanup
RBAC‑REQ‑2.7	Support role composition	Capability	RBAC Product	RBAC‑REQ‑E5	Scalable role design	Reduces duplication
RBAC‑REQ‑2.8	Support periodic role review	Capability	RBAC Product	RBAC‑REQ‑E3	Ongoing role hygiene	Prevents role drift
RBAC‑REQ‑2.9	Require approval and justification for material role changes	Capability	RBAC Product	RBAC‑REQ‑E4	Auditable role changes	Change control enforced
RBAC‑REQ‑3.1	Enforce role‑to‑permission mapping	Capability	RBAC Product	RBAC‑REQ‑E1	Consistent access model	Centralizes authorization
RBAC‑REQ‑3.2	Require justification for permissions in roles	Capability	RBAC Product	RBAC‑REQ‑E2	Least privilege defensibility	Explains access scope
RBAC‑REQ‑3.3	Flag privileged entitlements during mapping	Capability	RBAC Product	RBAC‑REQ‑E2	Privileged access visibility	Drives stricter controls
RBAC‑REQ‑3.4	Require role owner approval for permission changes	Capability	RBAC Product	RBAC‑REQ‑E3	Controlled permission lifecycle	Prevents silent expansion
RBAC‑REQ‑3.5	Apply privileged designation using governance criteria	Capability	RBAC Product	RBAC‑REQ‑E2	Risk‑based governance	Enables tiered controls
RBAC‑REQ‑4.1	Support role‑based access requests	Capability	RBAC Product	RBAC‑REQ‑E1	Consistent request experience	Eliminates entitlement picking
RBAC‑REQ‑4.2	Route approvals based on governance rules	Capability	RBAC Product	RBAC‑REQ‑E3	Policy‑driven approvals	Reduces variance
RBAC‑REQ‑4.3	Record approval decisions as evidence	Capability	RBAC Product	RBAC‑REQ‑E4	Attributable approval trail	Audit defensibility
RBAC‑REQ‑4.4	Prevent fulfillment without approvals	Capability	RBAC Product	RBAC‑REQ‑E3	Enforced authorization	No bypass paths
RBAC‑REQ‑4.5	Support time‑bound / JIT role activation	Capability	RBAC Product	RBAC‑REQ‑E2	Reduced standing privilege	Risk‑aware access
RBAC‑REQ‑4.6	Automatically revoke JIT access	Capability	RBAC Product	RBAC‑REQ‑E3	Automatic cleanup	No lingering access
RBAC‑REQ‑4.7	Record JIT events as audit evidence	Capability	RBAC Product	RBAC‑REQ‑E4	Full lifecycle evidence	Covers elevated access
RBAC‑REQ‑5.1	Support periodic access certifications	Capability	RBAC Product	RBAC‑REQ‑E3	Ongoing access validation	Governance loop
RBAC‑REQ‑5.2	Assign certifiers by governance rules	Capability	RBAC Product	RBAC‑REQ‑E3	Correct reviewer assignment	Prevents conflicts
RBAC‑REQ‑5.3	Record certification decisions	Capability	RBAC Product	RBAC‑REQ‑E4	Attributable review evidence	Audit ready
RBAC‑REQ‑5.4	Trigger actions from certification outcomes	Capability	RBAC Product	RBAC‑REQ‑E3	Closed‑loop enforcement	Reviews drive change
RBAC‑REQ‑5.5	Set certification cadence by risk tier	Capability	RBAC Product	RBAC‑REQ‑E2	Risk‑based reviews	Focus on sensitive access
RBAC‑REQ‑6.1	Support documented access exceptions	Capability	RBAC Product	RBAC‑REQ‑E3	Governed deviations	No informal workarounds
RBAC‑REQ‑6.2	Enforce expiration or revalidation of exceptions	Capability	RBAC Product	RBAC‑REQ‑E2	Time‑bound risk	Limits standing exceptions
RBAC‑REQ‑6.3	Support emergency (break glass) access with review	Capability	RBAC Product	RBAC‑REQ‑E3	Controlled emergency access	Accountability preserved
RBAC‑REQ‑6.4	Retain exception and emergency evidence	Capability	RBAC Product	RBAC‑REQ‑E4	Defensible non‑standard access	Audit completeness
RBAC‑REQ‑6.5	Trigger role review from repeated exceptions	Capability	RBAC Product	RBAC‑REQ‑E1	Role model improvement	Exceptions drive design fixes
RBAC‑REQ‑7.1	Report who has access and why	Capability	RBAC Product	RBAC‑REQ‑E4	Transparency	Core audit question
RBAC‑REQ‑7.2	Retain historical access records	Capability	RBAC Product	RBAC‑REQ‑E4	Longitudinal evidence	Supports audits
RBAC‑REQ‑7.3	Support on‑demand audit evidence	Capability	RBAC Product	RBAC‑REQ‑E4	Zero manual reconstruction	Audit efficiency
RBAC‑REQ‑7.4	Ensure evidence is complete and attributable	Capability	RBAC Product	RBAC‑REQ‑E4	Compliance defensibility	SOX‑aligned
RBAC‑REQ‑8.1	RBAC depends on IGA for execution	Capability	RBAC Product	RBAC‑REQ‑E6	Clear execution boundary	RBAC governs, IGA executes
RBAC‑REQ‑8.2	IGA is system of record for roles and assignments	Capability	RBAC Product	RBAC‑REQ‑E6	Authoritative source	Eliminates ambiguity
RBAC‑REQ‑8.3	IGA executes provisioning, certification, JIT	Capability	RBAC Product	RBAC‑REQ‑E3	Lifecycle automation	Scalable enforcement
RBAC‑REQ‑8.4	IGA retains audit evidence for all access events	Capability	RBAC Product	RBAC‑REQ‑E4	Centralized evidence	Audit‑ready by design
FR‑1.1	Support hybrid identity environments spanning on‑premises and SaaS	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	RBAC roles executable across all environments	Required for enterprise‑wide RBAC execution
FR‑1.2	Support coexistence of on‑premises and SaaS components with equivalent capability	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Phased RBAC adoption without disruption	Enables incremental migration
FR‑1.3	Support phased migration and parallel operation with legacy IAM systems	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	RBAC transition without access loss	Protects business continuity
FR‑2.1	Support governance of connected and non‑connected applications	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Complete access governance coverage	Prevents audit blind spots
FR‑2.2	Include non‑connected applications in access reviews and certifications	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	All access subject to review	Manual access still governed
FR‑2.3	Support standard enterprise integration patterns (APIs, directories, DBs, files, SCIM)	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Standardized provisioning execution	Avoids bespoke integrations
FR‑2.4	Provide prebuilt connectors for common enterprise and SaaS systems	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Faster application onboarding	Improves scalability
FR‑2.5	Provide extensibility mechanisms where direct connectors do not exist	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Long‑tail application support	Ensures RBAC coverage completeness
FR‑7.1	Provide comprehensive audit logging for identity, access, and governance actions	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Foundational audit trail	Required for compliance
FR‑7.2	Capture approver identity, timestamps, and before/after access state	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Full decision traceability	Attribution required for SOX
FR‑7.3	Support configurable audit log retention policies	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Evidence retained per policy	Aligns to regulatory requirements
FR‑7.4	Detect and report governed directory and group membership changes	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Access drift visibility	Supports least privilege
FR‑7.5	Detect access granted outside IGA‑governed workflows	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Exception and violation detection	Surfaces unauthorized access
FR‑7.6	Retain reconciliation actions and outcomes as audit evidence	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Proof of remediation	Required for defensibility
FR‑7.7	Support periodic access certifications by role and/or entitlement	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Ongoing access validation	Drives lifecycle governance
FR‑7.8	Retain certification decisions with reviewer, outcome, and timestamp	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Certification evidence	Eliminates manual reconstruction
FR‑7.9	Support role‑level certifications	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	RBAC‑native reviews	Aligns reviews to role model
FR‑7.10	Automatically revoke access when removal is approved during certification	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Closed‑loop access removal	Prevents lingering access
FR‑7.11	Support certification delegation, escalation, and overdue tracking	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Scalable certification operations	Required at enterprise scale
NFR‑1.1	The vendor shall provide defined support tiers	Non‑Functional (Support)	IGA Vendor	RBAC‑REQ‑8.x	Clear support escalation paths	Constrains IGA execution model
NFR‑1.2	The vendor shall provide documented SLA response times by severity	Non‑Functional (Support)	IGA Vendor	RBAC‑REQ‑8.x	Predictable incident response	Severity definitions may be referenced
NFR‑1.3	The vendor shall offer 24×7 support options for critical incidents	Non‑Functional (Support)	IGA Vendor	RBAC‑REQ‑8.x	Continuous coverage for high‑impact events	Enterprise operational requirement
NFR‑2.1	The platform shall follow a documented release cadence	Non‑Functional (Maintainability)	IGA Vendor	RBAC‑REQ‑8.x	Predictable platform change	Reduces lifecycle risk
NFR‑2.2	The vendor shall provide advance notice of upgrades and maintenance activities	Non‑Functional (Maintainability)	IGA Vendor	RBAC‑REQ‑8.x	Planned change management	Supports audit and ops readiness
NFR‑2.3	The platform shall support controlled or phased rollout of updates	Non‑Functional (Maintainability)	IGA Vendor	RBAC‑REQ‑8.x	Reduced disruption during updates	Required at enterprise scale
NFR‑3.1	The licensing model shall scale based on managed identity population	Non‑Functional (Scalability / Commercial)	IGA Vendor	RBAC‑REQ‑8.x	Cost scales with adoption	Avoids redesign as RBAC grows
NFR‑3.2	The vendor shall document pricing tiers and SKU structure	Non‑Functional (Commercial)	IGA Vendor	RBAC‑REQ‑8.x	Commercial transparency	Required for procurement
NFR‑3.3	The vendor shall define rules for price adjustments during the contract term	Non‑Functional (Commercial)	IGA Vendor	RBAC‑REQ‑8.x	Predictable cost model	Mitigates financial risk
NFR‑4.1	The vendor shall support phased implementation approaches	Non‑Functional (Transition)	IGA Vendor	RBAC‑REQ‑8.x	Controlled deployment	Transition requirement
NFR‑4.2	The vendor shall provide implementation or professional services options	Non‑Functional (Transition)	IGA Vendor	RBAC‑REQ‑8.x	Accelerated adoption	Enablement constraint
NFR‑4.3	The solution shall minimize operational disruption during transition	Non‑Functional (Transition)	IGA Vendor	RBAC‑REQ‑8.x	Stable operations during cutover	Transition success criterion
IR‑WD‑1	Workday shall act as the authoritative source for worker lifecycle status	Interface / Data	HRIS	RBAC‑REQ‑8.x	Accurate joiner/mover/leaver events	Replaces prior HR SoR
IR‑WD‑2	IGA shall consume Workday attributes required for RBAC eligibility	Interface / Data	IAM	RBAC‑REQ‑8.3	Deterministic role eligibility	Attribute list maintained separately
IR‑WD‑3	Attribute refresh frequency shall support timely access changes	Interface / Data	IAM	RBAC‑REQ‑8.3	Near‑real‑time lifecycle enforcement	SLA defined with HRIS
IR‑WD‑4	Attribute changes impacting eligibility shall be auditable	Interface / Data	IAM	RBAC‑REQ‑8.4	Audit defensibility	Required for SOX
TR‑WD‑1	Establish Workday as the authoritative HR system of record for the enterprise IGA platform	Transition	HRIS / IAM	RBAC‑REQ‑8.x	Single authoritative source for identity lifecycle	Parent transition requirement
TR‑WD‑1.1	A supported integration between Workday and IGA shall be implemented	Transition	IAM	TR‑WD‑1	Technical connectivity established	Integration pattern defined separately
TR‑WD‑1.2	Workday shall provide worker lifecycle events to IGA (hire, change, terminate)	Transition	HRIS	TR‑WD‑1	Reliable joiner/mover/leaver processing	Event vs batch clarified during design
TR‑WD‑1.3	Legacy HR system feeds to IGA shall be retired post‑cutover	Transition	IAM	TR‑WD‑1	Elimination of dual sources	Explicit decommissioning required
TR‑WD‑2	Ingest and normalize Workday attributes required for RBAC governance	Transition	IAM / RBAC	RBAC‑REQ‑8.x	Deterministic RBAC eligibility inputs	Parent transition requirement
TR‑WD‑2.1	Required Workday attributes shall be identified and documented	Transition	RBAC Governance	TR‑WD‑2	Clear attribute contract	Job profile, org, location, etc.
TR‑WD‑2.2	Workday attributes shall be mapped to IGA identity schema	Transition	IAM	TR‑WD‑2	Consistent attribute semantics	Avoids ad‑hoc transformations
TR‑WD‑2.3	Attribute refresh frequency shall support timely access changes	Transition	IAM / HRIS	TR‑WD‑2	No lifecycle lag	SLA documented
TR‑WD‑3	Remap RBAC role eligibility and lifecycle logic to Workday attributes	Transition	RBAC Governance	RBAC‑REQ‑E3	Continuity of access governance	Parent transition requirement
TR‑WD‑3.1	Existing eligibility rules shall be evaluated against Workday data	Transition	RBAC	TR‑WD‑3	Eligibility gaps identified	Prevents access loss
TR‑WD‑3.2	RBAC eligibility rules shall be updated to use Workday attributes	Transition	RBAC	TR‑WD‑3	Correct role assignment behavior	Governance approval required
TR‑WD‑3.3	Eligibility changes shall be validated prior to production enablement	Transition	RBAC / Audit	TR‑WD‑3	No unintended access impact	Required control gate
TR‑WD‑4	Enable RBAC‑aligned governance for access to the Workday platform itself	Transition	HRIS / Security	RBAC‑REQ‑E1	Workday access governed consistently	Parent transition requirement
TR‑WD‑4.1	Workday security roles shall be identified and documented	Transition	HRIS	TR‑WD‑4	Visibility into Workday access model	Input to RBAC mapping
TR‑WD‑4.2	Workday roles shall be mapped to enterprise RBAC roles where feasible	Transition	RBAC / HRIS	TR‑WD‑4	Consistent role governance	Manual controls allowed if needed
TR‑WD‑4.3	Approval and review requirements for Workday roles shall be defined	Transition	RBAC Governance	TR‑WD‑4	Least‑privilege enforcement	Certification cadence defined
IGA‑IMP‑1	Configure the IGA platform to support RBAC execution patterns	Transition	IAM	RBAC‑REQ‑8.x	IGA ready for RBAC use	Parent enablement requirement
IGA‑IMP‑1.1	Authoritative identity sources shall be configured in IGA	Transition	IAM	IGA‑IMP‑1	Deterministic identity data	Includes Workday
IGA‑IMP‑1.2	Identity correlation rules shall be defined and validated	Transition	IAM	IGA‑IMP‑1	One identity per person	Prevents duplicate identities
IGA‑IMP‑1.3	Baseline provisioning and deprovisioning workflows shall be enabled	Transition	IAM	IGA‑IMP‑1	Lifecycle enforcement active	Pre‑RBAC prerequisite
DIR‑INT‑1	Integrate IGA with enterprise directory services for access enforcement	Interface / Functional	IAM	RBAC‑REQ‑8.3	RBAC decisions enforced in directory	Parent requirement
DIR‑INT‑1.1	IGA shall provision and deprovision directory groups	Interface / Functional	IAM	DIR‑INT‑1	Group‑based access enforced	AD / Entra
DIR‑INT‑1.2	Group lifecycle state shall be governed through IGA	Interface / Functional	IAM	DIR‑INT‑1	No orphaned access	Aligns with RBAC roles
DIR‑INT‑1.3	Directory changes outside IGA shall be detectable	Interface / Functional	IAM	RBAC‑REQ‑8.4	Drift visibility	Supports auditability
IGA‑BND‑1	Access enforcement responsibilities between IGA and downstream systems shall be defined	Non‑Functional / Constraint	IAM	RBAC‑REQ‑8.x	Clear ownership boundaries	Prevents false assumptions
IGA‑BND‑1.1	IGA shall not be responsible for runtime authorization decisions	Constraint	IAM	IGA‑BND‑1	Correct control placement	Enforced by consuming systems
FR‑3.1 (Proposed)	The platform shall ingest accounts and entitlements from authoritative sources including Identidy+Governance+and+and+Administration+(IGA)+Requirements+for+RBAC-listed sources (e.g., AD, JDBC, REST APIs, flat files)	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Consistent enterprise access ingestion	Explicit sources are listed in IGA requirements doc [Identidy+G...s+for+RBAC | Word]
FR‑3.2 (Proposed)	The platform shall associate discovered accounts and entitlements to business roles for governance	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Roles govern real access state	Called out under “Core ingestion and reconciliation” [Identidy+G...s+for+RBAC | Word]
FR‑3.3 (Proposed)	The platform shall flag privileged or elevated entitlements during ingestion	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Privileged access is visible and governable	Explicitly stated in IGA requirements doc [Identidy+G...s+for+RBAC | Word]
FR‑3.4 (Proposed)	The platform shall reconcile access granted outside IGA workflows and surface drift	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Drift is detectable and auditable	Explicit in IGA requirements doc [Identidy+G...s+for+RBAC | Word]
FR‑3.5 (Proposed)	The platform shall retain reconciliation outcomes as audit evidence	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Remediation evidence is preserved	Explicit in IGA requirements doc
FR‑3.6 (Proposed)	The platform shall provision and deprovision accounts/access to targets including AD, JDBC systems, and REST API systems	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	RBAC decisions execute across target types	Targets listed in IGA requirements doc [Identidy+G...s+for+RBAC | Word]
FR‑3.7 (Proposed)	The platform shall support read‑from‑one‑source / provision‑to‑another cross‑system patterns	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Standardized execution patterns	“Cross‑system patterns” explicitly called out [Identidy+G...s+for+RBAC | Word]
FR‑4.1 (Proposed)	Access requests shall originate in ServiceNow as the request intake and UX layer	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Standard request intake	Explicit in IGA requirements doc [Identidy+G...s+for+RBAC | Word]
FR‑4.2 (Proposed)	The platform shall execute approved requests originating from ServiceNow and retain request/decision linkage	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	End‑to‑end traceability from intake to execution	Supports the integration map expectation (ServiceNow ↔ IGA) [Advanced A...ome Stuff! | Outlook], [Identidy+G...s+for+RBAC | Word]
FR‑4.3 (Proposed)	The platform shall support governed script execution (e.g., PowerShell) when required for provisioning	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Coverage for systems needing scripts	“Scripting Support… PowerShell… must be governed and auditable” [Identidy+G...s+for+RBAC | Word]
FR‑4.4 (Proposed)	Script execution shall be auditable and tied to access workflows	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Scripted actions produce evidence	Explicit in IGA requirements doc [Identidy+G...s+for+RBAC | Word]
RBAC‑REQ‑5.6 (Proposed)	The system shall support automatic evaluation and revocation of role assignments based on user lifecycle events where authoritative data is available	Capability	RBAC Product	RBAC‑REQ‑E3	Lifecycle enforcement beyond periodic review	Present in PRD narrative but not enumerated in RTM list [2026-01-27...Answers 1 | Word], [RTM - RBAC | Excel]
DIR‑1	Integrate directory services with the IGA platform for RBAC execution	Interface / Functional	IAM	RBAC‑REQ‑8.3	RBAC decisions enforceable via directory	Parent requirement
DIR‑1.1	The IGA platform shall ingest directory accounts and group memberships	IGA Functional	IGA Platform	DIR‑1	Directory access is visible for governance	AD / Entra
DIR‑1.2	The IGA platform shall associate directory accounts and groups to RBAC roles	IGA Functional	IGA Platform	DIR‑1	Role governance reflects real access	Prevents orphaned access
DIR‑1.3	Privileged directory groups shall be flagged during ingestion	IGA Functional	IGA Platform	DIR‑1	Privileged access explicitly governed	Supports least privilege
DIR‑2	Govern directory group lifecycle through IGA	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Group access managed consistently	Parent requirement
DIR‑2.1	The IGA platform shall provision and deprovision directory group memberships	IGA Functional	IGA Platform	DIR‑2	Access changes execute automatically	Group‑based RBAC
DIR‑2.2	Removal of RBAC role assignments shall result in directory access revocation	IGA Functional	IGA Platform	DIR‑2	Deterministic deprovisioning	No manual cleanup
DIR‑2.3	Directory groups governed by RBAC shall have defined owners	IGA Functional	IGA Platform	DIR‑2	Accountability for access	Aligns with role ownership
DIR‑3	Detect and surface directory access changes outside IGA workflows	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Access drift is visible	Parent requirement
DIR‑3.1	The IGA platform shall detect out‑of‑band directory group membership changes	IGA Functional	IGA Platform	DIR‑3	Unauthorized access surfaced	Drift detection
DIR‑3.2	Reconciliation outcomes shall be retained as audit evidence	IGA Functional	IGA Platform	DIR‑3	Remediation defensibility	Required for SOX
DIR‑4	Treat directory‑mediated access equivalently to directly connected applications	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Consistent governance and evidence	Parent requirement
DIR‑4.1	Directory‑based access shall be included in certifications and reviews	IGA Functional	IGA Platform	DIR‑4	No audit blind spots	Manual and automated access covered
DIR‑4.2	Certification decisions affecting directory access shall drive enforcement	IGA Functional	IGA Platform	DIR‑4	Closed‑loop governance	Aligns with lifecycle controls
DIR‑5	Support directory services as provisioning targets	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	RBAC execution reaches enforcement plane	Parent requirement
DIR‑5.1	The IGA platform shall support provisioning to directory services as a target	IGA Functional	IGA Platform	DIR‑5	Access enforced where it actually lives	AD / Entra
DIR‑5.2	Cross‑system patterns involving directories shall be supported	IGA Functional	IGA Platform	DIR‑5	Read‑from HR, write‑to directory	Common enterprise pattern
DIR‑6	Produce audit‑ready evidence for directory‑mediated access	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	“Who has access and why” answerable	Parent requirement
DIR‑6.1	Directory provisioning and deprovisioning events shall be logged	IGA Functional	IGA Platform	DIR‑6	Full execution trace	Required for audits
DIR‑6.2	Directory access evidence shall be queryable by user, role, group, and time	IGA Functional	IGA Platform	DIR‑6	Efficient audit response	No manual reconstruction
DIR‑7	Define enforcement boundaries between IGA and directory services	Constraint	IAM	RBAC‑REQ‑8.x	Clear ownership of controls	Parent requirement
DIR‑7.1	IGA shall not be responsible for runtime authorization decisions	Constraint	IAM	DIR‑7	Correct control placement	Enforced by consuming systems
DIR‑7.2	Directory services shall enforce access based on IGA‑managed state	Constraint	IAM			
IGA‑COR‑1	Identity correlation rules across HR, directory, and applications shall be defined	Constraint	IAM	RBAC‑REQ‑8.x	One identity per person	Parent requirement
IGA‑COR‑1.1	Attribute source precedence shall be defined and documented	Constraint	IAM	IGA‑COR‑1	Deterministic attribute values	Prevents flip‑flopping
IGA‑COR‑1.2	Correlation failures shall be detectable and reportable	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Visibility into identity risk	Supports audit and ops
IGA‑EXE‑1	Provisioning and deprovisioning failures shall be detectable and tracked	IGA Functional	IGA Platform	RBAC‑REQ‑8.3	Failed actions are visible	Parent requirement
IGA‑EXE‑1.1	Failed executions shall retain error context as evidence	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Audit defensibility	Includes retries
IGA‑EXE‑1.2	Failed deprovisioning shall be surfaced as elevated risk	IGA Functional	IGA Platform	RBAC‑REQ‑8.4	Prevents silent over‑access	Critical for SOX
