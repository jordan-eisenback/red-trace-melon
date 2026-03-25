import type { UserStory } from '../types/epic';
import type { StoryMapOutcome, StoryMapStep } from '../types/storymap';

// ─── keyword extraction ───────────────────────────────────────────────────────
// Meaningful domain terms extracted from a string (lower-cased, stop-words removed)
const STOP_WORDS = new Set([
  'the','a','an','and','or','of','to','in','for','with','on','at','by','from',
  'is','are','be','been','being','was','were','has','have','had','do','does',
  'did','will','shall','should','would','could','may','might','must','that',
  'this','these','those','it','its','as','all','any','each','if','than','then',
  'so','but','not','no','only','also','into','via','per','both','their','they',
  'we','us','our','user','users','system','access','based','role','roles',
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))
  );
}

// ─── scoring ─────────────────────────────────────────────────────────────────
export interface AutoLinkScore {
  storyId: string;
  score: number;            // 0–100
  reasons: string[];
}

export interface AutoLinkResult {
  stepId: string;
  matches: AutoLinkScore[];  // sorted highest first, score >= threshold
}

export interface AutoLinkSummary {
  linked: number;   // steps that got at least one new link
  total: number;    // new links added
}

function scoreStoryForStep(step: StoryMapStep, story: UserStory): AutoLinkScore {
  let score = 0;
  const reasons: string[] = [];

  // 1. Requirement overlap  (highest signal — exact ID match)
  if (step.requirementId && story.requirements.includes(step.requirementId)) {
    score += 50;
    reasons.push(`req: ${step.requirementId}`);
  }

  // 2. Keyword overlap between step title and story title+description
  const stepKw  = keywords(step.title + ' ' + (step.description ?? ''));
  const storyKw = keywords(story.title + ' ' + (story.description ?? ''));
  const shared  = [...stepKw].filter(w => storyKw.has(w));
  if (shared.length > 0) {
    // up to 40 pts — more shared keywords = higher score, but diminishing
    const kwScore = Math.min(40, shared.length * 8);
    score += kwScore;
    reasons.push(`keywords: ${shared.slice(0, 5).join(', ')}`);
  }

  // 3. Compliance tag ↔ story title/description keyword match
  //    e.g. step has ['SOC2'] and story mentions "SOC" or "audit"
  const COMPLIANCE_SYNONYMS: Record<string, string[]> = {
    SOC2:     ['soc2','soc','audit','evidence','attestation'],
    ISO27001: ['iso27001','iso','isms','information security'],
    SOX:      ['sox','sarbanes','financial','audit'],
    GDPR:     ['gdpr','privacy','data protection','personal data'],
    HIPAA:    ['hipaa','health','phi','medical'],
    NIST:     ['nist','nist800','cybersecurity framework'],
  };
  const storyText = (story.title + ' ' + story.description).toLowerCase();
  for (const tag of step.complianceTags ?? []) {
    const synonyms = COMPLIANCE_SYNONYMS[tag] ?? [tag.toLowerCase()];
    if (synonyms.some(s => storyText.includes(s))) {
      score += 10;
      reasons.push(`compliance: ${tag}`);
      break;  // only add once
    }
  }

  return { storyId: story.id, score, reasons };
}

// ─── public API ──────────────────────────────────────────────────────────────

export interface AutoLinkOptions {
  /** Minimum score (0–100) to create a link. Default: 16 */
  threshold?: number;
  /** Maximum stories to link per step. Default: 5 */
  maxPerStep?: number;
  /** If true, skip steps that already have linked stories. Default: false */
  skipAlreadyLinked?: boolean;
}

/**
 * Returns a map of stepId → ordered list of story IDs that should be linked.
 * Does NOT mutate anything — callers apply the result via `linkStoryToStep`.
 */
export function computeAutoLinks(
  outcomes: StoryMapOutcome[],
  stories: UserStory[],
  options: AutoLinkOptions = {}
): Map<string, string[]> {
  const {
    threshold    = 16,
    maxPerStep   = 5,
    skipAlreadyLinked = false,
  } = options;

  const result = new Map<string, string[]>();

  for (const outcome of outcomes) {
    for (const activity of outcome.activities) {
      for (const step of activity.steps) {
        if (skipAlreadyLinked && (step.linkedStoryIds?.length ?? 0) > 0) continue;

        const already = new Set(step.linkedStoryIds ?? []);
        const scores: AutoLinkScore[] = stories
          .filter(s => !already.has(s.id))
          .map(s => scoreStoryForStep(step, s))
          .filter(s => s.score >= threshold)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxPerStep);

        if (scores.length > 0) {
          result.set(step.id, scores.map(s => s.storyId));
        }
      }
    }
  }

  return result;
}

/**
 * Preview: returns per-step match detail (for a confirmation dialog).
 */
export function previewAutoLinks(
  outcomes: StoryMapOutcome[],
  stories: UserStory[],
  options: AutoLinkOptions = {}
): AutoLinkResult[] {
  const { threshold = 16, maxPerStep = 5, skipAlreadyLinked = false } = options;
  const results: AutoLinkResult[] = [];

  for (const outcome of outcomes) {
    for (const activity of outcome.activities) {
      for (const step of activity.steps) {
        if (skipAlreadyLinked && (step.linkedStoryIds?.length ?? 0) > 0) continue;

        const already = new Set(step.linkedStoryIds ?? []);
        const matches: AutoLinkScore[] = stories
          .filter(s => !already.has(s.id))
          .map(s => scoreStoryForStep(step, s))
          .filter(s => s.score >= threshold)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxPerStep);

        if (matches.length > 0) {
          results.push({ stepId: step.id, matches });
        }
      }
    }
  }

  return results;
}
