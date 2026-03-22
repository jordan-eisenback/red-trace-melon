# Naming Convention Update - Type Prefix Pattern

## Overview
Updated all requirement IDs to follow a systematic **Type Prefix Pattern** that immediately identifies the requirement type and domain.

## Naming Pattern: `[TYPE]-[DOMAIN]-[NUMBER]`

### Type Prefixes
- **ENT** - Enterprise Requirements
- **CAP** - Capability Requirements
- **FUNC** - IGA Functional Requirements
- **INTFC** - Interface/Functional Requirements
- **CNST** - Constraint Requirements
- **NFR** - Non-Functional Requirements
- **TRNS** - Transition Requirements
- **OPT** - Optional Capability Requirements

### Domain/Subject Codes
- **RBAC** - Role-Based Access Control
- **IGA** - Identity Governance & Administration
- **DIR** - Directory Services
- **WD** - Workday
- **DG** - Data Governance
- **DISC** - Discovery
- **PART** - Partner

## Complete Mapping (Old → New)

### Enterprise Requirements (6)
| Old ID | New ID | Description |
|--------|--------|-------------|
| RBAC-REQ-E1 | RBAC-ENT-001 | Enterprise role-based access governance model |
| RBAC-REQ-E2 | RBAC-ENT-002 | Least privilege enforcement |
| RBAC-REQ-E3 | RBAC-ENT-003 | Full access lifecycle governance |
| RBAC-REQ-E4 | RBAC-ENT-004 | Audit evidence production |
| RBAC-REQ-E5 | RBAC-ENT-005 | Scalable onboarding |
| RBAC-REQ-E6 | RBAC-ENT-006 | Governance/execution separation |

### Capability Requirements (14)
| Old ID | New ID | Description |
|--------|--------|-------------|
| RBAC-REQ-1.1 | RBAC-CAP-101 | Standardized discovery model |
| RBAC-REQ-1.9 | RBAC-CAP-102 | Discovery artifacts retention |
| RBAC-REQ-2.1 | RBAC-CAP-103 | Business role definition |
| RBAC-REQ-2.4 | RBAC-CAP-104 | Role lifecycle states |
| RBAC-REQ-2.7 | RBAC-CAP-105 | Role composition |
| RBAC-REQ-3.3 | RBAC-CAP-106 | Privileged entitlement flagging |
| RBAC-REQ-4.1 | RBAC-CAP-107 | Role-based access requests |
| RBAC-REQ-5.1 | RBAC-CAP-108 | Periodic certifications |
| RBAC-REQ-5.6 | RBAC-CAP-109 | Auto-revocation on lifecycle change |
| RBAC-REQ-7.1 | RBAC-CAP-110 | Who-has-access reporting |
| RBAC-REQ-8.1 | RBAC-CAP-111 | IGA execution dependency |
| RBAC-REQ-8.3 | RBAC-CAP-112 | IGA provisioning execution |
| RBAC-REQ-8.4 | RBAC-CAP-113 | IGA audit evidence retention |
| RBAC-DISC-1.5 | RBAC-CAP-109 | Discovery tool output retention |

### IGA Functional Requirements (11)
| Old ID | New ID | Description |
|--------|--------|-------------|
| FR-1.1 | RBAC-IGA-001 | Hybrid identity environments |
| FR-2.3 | RBAC-IGA-002 | Standard integration patterns |
| FR-3.1 | RBAC-IGA-003 | Account/entitlement ingestion |
| FR-3.3 | RBAC-IGA-004 | Privileged entitlement flagging |
| FR-4.1 | RBAC-IGA-005 | ServiceNow request intake |
| FR-7.4 | RBAC-IGA-006 | Directory drift detection |
| FR-7.10 | RBAC-IGA-007 | Auto-revocation after certification |
| IGA-COR-1.2 | RBAC-IGA-008 | Correlation failure detection |
| IGA-EXE-1 | RBAC-IGA-009 | Provisioning failure detection |
| IGA-EXE-1.2 | RBAC-IGA-010 | Failed deprovisioning surfacing |
| RBAC-DG-1.3 | FUNC-DG-01 | Discovery data auditability |

