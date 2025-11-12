/**
 * @title Prompt Typings
 * @notice Shared structures used by the MCP server to describe prompt metadata and selection filters.
 */
export type PromptFlavor = "summary" | "system" | "tools";

/**
 * @title LLM Metadata
 * @notice Captures vendor and model hints so clients can prioritise prompts that match the current model.
 */
export interface LlmMetadata {
  provider: string;
  family: string;
  modelHint?: string;
}

/**
 * @title Prompt Descriptor
 * @notice Encapsulates the metadata for a single prompt file discovered on disk.
 */
export interface PromptDescriptor {
  id: string;
  service: string;
  flavor: PromptFlavor;
  variant: string;
  path: string;
  toolName: string;
  title: string;
  description: string;
  llm?: LlmMetadata;
}

/**
 * @title Prompt Selection Criteria
 * @notice Defines optional filters used when ranking or listing available prompts.
 */
export interface PromptSelectionCriteria {
  userLlm?: string;
  service?: string;
  flavor?: PromptFlavor;
  keywords?: string[];
}
