import path from "node:path";
import type { LlmMetadata, PromptFlavor } from "../types.js";

/**
 * @title Provider Guess Mapping
 * @notice Regex heuristics that map filenames to likely LLM providers.
 */
type ProviderGuess = {
  family: string;
  provider: string;
  patterns: RegExp[];
};

const PROVIDER_GUESSES: ProviderGuess[] = [
  {
    family: "anthropic",
    provider: "anthropic",
    patterns: [/claude/i, /sonnet/i, /opus/i, /haiku/i, /anthropic/i],
  },
  {
    family: "openai",
    provider: "openai",
    patterns: [/gpt/i, /o1/i, /openai/i, /o3/i],
  },
  {
    family: "google",
    provider: "google",
    patterns: [/gemini/i, /google/i, /gems/i],
  },
  {
    family: "perplexity",
    provider: "perplexity",
    patterns: [/perplexity/i, /sonar/i],
  },
  {
    family: "cohere",
    provider: "cohere",
    patterns: [/command/i, /cohere/i],
  },
  {
    family: "meta",
    provider: "meta",
    patterns: [/llama/i, /codellama/i],
  },
  {
    family: "xai",
    provider: "xai",
    patterns: [/grok/i, /xai/i],
  },
  {
    family: "mistral",
    provider: "mistral",
    patterns: [/mistral/i, /mixtral/i],
  },
];

/**
 * @title Model Regex
 * @notice Identifies potential model names within filenames for extra hints.
 */
const MODEL_NAME_REGEX = /([a-z]+[-_\s]*\d+(?:\.\d+)?(?:[-_\s]*\w+)?)/i;

/**
 * @title Infer Variant From Filename
 * @notice Coerces a prompt filename into a variant label, avoiding empty strings.
 * @param filename Target filename.
 * @param flavor Prompt flavor (summary/system/tools).
 */
export function inferVariantFromFilename(
  filename: string,
  flavor: PromptFlavor,
): string {
  if (flavor === "summary") {
    return "summary";
  }

  const base = path.basename(filename, path.extname(filename));
  const normalized = base.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  return normalized || base;
}

/**
 * @title Infer LLM Metadata
 * @notice Uses heuristics to guess the best-fitting LLM provider and model for a prompt.
 * @param service Service name derived from directory structure.
 * @param filename Prompt filename.
 * @param flavor Prompt flavor (summary/system/tools).
 */
export function inferLlmMetadata(
  service: string,
  filename: string,
  flavor: PromptFlavor,
): LlmMetadata | undefined {
  const basename = path.basename(filename).toLowerCase();
  const haystack = [service, filename].join(" ").toLowerCase();

  if (flavor === "summary") {
    // Summaries can apply to multiple models; prefer undefined to signal neutrality.
    return undefined;
  }

  for (const guess of PROVIDER_GUESSES) {
    if (guess.patterns.some((pattern) => pattern.test(haystack))) {
      const match = basename.match(MODEL_NAME_REGEX);
      const modelHint = match?.[1]?.replace(/[_\s]/g, "-")?.toLowerCase();
      const metadata: LlmMetadata = {
        provider: guess.provider,
        family: guess.family,
      };
      if (modelHint) {
        metadata.modelHint = modelHint;
      }

      return metadata;
    }
  }

  return undefined;
}

/**
 * @title Normalize User LLM Name
 * @notice Cleans user-provided model identifiers prior to matching.
 * @param raw User supplied LLM label.
 */
export function normalizeUserLlmName(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.trim().toLowerCase();
}

/**
 * @title LLM Match Score
 * @notice Produces a fuzzy score describing how well metadata aligns with the user's model.
 * @param userLlm Normalised user model text.
 * @param metadata Metadata inferred for a prompt.
 */
export function llmMatchScore(
  userLlm: string | undefined,
  metadata?: LlmMetadata,
): number {
  if (!userLlm) return metadata ? 0.25 : 0.1;
  if (!metadata) return 0.05;

  const normalizedUser = normalizeUserLlmName(userLlm);
  if (!normalizedUser) return 0.05;

  const valuesToCheck = [metadata.family, metadata.provider, metadata.modelHint]
    .filter(Boolean)
    .map((value) => value!.toLowerCase());

  if (valuesToCheck.some((value) => normalizedUser.includes(value))) {
    return 1;
  }

  return valuesToCheck.some((value) => value && value.includes(normalizedUser))
    ? 0.75
    : 0.1;
}
