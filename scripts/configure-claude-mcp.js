#!/usr/bin/env node

/**
 * Postinstall helper that ensures the system-prompts MCP server
 * is registered in Claude Desktop's configuration.
 *
 * - Sets the command to `node` so the user's active Node.js version is used.
 * - Populates args with the repo's compiled entrypoint.
 * - Points PROMPT_LIBRARY_ROOT at the repository prompt directory when available.
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const CLAUDE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Claude",
  "claude_desktop_config.json",
);

const MCP_SERVER_KEY = "system-prompts-mcp";
const repoRoot = process.cwd();
const distEntry = path.join(repoRoot, "dist", "index.js");
const promptRoot = path.join(repoRoot, "prompts");

function ensureConfigFile() {
  if (!fs.existsSync(CLAUDE_CONFIG_PATH)) {
    fs.mkdirSync(path.dirname(CLAUDE_CONFIG_PATH), { recursive: true });
    fs.writeFileSync(
      CLAUDE_CONFIG_PATH,
      JSON.stringify({ mcpServers: {} }, null, 2),
    );
  }
}

function loadConfig() {
  try {
    const raw = fs.readFileSync(CLAUDE_CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(
      "[system-prompts-mcp] Unable to read Claude config. Skipping MCP registration.",
      error,
    );
    return undefined;
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(
      `[system-prompts-mcp] Updated Claude MCP config at ${CLAUDE_CONFIG_PATH}`,
    );
  } catch (error) {
    console.warn(
      "[system-prompts-mcp] Failed to write Claude config. Skipping MCP registration.",
      error,
    );
  }
}

function main() {
  ensureConfigFile();
  const config = loadConfig();
  if (!config) return;

  const mcpServers = config.mcpServers ?? {};
  const env = {};

  if (fs.existsSync(promptRoot) && fs.statSync(promptRoot).isDirectory()) {
    env.PROMPT_LIBRARY_ROOT = promptRoot;
  }

  mcpServers[MCP_SERVER_KEY] = {
    command: "node",
    args: [distEntry],
    ...(Object.keys(env).length > 0 ? { env } : {}),
  };

  config.mcpServers = mcpServers;
  saveConfig(config);
}

main();
