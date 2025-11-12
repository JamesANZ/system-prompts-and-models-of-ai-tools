import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PromptDescriptor, PromptFlavor } from "../types.js";
import {
  inferLlmMetadata,
  inferVariantFromFilename,
} from "../lib/llmMetadata.js";
import { slugifyWithLimit, toTitleCase } from "../lib/slug.js";

/**
 * @title Prompt Discovery Constants
 * @notice Extension and filename filters used during filesystem scanning.
 */
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".yaml", ".yml", ".json"]);
const SUMMARY_FILENAMES = new Set(["summary.md"]);
const IGNORED_FILES = new Set(["readme.md", "view-thread-yaml.png"]);

/**
 * @title Resolve Prompt Root
 * @notice Chooses the directory that should be scanned for prompts.
 */
function resolveRoot(): string {
  const explicit = process.env.PROMPT_LIBRARY_ROOT;
  if (explicit) {
    return path.resolve(explicit);
  }

  const currentFile = fileURLToPath(import.meta.url);
  const repoRoot = path.resolve(path.dirname(currentFile), "../../..");
  const promptsDir = path.join(repoRoot, "prompts");

  if (fs.existsSync(promptsDir) && fs.statSync(promptsDir).isDirectory()) {
    return promptsDir;
  }

  return repoRoot;
}

/**
 * @title Classify Flavor
 * @notice Determines whether a file is a summary, system prompt, or tool definition.
 */
function classifyFlavor(filename: string): PromptFlavor {
  const lower = filename.toLowerCase();

  if (SUMMARY_FILENAMES.has(lower)) {
    return "summary";
  }

  if (lower.includes("tool") || lower.endsWith(".json")) {
    return "tools";
  }

  return "system";
}

/**
 * @title Create Prompt Descriptor
 * @notice Builds metadata for a single prompt file encountered during traversal.
 */
function createPromptDescriptor(
  serviceSegments: string[],
  absolutePath: string,
  flavor: PromptFlavor,
): PromptDescriptor | undefined {
  if (serviceSegments.length === 0) {
    return undefined;
  }

  const filename = path.basename(absolutePath);
  const ext = path.extname(filename).toLowerCase();

  if (!TEXT_EXTENSIONS.has(ext)) {
    return undefined;
  }
  if (IGNORED_FILES.has(filename.toLowerCase())) {
    return undefined;
  }

  const variant = inferVariantFromFilename(filename, flavor);
  const [service, ...variantPrefixes] = serviceSegments;
  if (!service) {
    return undefined;
  }

  const serviceTitle = toTitleCase(service);
  const prefixTitle = variantPrefixes
    .map(toTitleCase)
    .filter(Boolean)
    .join(" ");

  const variantTitle =
    prefixTitle && variant.toLowerCase() !== "summary"
      ? `${prefixTitle} ${toTitleCase(variant)}`
      : prefixTitle && variant.toLowerCase() === "summary"
        ? `${prefixTitle} Summary`
        : toTitleCase(variant);

  const llmMetadata = inferLlmMetadata(service, filename, flavor);

  const flavorLabel =
    flavor === "system"
      ? "System Prompt"
      : flavor === "summary"
        ? "Summary"
        : "Tooling";
  const titleParts = [
    serviceTitle,
    variant === "summary" && !prefixTitle ? "" : variantTitle,
    flavorLabel,
  ].filter(Boolean);
  const title = titleParts.join(" ").trim();

  const slugSegments = new Set<string>();
  slugSegments.add(serviceTitle);
  if (
    !(
      flavor === "summary" &&
      variant.toLowerCase() === "summary" &&
      !prefixTitle
    )
  ) {
    slugSegments.add(variantTitle);
  }
  slugSegments.add(flavor === "system" ? "system" : flavor);
  const slugBase = Array.from(slugSegments).filter(Boolean).join("-");
  const toolName = slugifyWithLimit(slugBase, absolutePath, 60);

  const descriptionSegments = [
    `Return the ${flavorLabel.toLowerCase()} for ${serviceTitle}${
      variantTitle && (!prefixTitle || variant.toLowerCase() !== "summary")
        ? ` (${variantTitle})`
        : ""
    }.`,
    `Source: ${absolutePath}`,
  ];

  if (llmMetadata) {
    descriptionSegments.push(
      `Optimized for ${llmMetadata.provider} (${llmMetadata.modelHint ?? llmMetadata.family}).`,
    );
  } else {
    descriptionSegments.push("Applies broadly across models.");
  }

  return {
    id: toolName,
    service: serviceTitle,
    flavor,
    variant,
    path: absolutePath,
    toolName,
    title,
    description: descriptionSegments.join(" "),
    ...(llmMetadata ? { llm: llmMetadata } : {}),
  };
}

/**
 * @title Discover Prompt Descriptors
 * @notice Recursively walks the prompt root and returns metadata for each prompt file.
 */
export function discoverPromptDescriptors(
  rootDir?: string,
): PromptDescriptor[] {
  const resolvedRoot = rootDir ? path.resolve(rootDir) : resolveRoot();
  const descriptors: PromptDescriptor[] = [];
  const queue: string[] = [resolvedRoot];

  while (queue.length > 0) {
    const currentDir = queue.pop();
    if (!currentDir) {
      continue;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        queue.push(absolutePath);
        continue;
      }

      const relativePath = path.relative(resolvedRoot, absolutePath);
      const segments = relativePath.split(path.sep).filter(Boolean);
      if (segments.length === 0) {
        continue;
      }

      const directories = segments.slice(0, -1);
      const filename = segments[segments.length - 1]!;

      const fallbackBase = path.basename(filename, path.extname(filename));
      const fallbackService =
        fallbackBase.length > 0 ? fallbackBase : path.basename(currentDir);
      const serviceSegments: string[] =
        directories.length > 0 ? [...directories] : [fallbackService];

      const flavor = classifyFlavor(filename);
      const descriptor = createPromptDescriptor(
        serviceSegments,
        absolutePath,
        flavor,
      );
      if (descriptor) {
        descriptors.push(descriptor);
      }
    }
  }

  return descriptors.sort((a, b) => a.toolName.localeCompare(b.toolName));
}
