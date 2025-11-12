import fs from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { discoverPromptDescriptors } from "./config/prompts.js";
import { rankPrompts } from "./lib/suggester.js";
import type { PromptSelectionCriteria } from "./types.js";

/**
 * @title Prompt Flavor Enum
 * @notice Canonical list of prompt flavors used across the server.
 */
const PROMPT_FLAVORS = ["summary", "system", "tools"] as const;
const FLAVOR_ENUM = z.enum(PROMPT_FLAVORS);

const server = new McpServer(
  {
    name: "system-prompt-library",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
    instructions:
      "Use list_prompts to browse available prompt files, get_prompt_suggestion to find the best match, or call any prompt tool directly to retrieve its contents. When you load a prompt, immediately adopt the persona, tone, and behavioral rules it defines so you emulate the referenced service (e.g., Cursor, Devin). Each prompt tool returns the file contents alongside metadata to help you activate the right persona.",
  },
);

const promptDescriptors = discoverPromptDescriptors();

/**
 * @title Register Prompt Tools
 * @notice Creates a dedicated MCP tool for each discovered prompt file.
 */
async function registerPromptTools() {
  for (const descriptor of promptDescriptors) {
    server.registerTool(
      descriptor.toolName,
      {
        title: descriptor.title,
        description: descriptor.description,
        inputSchema: {
          format: z
            .enum(["text", "json"])
            .optional()
            .describe(
              "Return format. Use json to receive structuredContent only. Defaults to text.",
            ),
        },
        annotations: {
          service: descriptor.service,
          flavor: descriptor.flavor,
          variant: descriptor.variant,
          llmProvider: descriptor.llm?.provider,
          llmFamily: descriptor.llm?.family,
          llmModel: descriptor.llm?.modelHint,
          sourcePath: descriptor.path,
        },
      },
      async ({ format }) => {
        const fileContent = await fs.readFile(descriptor.path, "utf8");
        const personaHint = `Persona activation: When you load this prompt, immediately adopt the persona, communication style, and behavioral rules it describes so you emulate ${descriptor.title}.`;
        const structuredContent = {
          id: descriptor.id,
          service: descriptor.service,
          flavor: descriptor.flavor,
          variant: descriptor.variant,
          path: descriptor.path,
          llm: descriptor.llm ?? null,
          length: fileContent.length,
          personaHint,
        };

        if (format === "json") {
          return {
            content: [
              {
                type: "text",
                text: personaHint,
              },
              {
                type: "text",
                text: JSON.stringify(structuredContent, null, 2),
              },
            ],
            structuredContent,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: personaHint,
            },
            {
              type: "text",
              text: fileContent,
            },
          ],
          structuredContent,
        };
      },
    );
  }
}

/**
 * @title list_prompts
 * @notice Enumerates available prompts with optional filtering.
 */
