/**
 * importValidator.ts
 *
 * AJV-based schema validation for ZIP-restore and CSV imports.
 * Used by AdminPage (restore flow) to reject corrupt or incompatible backup files.
 *
 * Each validate* function returns a typed result so callers can surface
 * per-item errors as Sonner toasts rather than silently discarding data.
 */

import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

import requirementSchema from "../schemas/requirement.schema.json";
import frameworkSchema   from "../schemas/framework.schema.json";
import epicSchema        from "../schemas/epic.schema.json";

// ── AJV singleton (module-level, compiled once) ───────────────────────────

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validateRequirement: ValidateFunction = ajv.compile(requirementSchema);
const validateFramework:   ValidateFunction = ajv.compile(frameworkSchema);
const validateEpic:        ValidateFunction = ajv.compile(epicSchema);

// ── Public types ──────────────────────────────────────────────────────────

export interface ValidationResult<T> {
  /** Items that passed schema validation */
  valid: T[];
  /** Human-readable messages for items that failed */
  errors: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────

function validateArray<T>(
  items: unknown,
  validator: ValidateFunction,
  label: string,
): ValidationResult<T> {
  if (!Array.isArray(items)) {
    return {
      valid: [],
      errors: [`${label}: expected an array, got ${typeof items}`],
    };
  }

  const valid: T[] = [];
  const errors: string[] = [];

  items.forEach((item, idx) => {
    if (validator(item)) {
      valid.push(item as T);
    } else {
      const msgs = (validator.errors ?? [])
        .map((e) => `${e.instancePath || "/"} ${e.message}`)
        .join("; ");
      const id =
        item && typeof item === "object" && "id" in item
          ? String((item as Record<string, unknown>).id)
          : String(idx);
      errors.push(`${label}[${id}]: ${msgs}`);
    }
  });

  return { valid, errors };
}

// ── Public validators ─────────────────────────────────────────────────────

import type { Requirement }    from "../types/requirement";
import type { Framework }      from "../types/framework";
import type { Epic, UserStory } from "../types/epic";

export function validateRequirements(
  items: unknown,
): ValidationResult<Requirement> {
  return validateArray<Requirement>(items, validateRequirement, "Requirement");
}

export function validateFrameworks(
  items: unknown,
): ValidationResult<Framework> {
  return validateArray<Framework>(items, validateFramework, "Framework");
}

export function validateEpics(items: unknown): ValidationResult<Epic> {
  return validateArray<Epic>(items, validateEpic, "Epic");
}

/**
 * UserStory has no dedicated schema — pass-through with basic type guard.
 * AJV validation is added here for future extension.
 */
export function validateUserStories(
  items: unknown,
): ValidationResult<UserStory> {
  if (!Array.isArray(items)) {
    return {
      valid: [],
      errors: [`UserStory: expected an array, got ${typeof items}`],
    };
  }
  // Basic structural check: must have id + epicId + title
  const valid: UserStory[] = [];
  const errors: string[] = [];
  items.forEach((item, idx) => {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).id === "string" &&
      typeof (item as Record<string, unknown>).epicId === "string" &&
      typeof (item as Record<string, unknown>).title === "string"
    ) {
      valid.push(item as UserStory);
    } else {
      const id =
        item && typeof item === "object" && "id" in item
          ? String((item as Record<string, unknown>).id)
          : String(idx);
      errors.push(`UserStory[${id}]: missing required field id, epicId, or title`);
    }
  });
  return { valid, errors };
}

/**
 * Validate all collections in a restore payload in one call.
 * Returns aggregated errors and the cleaned payload ready for commit.
 */
export interface RestoreValidationResult {
  requirements: Requirement[];
  frameworks:   Framework[];
  epics:        Epic[];
  userStories:  UserStory[];
  /** All validation error messages across all collections */
  errors: string[];
  /** True if every item in every collection passed */
  allValid: boolean;
}

export function validateRestorePayload(payload: {
  requirements?: unknown;
  frameworks?:   unknown;
  epics?:        unknown;
  userStories?:  unknown;
}): RestoreValidationResult {
  const r = validateRequirements(payload.requirements ?? []);
  const f = validateFrameworks(payload.frameworks ?? []);
  const e = validateEpics(payload.epics ?? []);
  const s = validateUserStories(payload.userStories ?? []);

  const errors = [...r.errors, ...f.errors, ...e.errors, ...s.errors];

  return {
    requirements: r.valid,
    frameworks:   f.valid,
    epics:        e.valid,
    userStories:  s.valid,
    errors,
    allValid: errors.length === 0,
  };
}