### Directory Services (4)
| Old ID | New ID | Description |
|--------|--------|-------------|
| DIR-INT-1 | RBAC-INT-005 | IGA/directory integration |
| DIR-2.1 | RBAC-INT-008 | Directory group provisioning |
| DIR-3.1 | RBAC-INT-010 | Out-of-band change detection |
| DIR-6.1 | RBAC-INT-012 | Directory event logging |

### Constraint Requirements (8)
| Old ID | New ID | Description |
|--------|--------|-------------|
| DIR-7.1 | CNST-DIR-01 | IGA not responsible for runtime auth |
| IGA-COR-1 | RBAC-IGA-025 | Identity correlation rules |
| RBAC-DISC-1.4 | CNST-DISC-01 | Governance approval for AI roles |
| RBAC-IMP-P1.1 | CNST-PART-01 | Partner governance controls |
| RBAC-IMP-P1.2 | CNST-PART-02 | Partner approval restrictions |
| RBAC-DG-1 | CNST-DG-01 | Data governance compliance |
| RBAC-DG-1.1 | CNST-DG-02 | Data minimization |
| RBAC-DG-1.2 | CNST-DG-03 | Retention period limits |

### Non-Functional Requirements (4)
| Old ID | New ID | Description |
|--------|--------|-------------|
| NFR-1.1 | NFR-IGA-01 | Support tier definitions |
| NFR-2.2 | NFR-IGA-02 | Change advance notice |
| NFR-3.1 | NFR-IGA-03 | Identity-based licensing |
| NFR-4.3 | NFR-IGA-04 | Transition disruption minimization |

### Transition Requirements (5)
| Old ID | New ID | Description |
|--------|--------|-------------|
| TR-WD-1 | RBAC-INT-001 | Workday as HR SoR |
| TR-WD-2 | RBAC-INT-002 | Workday attribute ingestion |
| TR-WD-3 | RBAC-INT-003 | RBAC eligibility remapping |
| TR-WD-4 | RBAC-INT-004 | Workday access governance |
| RBAC-IMP-P1 | TRNS-PART-01 | Partner implementation support |

### Optional Discovery Requirements (4)
| Old ID | New ID | Description |
|--------|--------|-------------|
| RBAC-DISC-1 | OPT-DISC-01 | Optional discovery tool |
| RBAC-DISC-1.1 | OPT-DISC-02 | Access log ingestion |
| RBAC-DISC-1.2 | OPT-DISC-03 | HR attribute correlation |
| RBAC-DISC-1.3 | OPT-DISC-04 | Candidate role proposals |

## Updated Files

1. **`/src/app/data/initial-requirements.ts`** - All 57 requirement IDs and parent references
2. **`/src/app/data/initial-frameworks.ts`** - All framework control mappings (SOX, NIST, ISO, COBIT)
3. **`/src/app/data/initial-epics.ts`** - All Epic and User Story requirement references
4. **`/src/app/components/RequirementValidationPanel.tsx`** - Removed outdated ID pattern validation

## Benefits

✅ **Immediate Type Recognition** - Know if it's ENT, CAP, FUNC, CNST, etc. at a glance  
✅ **Clear Domain Grouping** - RBAC vs IGA vs DIR vs WD requirements are obvious  
✅ **Consistent Numbering** - Sequential numbering within each type-domain combination  
✅ **Better Sorting** - Requirements naturally group by type in alphabetical sorts  
✅ **Framework Traceability** - Easier to map requirements to compliance frameworks  
✅ **Scalability** - Clear pattern for adding new requirements  

## Total Count: 57 Requirements

- **Enterprise**: 6
- **Capability**: 14 (13 RBAC + 1 Discovery)
- **IGA Functional**: 11 (10 IGA + 1 Data Governance)
- **Interface**: 1 (Directory)
- **Directory Functional**: 3
- **Constraints**: 8 (1 DIR, 1 IGA, 1 DISC, 2 PART, 3 DG)
- **Non-Functional**: 4
- **Transition**: 5 (4 Workday + 1 Partner)
- **Optional**: 4 (Discovery)

## Migration Notes

- All parent references have been updated to use new IDs
- All framework control mappings updated (24 controls across 4 frameworks)
- All Epic requirements updated (10 Epics)
- All User Story requirements updated (17 User Stories)
- Validation panel no longer enforces old RBAC-REQ-* pattern