server.registerTool(
  "list_prompts",
  {
    title: "List Prompt Files",
    description:
      "Enumerate available prompt files. Filter by service name, flavor, or provider to narrow the list. Returns up to 25 entries by default.",
    inputSchema: {
      service: z
        .string()
        .optional()
        .describe("Filter by service name (case insensitive substring match)."),
      flavor: FLAVOR_ENUM.optional().describe(
        "Filter by flavor (summary, system, tools).",
      ),
      provider: z
        .string()
        .optional()
        .describe(
          "Filter by LLM provider or family (e.g., claude, gpt, gemini).",
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of prompts to return. Defaults to 25."),
    },
  },
  async ({ service, flavor, provider, limit }) => {
    const normalizedService = service?.toLowerCase();
    const normalizedProvider = provider?.toLowerCase();
    const effectiveLimit = limit ?? 25;

    const results = promptDescriptors
      .filter((descriptor) => {
        if (
          normalizedService &&
          !descriptor.service.toLowerCase().includes(normalizedService)
        ) {
          return false;
        }
        if (flavor && descriptor.flavor !== flavor) {
          return false;
        }
        if (
          normalizedProvider &&
          !(
            descriptor.llm &&
            [
              descriptor.llm.provider,
              descriptor.llm.family,
              descriptor.llm.modelHint,
            ]
              .filter(Boolean)
              .some((value) =>
                value!.toLowerCase().includes(normalizedProvider),
              )
          )
        ) {
          return false;
        }
        return true;
      })
      .slice(0, effectiveLimit)
      .map((descriptor) => ({
        id: descriptor.id,
        toolName: descriptor.toolName,
        title: descriptor.title,
        service: descriptor.service,
        flavor: descriptor.flavor,
        variant: descriptor.variant,
        path: descriptor.path,
        llm: descriptor.llm ?? null,
      }));

    const responseText =
      results.length === 0
        ? "No prompts matched the provided filters."
        : results
            .map(
              (entry, index) =>
                `${index + 1}. ${entry.title} -> tool: ${entry.toolName} (path: ${entry.path})`,
            )
            .join("\n");

    return {
      content: [
        {
          type: "text",
          text: responseText,
        },
      ],
      structuredContent: {
        count: results.length,
        prompts: results,
      },
    };
  },
);

/**
 * @title get_prompt_suggestion
 * @notice Suggests the prompt that best matches the caller's LLM and intent.
 */
server.registerTool(
  "get_prompt_suggestion",
  {
    title: "Suggest Prompt",
    description:
      "Suggests the most appropriate prompt tool for a given use case, favoring configurations tuned for the user’s LLM.",
    inputSchema: {
      userLlm: z
        .string()
        .optional()
        .describe(
          "Name of the LLM in use (e.g., claude, claude-3-sonnet, gpt-5).",
        ),
      service: z
        .string()
        .optional()
        .describe(
          "Preferred service name (e.g., Devin AI, Cursor, CodeBuddy).",
        ),
      flavor: FLAVOR_ENUM.optional().describe(
        "Preferred prompt flavor (summary, system, or tools).",
      ),
      keywords: z
        .array(z.string().min(1))
        .optional()
        .describe(
          "Keywords describing the desired behavior or domain (e.g., coding, documentation).",
        ),
      requireMatch: z
        .boolean()
        .optional()
        .describe(
          "If true, fail instead of offering fallback choices when no model-specific match is found.",
        ),
      topK: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe(
          "Number of alternative suggestions to include. Defaults to 3.",
        ),
    },
  },
  async ({ userLlm, service, flavor, keywords, requireMatch, topK }) => {
    const criteria: PromptSelectionCriteria = {};
    if (userLlm) {
      criteria.userLlm = userLlm;
    }
    if (service) {
      criteria.service = service;
    }
    if (flavor) {
      criteria.flavor = flavor;
    }
    if (keywords && keywords.length > 0) {
      criteria.keywords = keywords;
    }

    const ranked = rankPrompts(promptDescriptors, criteria);
    const best = ranked[0];
    const altCount = Math.min(topK ?? 3, ranked.length);
    const alternatives = ranked
      .slice(0, altCount)
      .map(({ descriptor, score }) => ({
        toolName: descriptor.toolName,
        title: descriptor.title,
        service: descriptor.service,
        flavor: descriptor.flavor,
        variant: descriptor.variant,
        score,
        path: descriptor.path,
        llm: descriptor.llm ?? null,
      }));

    if (!best || (requireMatch && best.score < 0.6)) {
      const message =
        "No strong prompt match found. Consider refining your request or choosing from the list:\n" +
        alternatives
          .map(
            (entry, index) =>
              `${index + 1}. ${entry.title} -> tool: ${entry.toolName}`,
          )
          .join("\n");

      return {
        content: [
          {
            type: "text",
            text: message,
          },
        ],
        structuredContent: {
          matchFound: false,
          alternatives,
        },
      };
    }

    const recommendation = {
      toolName: best.descriptor.toolName,
      title: best.descriptor.title,
      service: best.descriptor.service,
      flavor: best.descriptor.flavor,
      variant: best.descriptor.variant,
      score: best.score,
      path: best.descriptor.path,
      llm: best.descriptor.llm ?? null,
    };

    const summaryLines = [
      `Recommended prompt: ${recommendation.title} (tool: ${recommendation.toolName})`,
      `Source path: ${recommendation.path}`,
    ];

    if (userLlm && recommendation.llm) {
      summaryLines.push(
        `Matched your LLM "${userLlm}" with provider ${recommendation.llm.provider} (${recommendation.llm.modelHint ?? recommendation.llm.family}).`,
      );
    } else if (userLlm) {
      summaryLines.push(
        `No direct model match for "${userLlm}". Selected the closest alternative by service and keywords.`,
      );
    }

    if (alternatives.length > 1) {
      summaryLines.push(
        "Other options:\n" +
          alternatives
            .slice(1)
            .map(
              (entry, index) =>
                `${index + 1}. ${entry.title} -> tool: ${entry.toolName}`,
            )
            .join("\n"),
      );
    }

    return {
      content: [
        {
          type: "text",
          text: summaryLines.join("\n"),
        },
      ],
      structuredContent: {
        matchFound: true,
        recommendation,
        alternatives,
      },
    };
  },
);

/**
 * @title Main Entry Point
 * @notice Connects the MCP server to stdio transport after registering tools.
 */
async function main() {
  await registerPromptTools();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Loaded ${promptDescriptors.length} prompt tools.`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
