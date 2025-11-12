import type { PromptDescriptor, PromptSelectionCriteria } from "../types.js";
import { llmMatchScore, normalizeUserLlmName } from "./llmMetadata.js";

/**
 * @title Keyword Score
 * @notice Rewards prompts whose metadata contains the caller's keywords.
 */
function keywordScore(
  descriptor: PromptDescriptor,
  keywords: string[] | undefined,
): number {
  if (!keywords || keywords.length === 0) return 0;

  const haystack =
    `${descriptor.service} ${descriptor.variant} ${descriptor.title} ${descriptor.description}`.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      score += 0.4;
    }
  }

  return score;
}

/**
 * @title Flavor Score
 * @notice Prefers prompts that match the requested flavor (system/summary/tools).
 */
function flavorScore(
  descriptor: PromptDescriptor,
  flavor?: PromptDescriptor["flavor"],
): number {
  if (!flavor) return descriptor.flavor === "system" ? 0.5 : 0.25;
  return descriptor.flavor === flavor ? 0.6 : 0.1;
}

/**
 * @title Rank Prompts
 * @notice Produces a sorted list of prompts scored against the caller's criteria.
 * @param descriptors Available prompt descriptors.
 * @param criteria Filters describing the desired persona.
 */
export function rankPrompts(
  descriptors: PromptDescriptor[],
  criteria: PromptSelectionCriteria,
): Array<{ descriptor: PromptDescriptor; score: number }> {
  const normalizedKeywords = criteria.keywords
    ?.map((keyword) => keyword.trim())
    .filter(Boolean);
  const normalizedService = criteria.service
    ? criteria.service.trim().toLowerCase()
    : undefined;
  const normalizedUserLlm = normalizeUserLlmName(criteria.userLlm);

  return descriptors
    .map((descriptor) => {
      let score = 0;

      if (normalizedService) {
        const serviceMatch = descriptor.service
          .toLowerCase()
          .includes(normalizedService);
        score += serviceMatch ? 1.5 : 0.2;
      }

      score += llmMatchScore(normalizedUserLlm, descriptor.llm);
      score += flavorScore(descriptor, criteria.flavor);
      score += keywordScore(descriptor, normalizedKeywords);

      return { descriptor, score };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * @title Find Best Prompt
 * @notice Returns the highest-scoring prompt, if any exceeds a minimum score.
 */
export function findBestPrompt(
  descriptors: PromptDescriptor[],
  criteria: PromptSelectionCriteria,
): { descriptor: PromptDescriptor; score: number } | undefined {
  const ranked = rankPrompts(descriptors, criteria);
  return ranked[0] && ranked[0].score > 0 ? ranked[0] : undefined;
}
